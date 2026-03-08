// ─────────────────────────────────────────────────────────────
//  src/auth.js  –  Cognito Hosted UI auth helpers (no Amplify)
// ─────────────────────────────────────────────────────────────

const TOKEN_KEY = "aurora_token";
const EXPIRY_KEY = "aurora_token_expires_at";

// ── Cognito Hosted UI URLs ───────────────────────────────────

const COGNITO_DOMAIN = import.meta.env.VITE_COGNITO_DOMAIN;
const CLIENT_ID = import.meta.env.VITE_COGNITO_CLIENT_ID;
const REDIRECT_URI = window.location.origin;  // http://localhost:5173

/**
 * Build the Cognito Hosted UI login URL.
 */
export function getLoginUrl() {
    const redirect = encodeURIComponent(REDIRECT_URI);
    return `${COGNITO_DOMAIN}/login?client_id=${CLIENT_ID}&response_type=token&scope=openid+email+profile&redirect_uri=${redirect}`;
}

/**
 * Build the Cognito Hosted UI logout URL.
 */
export function getLogoutUrl() {
    const redirect = encodeURIComponent(REDIRECT_URI);
    return `${COGNITO_DOMAIN}/logout?client_id=${CLIENT_ID}&logout_uri=${redirect}`;
}

// ── Token parsing ────────────────────────────────────────────

/**
 * Parse tokens from URL hash returned by Cognito Hosted UI.
 * Hash format: #id_token=...&access_token=...&expires_in=3600&token_type=Bearer
 * Returns { idToken, accessToken, expiresAt } or null.
 */
export function parseTokensFromHash(hash) {
    if (!hash || hash.length < 2) return null;
    const params = new URLSearchParams(hash.substring(1));
    const idToken = params.get("id_token");
    const accessToken = params.get("access_token");
    const expiresIn = parseInt(params.get("expires_in"), 10);

    if (!idToken) return null;

    const expiresAt = expiresIn
        ? Date.now() + expiresIn * 1000
        : Date.now() + 3600 * 1000;

    return { idToken, accessToken, expiresAt };
}

// ── Session storage ──────────────────────────────────────────

/**
 * Save session to localStorage.
 */
export function setSession({ idToken, expiresAt }) {
    localStorage.setItem(TOKEN_KEY, idToken);
    localStorage.setItem(EXPIRY_KEY, String(expiresAt));
}

/**
 * Read session from localStorage. Returns { idToken, expiresAt } or null.
 */
export function getSession() {
    const idToken = localStorage.getItem(TOKEN_KEY);
    if (!idToken) return null;
    const expiresAt = parseInt(localStorage.getItem(EXPIRY_KEY), 10);
    return { idToken, expiresAt: expiresAt || 0 };
}

/**
 * Is the current session valid? (token exists AND not expired)
 * 60-second buffer so we don't use a nearly-expired token.
 */
export function isSessionValid() {
    const session = getSession();
    if (!session) return false;
    if (!session.expiresAt) return true;  // legacy token, let API validate
    return Date.now() < session.expiresAt - 60_000;
}

/**
 * Clear all session data from localStorage.
 */
export function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EXPIRY_KEY);
}

// ── Authorized fetch ─────────────────────────────────────────

/**
 * Wrapper around fetch() that injects Authorization: Bearer <id_token>.
 * Does NOT auto-redirect on 401 — callers handle it.
 *
 * @param {string} url
 * @param {RequestInit} opts
 * @returns {Promise<Response>}
 */
export async function authorizedFetch(url, opts = {}) {
    const session = getSession();

    if (!session) {
        return new Response(null, { status: 401, statusText: "No session" });
    }

    const headers = {
        ...opts.headers,
        Authorization: `Bearer ${session.idToken}`,
    };

    return fetch(url, { ...opts, headers });
}
