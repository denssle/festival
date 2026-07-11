/**
 * Sliding-Window-Rate-Limiter für fehlgeschlagene Login-Versuche (Brute-Force-Schutz).
 *
 * Prozess-lokaler In-Memory-Zustand: Die App läuft als EIN Node-Prozess
 * (adapter-node auf Uberspace), daher ist keine verteilte Lösung (Redis o. Ä.)
 * nötig. Ein Neustart leert den Zustand – akzeptabel, da das Fenster kurz ist.
 *
 * Reine, injizierbare Logik (Zeit wird übergeben) → unit-testbar ohne Timer.
 */
export interface RateLimiterOptions {
	/** Maximale Fehlversuche pro Schlüssel innerhalb des Fensters. */
	maxAttempts: number;
	/** Länge des Sliding Windows in Millisekunden. */
	windowMs: number;
	/** Obergrenze der getrackten Schlüssel (Schutz vor Speicher-Aufblähung). */
	maxTrackedKeys?: number;
}

export class LoginRateLimiter {
	private readonly failures: Map<string, number[]> = new Map();
	private readonly maxAttempts: number;
	private readonly windowMs: number;
	private readonly maxTrackedKeys: number;

	constructor(options: RateLimiterOptions) {
		this.maxAttempts = options.maxAttempts;
		this.windowMs = options.windowMs;
		this.maxTrackedKeys = options.maxTrackedKeys ?? 10_000;
	}

	/** true, wenn der Schlüssel aktuell gesperrt ist (zu viele Fehlversuche im Fenster). */
	isBlocked(key: string, now: number = Date.now()): boolean {
		return this.recentFailures(key, now).length >= this.maxAttempts;
	}

	/** Registriert einen Fehlversuch für den Schlüssel. */
	recordFailure(key: string, now: number = Date.now()): void {
		const recent: number[] = this.recentFailures(key, now);
		recent.push(now);
		this.failures.set(key, recent);
		this.pruneIfNeeded(now);
	}

	/** Setzt den Schlüssel zurück (z. B. nach erfolgreichem Login). */
	reset(key: string): void {
		this.failures.delete(key);
	}

	/** Fehlversuche innerhalb des Fensters; entfernt dabei abgelaufene Einträge. */
	private recentFailures(key: string, now: number): number[] {
		const timestamps: number[] = this.failures.get(key) ?? [];
		const recent: number[] = timestamps.filter((t) => now - t < this.windowMs);
		if (recent.length === 0) {
			this.failures.delete(key);
		} else if (recent.length !== timestamps.length) {
			this.failures.set(key, recent);
		}
		return recent;
	}

	/** Verwirft abgelaufene Schlüssel, sobald zu viele getrackt werden. */
	private pruneIfNeeded(now: number): void {
		if (this.failures.size <= this.maxTrackedKeys) {
			return;
		}
		for (const [key, timestamps] of this.failures) {
			if (timestamps.every((t) => now - t >= this.windowMs)) {
				this.failures.delete(key);
			}
		}
	}
}

/**
 * Bildet den Rate-Limit-Schlüssel aus Client-IP und Nickname.
 * Hinter einem Reverse-Proxy ohne konfiguriertes ADDRESS_HEADER teilen sich
 * alle Clients dieselbe IP – dann degradiert der Schutz zu "pro Nickname",
 * was Accounts weiterhin vor Brute-Force schützt.
 */
export function loginRateLimitKey(clientIp: string, nickname: string): string {
	return `${clientIp}:${nickname.trim().toLowerCase()}`;
}
