import { test, expect, type Page, type BrowserContext } from '@playwright/test';
import {
	register,
	getUserId,
	uniqueName,
	uiText,
	linkFromMail,
	saveEmail,
	logout,
	login,
	TEST_PASSWORD
} from './test-utils';

const NEW_PASSWORD = 'grüne gurken im mondschein';

async function requestReset(page: Page, identifier: string): Promise<void> {
	await page.goto('/festival/login');
	await page.getByTestId('login-forgot-password').click();
	await page.waitForURL('**/forgot-password');
	await page.waitForLoadState('networkidle');
	await page.fill('input[name="identifier"]', identifier);
	await page.getByTestId('forgot-password-submit').click();
	await expect(page.getByTestId('forgot-password-message')).toHaveText(uiText('forgotPassword.sent'));
}

async function submitNewPassword(page: Page, password: string): Promise<void> {
	await page.waitForLoadState('networkidle');
	await page.fill('input[name="password"]', password);
	await page.fill('input[name="passwordRepeat"]', password);
	await page.getByTestId('reset-password-submit').click();
}

test.describe.serial('Passwort vergessen', () => {
	const nickname = uniqueName('Vergesslich');
	const email = `${nickname.toLowerCase()}@example.com`;
	let context: BrowserContext;
	let page: Page;
	let resetLink: string;

	test.beforeAll(async ({ browser }) => {
		context = await browser.newContext();
		page = await context.newPage();
		await register(page, nickname);
		const userId = await getUserId(page);
		await saveEmail(page, userId, email);
		await page.goto(await linkFromMail(page, email, '/verify-email'));
		await expect(page.getByTestId('verify-email-message')).toHaveText(uiText('verifyEmail.success'));
		await logout(page);
	});

	test.afterAll(async () => {
		await context.close();
	});

	test('eine unbekannte Angabe bekommt dieselbe Antwort wie eine bekannte', async () => {
		await requestReset(page, `gibt-es-nicht-${Date.now()}`);
	});

	test('der Link kommt über den Nickname an', async () => {
		await requestReset(page, nickname);
		resetLink = await linkFromMail(page, email, '/reset-password');
	});

	test('ein Passwort gegen die Regeln wird abgelehnt, der Link bleibt gültig', async () => {
		await page.goto(resetLink);
		await submitNewPassword(page, '12345678');
		await expect(page.getByTestId('reset-password-message')).toHaveText(uiText('auth.error.passwordTooCommon'));
		await expect(page.getByTestId('reset-password-submit')).toBeVisible();
	});

	test('das neue Passwort gilt, das alte nicht mehr', async () => {
		await page.goto(resetLink);
		await submitNewPassword(page, NEW_PASSWORD);
		await expect(page.getByTestId('reset-password-message')).toHaveText(uiText('resetPassword.success'));

		await page.getByTestId('reset-password-login').click();
		await page.waitForURL('**/login');
		await page.fill('input[name="nickname"]', nickname);
		await page.fill('input[name="password"]', TEST_PASSWORD);
		await page.click('article button[type="submit"]');
		await expect(page.getByText(uiText('auth.error.passwordInvalid'))).toBeVisible();

		await login(page, nickname, NEW_PASSWORD);
	});

	test('der Link funktioniert nur einmal', async () => {
		await page.goto(resetLink);
		await expect(page.getByTestId('reset-password-message')).toHaveText(uiText('resetPassword.invalid'));
		await expect(page.getByTestId('reset-password-submit')).toHaveCount(0);
	});
});
