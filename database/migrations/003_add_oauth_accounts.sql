-- ============================================================================
-- Migration 003: OAuth sign-in (Google / GitHub / Microsoft)
-- ============================================================================

-- Users created via an OAuth provider have no local password.
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- Links a user to one or more external identity providers.
CREATE TABLE IF NOT EXISTS oauth_accounts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(20) NOT NULL,              -- 'google', 'github', 'microsoft'
    provider_account_id VARCHAR(255) NOT NULL,  -- Stable subject/user id from the provider
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (provider, provider_account_id)
);

CREATE INDEX IF NOT EXISTS idx_oauth_accounts_user_id ON oauth_accounts(user_id);
