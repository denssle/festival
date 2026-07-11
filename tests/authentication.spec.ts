import { test, expect } from '@playwright/test';
import { register, logout, TEST_PASSWORD } from './test-utils';

test.describe('Authentication Security', () => {
	test('Erfolgreicher Login setzt Session-Cookie', async ({ page }) => {
		const nickname = `AuthUser_${Date.now()}`;
		await register(page, nickname);

		const cookies = await page.context().cookies();
		const sessionCookie = cookies.find((c) => c.name === 'session');

		expect(sessionCookie).toBeDefined();
		expect(sessionCookie?.value).not.toBe('');
	});

	test('Zugriff auf geschützte Route ohne Login führt zu Redirect', async ({ page }) => {
		// Direkt zu einer geschützten Route gehen
		await page.goto('/festival/new');
		await expect(page).toHaveURL(/\/login/);
	});

	test('Zugriff mit manipuliertem Session-Cookie (ungültiges Token) führt zu Redirect', async ({ page, context }) => {
		const nickname = `ManipUser_${Date.now()}`;
		await register(page, nickname);

		// Cookie manipulieren
		await context.addCookies([
			{
				name: 'session',
				value: JSON.stringify({ id: 'wrong-id', token: 'fake-token', nickname: nickname, email: 'fake@email.com' }),
				domain: 'localhost',
				path: '/'
			}
		]);

		await page.goto('/festival/new');
		await expect(page).toHaveURL(/\/login/);
	});

	test('Logout entfernt Session-Cookie und verhindert Zugriff', async ({ page }) => {
		const nickname = `LogoutUser_${Date.now()}`;
		await register(page, nickname);

		// Echten Logout über den Button im Header auslösen (POST /logout)
		const logoutResponse = page.waitForResponse(
			(resp) => resp.url().includes('/logout') && resp.request().method() === 'POST'
		);
		await page.getByRole('button', { name: 'Logout' }).click();
		await logoutResponse;
		await page.waitForURL(/\/login/);

		// Session-Cookie muss vom Server gelöscht worden sein
		const cookies = await page.context().cookies();
		const sessionCookie = cookies.find((c) => c.name === 'session');
		expect(sessionCookie).toBeUndefined();

		// Zugriff auf geschützte Route führt zu Redirect
		await page.goto('/festival/new');
		await expect(page).toHaveURL(/\/login/);
	});

	test('Login wird nach zu vielen Fehlversuchen temporär gesperrt', async ({ page }) => {
		const nickname = `RateLimit_User_${Date.now()}`;
		await register(page, nickname);
		await logout(page);

		// 5 Fehlversuche (LOGIN_MAX_ATTEMPTS) mit falschem Passwort
		for (let i = 0; i < 5; i++) {
			await page.fill('input[name="nickname"]', nickname);
			await page.fill('input[name="password"]', 'FalschesPasswort999!');
			const responsePromise = page.waitForResponse(
				(r) => r.url().includes('/login') && r.request().method() === 'POST'
			);
			await page.click('button[type="submit"]');
			await responsePromise;
		}
		await expect(page.getByText('Password invalid')).toBeVisible({ timeout: 15000 });

		// Auch mit KORREKTEM Passwort muss der Login jetzt gesperrt sein
		await page.fill('input[name="nickname"]', nickname);
		await page.fill('input[name="password"]', TEST_PASSWORD);
		const blockedResponse = page.waitForResponse((r) => r.url().includes('/login') && r.request().method() === 'POST');
		await page.click('button[type="submit"]');
		await blockedResponse;

		await expect(page.getByText('Too many failed login attempts', { exact: false })).toBeVisible({ timeout: 15000 });
		await expect(page).toHaveURL(/\/login/);
	});
});
