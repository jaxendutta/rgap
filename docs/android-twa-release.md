# Publishing RGAP to app stores

RGAP is packaged as a **Trusted Web Activity (TWA)** for Google Play and, optionally, as a plain PWA for Microsoft Store. Both approaches wrap the *live* deployed site (https://rgap.anirban.ca) rather than bundling a snapshot of the code — every `git push` that deploys to Vercel updates the "app" instantly, with no store resubmission needed. The only things baked into the packaged app itself are the name, icon, splash screen, and (for Google Play) a signing certificate.

The manifest (`src/app/manifest.ts`) and icons (`public/icons/`) in this repo are shared by both paths below. Regenerate the icons with `npm run generate:pwa-icons` if `public/logo.png` ever changes.

## Google Play (Android) — $25 one-time

Play requires a real Android package built with Google's Bubblewrap CLI, plus a signing certificate that has to be registered against the domain via `/.well-known/assetlinks.json`. None of this can be done from inside this repo — it needs Android tooling on your own machine and a Play Console account.

1. Install JDK 17+, Android SDK cmdline-tools, and the Bubblewrap CLI: `npm i -g @bubblewrap/cli`.
2. `bubblewrap init --manifest=https://rgap.anirban.ca/manifest.webmanifest` — pick an `applicationId` (reverse-domain, e.g. `ca.anirban.rgap.twa`).
3. Let Bubblewrap generate or select a signing keystore — **back it up immediately**. Losing it means losing the ability to ship updates under the same app listing, permanently.
4. Get the SHA-256 fingerprint: `keytool -list -v -keystore <keystore> -alias <alias>`.
5. Fill in and deploy the real asset links file at `public/.well-known/assetlinks.json`:
   ```json
   [{
     "relation": ["delegate_permission/common.handle_all_urls"],
     "target": {
       "namespace": "android_app",
       "package_name": "<applicationId from step 2>",
       "sha256_cert_fingerprints": ["<fingerprint from step 4>"]
     }
   }]
   ```
   Push it, then verify it resolves live at `https://rgap.anirban.ca/.well-known/assetlinks.json` before continuing — Play validates this URL directly.
6. `bubblewrap build` to produce the signed `.aab`.
7. Create a Google Play Developer account — **$25 one-time**, not recurring, covers unlimited future app submissions under that account.
8. Prepare the store listing: screenshots, feature graphic, short/long description, **privacy policy URL** (see blocker below), Data Safety form, content rating questionnaire.
9. Upload the `.aab`, submit to an internal/closed testing track first, then promote to production once it passes review.

### Privacy policy blocker

Play Console will not accept a submission without a privacy policy URL. This repo has no `/privacy`, `/legal`, or `/terms` route yet. Before submitting, add a minimal `src/app/privacy/page.tsx` covering the app's actual data flows: Supabase-backed auth via `iron-session` cookies, `bcryptjs` password hashing, and `Resend` transactional email. The copy itself should be written/reviewed by the site owner, not generated — this is flagged here as a required companion task, not done automatically.

## Microsoft Store (Windows) — free

Microsoft Store accepts PWAs directly with no packaging tool of your own needed, and individual developer accounts are **free** (Microsoft dropped the old $19 registration fee).

1. Go to [PWABuilder](https://www.pwabuilder.com/) and enter `https://rgap.anirban.ca`. It reads `manifest.webmanifest` automatically (same one built above) and reports any manifest gaps.
2. Use PWABuilder's "Package for Store" → Windows option to generate a signed MSIX package — no local Android/Windows SDK needed, it's done in-browser.
3. Register a free Microsoft Partner Center developer account.
4. Submit the generated MSIX through Partner Center. Microsoft Store still requires a privacy policy URL, same blocker as above — resolve that once and it covers both stores.

## Explicitly out of scope for now

- **Service worker / offline support** — a TWA is just a Custom Tab wrapper and doesn't need one to function; Play doesn't gate submission on Lighthouse PWA score either. RGAP is DB-backed and always wants fresh data, so an offline caching strategy is a mismatched effort for v1. Worth revisiting later as a fast-follow if genuinely useful.
- **Apple App Store** — not currently targeted. If it ever is: Apple's guideline 4.2.6 rejects apps that are just a repackaged website, so a Capacitor/WebView wrapper would need real native additions (push notifications, native auth, etc.) to pass review, on top of the $99/year recurring account fee.
- Extra icon sizes beyond 192/512(+maskable) — not required by Bubblewrap, Play, or PWABuilder.
