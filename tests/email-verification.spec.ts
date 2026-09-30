import { test, expect, type Page, type BrowserContext } from '@playwright/test';
import { register, getUserId, uniqueName, uiText, linkFromMail, saveEmail } from './test-utils';

test.describe.serial('E-Mail-Adresse bestätigen', () => {
	const nickname = uniqueName('Mailer');
	const email = `${nickname.toLowerCase()}@example.com`;
	let context: BrowserContext;
	let page: Page;
	let userId: string;
	let link: string;

	test.beforeAll(async ({ browser }) => {
		context = await browser.newContext();
		page = await context.newPage();
		await register(page, nickname);
		userId = await getUserId(page);
	});

	test.afterAll(async () => {
		await context.close();
	});

	test('eine neue Adresse ist unbestätigt und bekommt einen Bestätigungslink', async () => {
		await saveEmail(page, userId, email);

		await expect(page.getByTestId('profile-message')).toHaveText(uiText('profile.updatedVerificationSent', { email }));
		await expect(page.getByTestId('email-status')).toHaveText(uiText('profile.email.unverified'));
		link = await linkFromMail(page, email, '/verify-email');
	});

	test('der Link bestätigt auch ohne Anmeldung – aber nur einmal', async ({ browser }) => {
		const anonymous = await browser.newContext();
		const anonymousPage = await anonymous.newPage();

		await anonymousPage.goto(link);
		await expect(anonymousPage.getByTestId('verify-email-message')).toHaveText(uiText('verifyEmail.success'));

		await anonymousPage.goto(link);
		await expect(anonymousPage.getByTestId('verify-email-message')).toHaveText(uiText('verifyEmail.invalid'));
		await anonymous.close();
	});

	test('das Profil zeigt die Adresse als bestätigt', async () => {
		await page.goto(`/festival/user/${userId}`);
		await expect(page.getByTestId('email-status')).toHaveText(uiText('profile.email.verified'));
		await expect(page.getByTestId('email-send-link')).toHaveCount(0);
	});

	test('eine geänderte Adresse ist wieder unbestätigt', async () => {
		await saveEmail(page, userId, `neu-${email}`);
		await expect(page.getByTestId('email-status')).toHaveText(uiText('profile.email.unverified'));
	});

	test('der Knopf schickt einen neuen Link', async () => {
		await Promise.all([page.waitForURL('**/verify-email?/send'), page.getByTestId('email-send-link').click()]);
		await expect(page.getByTestId('verify-email-message')).toHaveText(
			uiText('verifyEmail.sent', { email: `neu-${email}`, hours: 24 })
		);
		const newLink = await linkFromMail(page, `neu-${email}`, '/verify-email');
		expect(newLink).not.toBe(link);
	});
});
