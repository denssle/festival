import { LoginRateLimiter } from '$lib/services/rate-limit.logic';
import { LOGIN_MAX_ATTEMPTS, LOGIN_RATE_LIMIT_WINDOW_MS } from '$lib/constants';

/** Prozessweiter Limiter für die Login-Action (siehe rate-limit.logic.ts). */
export const loginRateLimiter: LoginRateLimiter = new LoginRateLimiter({
	maxAttempts: LOGIN_MAX_ATTEMPTS,
	windowMs: LOGIN_RATE_LIMIT_WINDOW_MS
});
