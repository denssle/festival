import { test, expect } from '@playwright/test';

/**
 * Der Readiness-Endpunkt ist der Health-Check des Deployments (siehe deploy.yml).
 * Diese Tests sichern die zwei Eigenschaften, auf die sich der Deploy verlässt:
 * Er muss ohne Session erreichbar sein und einen echten Statuscode liefern.
 *
 * Hintergrund: Der Deploy prüfte früher `/`. Diese Route antwortet ohne Session mit
 * einem 303-Redirect auf /login – was `curl --fail` als Erfolg wertet. Der Check war
 * damit selbst bei toter Datenbank grün (v0.7.25).
 */
test.describe('Readiness-Endpunkt /api/health', () => {
	test('ist ohne Anmeldung erreichbar und meldet den DB-Status', async ({ request }) => {
		const response = await request.get('/api/health');

		expect(response.status()).toBe(200);

		const body = await response.json();
		expect(body.status).toBe('ok');
		// In CI/lokal läuft die In-Memory-SQLite (siehe sequelize.ts).
		expect(body.dialect).toBe('sqlite');
		// Migrationen laufen nur im MariaDB-Zweig – hier baut sync() das Schema auf.
		expect(body.pendingMigrations).toBeUndefined();
	});

	test('leitet nicht auf /login um (sonst wäre der Deploy-Check blind)', async ({ request }) => {
		// maxRedirects: 0 deckt auf, wenn der Endpunkt hinter die Auth-Prüfung rutscht:
		// Ein 303 käme bei `curl --fail` als Erfolg an und der Health-Check wäre wertlos.
		const response = await request.get('/api/health', { maxRedirects: 0 });

		expect(response.status()).toBe(200);
	});

	test('wird nicht gecacht', async ({ request }) => {
		const response = await request.get('/api/health');

		expect(response.headers()['cache-control']).toContain('no-store');
	});
});
