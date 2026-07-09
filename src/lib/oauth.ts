import crypto from 'crypto';

// ============================================================================
// OAuth 2.0 / OpenID Connect — Google, GitHub, Microsoft
// Hand-rolled authorization-code flow (state + PKCE), no external deps.
// ============================================================================

export type OAuthProviderId = 'google' | 'github' | 'microsoft';

// Short-lived cookie holding the sealed { state, codeVerifier, callbackUrl }
// between the start of the flow and the provider callback.
export const OAUTH_STATE_COOKIE = 'rgap_oauth_state';

export interface OAuthProfile {
    providerAccountId: string;
    email: string | null;
    emailVerified: boolean;
    name: string | null;
}

interface ProviderConfig {
    label: string;
    authorizeUrl: string;
    tokenUrl: string;
    scope: string;
    // GitHub OAuth apps don't support PKCE; Google/Microsoft do.
    pkce: boolean;
    clientIdEnv: string;
    clientSecretEnv: string;
}

export const OAUTH_PROVIDERS: Record<OAuthProviderId, ProviderConfig> = {
    google: {
        label: 'Google',
        authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token',
        scope: 'openid email profile',
        pkce: true,
        clientIdEnv: 'GOOGLE_CLIENT_ID',
        clientSecretEnv: 'GOOGLE_CLIENT_SECRET',
    },
    github: {
        label: 'GitHub',
        authorizeUrl: 'https://github.com/login/oauth/authorize',
        tokenUrl: 'https://github.com/login/oauth/access_token',
        scope: 'read:user user:email',
        pkce: false,
        clientIdEnv: 'GITHUB_CLIENT_ID',
        clientSecretEnv: 'GITHUB_CLIENT_SECRET',
    },
    microsoft: {
        label: 'Microsoft',
        // 'common' tenant: personal (Outlook/Hotmail/Live) and work/school accounts
        authorizeUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
        tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
        scope: 'openid email profile',
        pkce: true,
        clientIdEnv: 'MICROSOFT_CLIENT_ID',
        clientSecretEnv: 'MICROSOFT_CLIENT_SECRET',
    },
};

export function isOAuthProvider(value: string): value is OAuthProviderId {
    return value in OAUTH_PROVIDERS;
}

function getCredentials(provider: OAuthProviderId) {
    const config = OAUTH_PROVIDERS[provider];
    const clientId = process.env[config.clientIdEnv];
    const clientSecret = process.env[config.clientSecretEnv];
    if (!clientId || !clientSecret) {
        throw new Error(`OAuth provider "${provider}" is not configured. Set ${config.clientIdEnv} and ${config.clientSecretEnv}.`);
    }
    return { clientId, clientSecret };
}

// Resolve the public base URL for this deployment. Prefer an explicitly
// configured canonical URL (keeps redirect_uri stable and easy to register with
// each provider), but fall back to the real request origin so production still
// works when NEXT_PUBLIC_APP_URL is unset — the previous localhost fallback
// silently broke OAuth in prod. Honors reverse-proxy forwarded headers.
export function getRequestBaseUrl(request: Request): string {
    const configured = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, '');
    if (configured && !configured.includes('localhost')) return configured;

    const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
    if (host) {
        const proto = request.headers.get('x-forwarded-proto') || (host.startsWith('localhost') ? 'http' : 'https');
        return `${proto}://${host}`;
    }

    return configured || 'http://localhost:3000';
}

export function getRedirectUri(provider: OAuthProviderId, baseUrl: string): string {
    return `${baseUrl.replace(/\/+$/, '')}/api/auth/oauth/${provider}/callback`;
}

function base64UrlEncode(buffer: Buffer): string {
    return buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// ============================================================================
// Step 1: Build the authorization URL (+ the transient values to remember)
// ============================================================================
export function buildAuthorizationRequest(provider: OAuthProviderId, baseUrl: string) {
    const config = OAUTH_PROVIDERS[provider];
    const { clientId } = getCredentials(provider);

    const state = base64UrlEncode(crypto.randomBytes(32));
    const codeVerifier = base64UrlEncode(crypto.randomBytes(32));

    const url = new URL(config.authorizeUrl);
    url.searchParams.set('client_id', clientId);
    url.searchParams.set('redirect_uri', getRedirectUri(provider, baseUrl));
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', config.scope);
    url.searchParams.set('state', state);

    if (config.pkce) {
        const challenge = base64UrlEncode(crypto.createHash('sha256').update(codeVerifier).digest());
        url.searchParams.set('code_challenge', challenge);
        url.searchParams.set('code_challenge_method', 'S256');
    }

    return { url: url.toString(), state, codeVerifier };
}

// ============================================================================
// Step 2: Exchange the authorization code for tokens
// ============================================================================
async function exchangeCode(provider: OAuthProviderId, code: string, codeVerifier: string, baseUrl: string) {
    const config = OAUTH_PROVIDERS[provider];
    const { clientId, clientSecret } = getCredentials(provider);

    const body = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: getRedirectUri(provider, baseUrl),
    });
    if (config.pkce) body.set('code_verifier', codeVerifier);

    const response = await fetch(config.tokenUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json', // GitHub returns form-encoded unless asked for JSON
        },
        body,
    });

    const tokens = await response.json();
    if (!response.ok || tokens.error) {
        console.error(`OAuth token exchange failed for ${provider}:`, tokens.error || response.status);
        throw new Error('Token exchange failed');
    }

    return tokens as { access_token?: string; id_token?: string };
}

interface IdTokenClaims {
    sub: string;
    email?: string;
    email_verified?: boolean;
    name?: string;
    preferred_username?: string;
}

// Decode a JWT payload WITHOUT signature verification. Safe here because the
// token comes straight from the provider's token endpoint over TLS.
function decodeJwtPayload(jwt: string): IdTokenClaims {
    const payload = jwt.split('.')[1];
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
}

// ============================================================================
// Step 3: Fetch a normalized user profile
// ============================================================================
async function fetchGitHubProfile(accessToken: string): Promise<OAuthProfile> {
    const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'RGAP',
    };

    const userRes = await fetch('https://api.github.com/user', { headers });
    if (!userRes.ok) throw new Error('Failed to fetch GitHub profile');
    const user = await userRes.json();

    // The profile email can be private/unverified — use the emails endpoint.
    let email: string | null = user.email ?? null;
    let emailVerified = false;

    const emailsRes = await fetch('https://api.github.com/user/emails', { headers });
    if (emailsRes.ok) {
        const emails: Array<{ email: string; primary: boolean; verified: boolean }> = await emailsRes.json();
        const best = emails.find(e => e.primary && e.verified) || emails.find(e => e.verified);
        if (best) {
            email = best.email;
            emailVerified = true;
        }
    }

    return {
        providerAccountId: String(user.id),
        email,
        emailVerified,
        name: user.name || user.login || null,
    };
}

export async function getOAuthProfile(
    provider: OAuthProviderId,
    code: string,
    codeVerifier: string,
    baseUrl: string
): Promise<OAuthProfile> {
    const tokens = await exchangeCode(provider, code, codeVerifier, baseUrl);

    if (provider === 'github') {
        if (!tokens.access_token) throw new Error('GitHub did not return an access token');
        return fetchGitHubProfile(tokens.access_token);
    }

    // Google & Microsoft are OIDC: the id_token carries the profile claims.
    if (!tokens.id_token) throw new Error(`${provider} did not return an id_token`);
    const claims = decodeJwtPayload(tokens.id_token);

    if (provider === 'google') {
        return {
            providerAccountId: claims.sub,
            email: claims.email ?? null,
            emailVerified: claims.email_verified === true,
            name: claims.name ?? null,
        };
    }

    // Microsoft: personal accounts always have a verified email; for work/school
    // accounts the email claim (or preferred_username when it's an address) is
    // owned by the tenant, which we treat as verified.
    const msEmail: string | null =
        claims.email ??
        (typeof claims.preferred_username === 'string' && claims.preferred_username.includes('@')
            ? claims.preferred_username
            : null);

    return {
        providerAccountId: claims.sub,
        email: msEmail,
        emailVerified: msEmail !== null,
        name: claims.name ?? null,
    };
}
