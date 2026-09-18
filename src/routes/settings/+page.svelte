<script lang="ts">
	import { tr } from '$lib/i18n/tr';
	import { tick } from 'svelte';
	import type { ActionData } from './$types';
	import { MIN_PASSWORD_LENGTH } from '$lib/constants';
	import QuestionDialog from '$lib/sharedComponents/QuestionDialog.svelte';
	import type { QuestionDialogData } from '$lib/models/dialogData/QuestionDialogData';
	import { ACCOUNT_SCOPE, PASSWORD_SCOPE } from '$lib/models/transferData/StandardResponse';

	let { form }: { form: ActionData } = $props();

	// Beide Formulare teilen sich `form`; der Scope entscheidet, wo die Meldung
	// erscheint. Sie steht bewusst AUSSERHALB des jeweiligen <details>, damit sie
	// auch im zugeklappten Zustand sichtbar ist. Der naheliegende Weg – <details
	// open={...}> – ist eine Falle: Svelte kontrolliert das Attribut dann reaktiv
	// und klappt den Bereich beim nächsten Re-Render wieder zu, obwohl ihn gerade
	// jemand geöffnet hat.
	let passwordMessage: string | undefined = $derived(form?.scope === PASSWORD_SCOPE ? form?.message : undefined);
	let accountMessage: string | undefined = $derived(form?.scope === ACCOUNT_SCOPE ? form?.message : undefined);

	let deleteForm: HTMLFormElement | undefined = $state(undefined);

	let questionDialogData: QuestionDialogData = $state({
		showDialog: false,
		dialog: undefined,
		questionText: '',
		answerYes: false
	});

	/**
	 * Fängt das Absenden ab und schickt das Formular erst nach ausdrücklicher
	 * Bestätigung wirklich los. Die Löschung ist nicht rückgängig zu machen, das
	 * Passwortfeld allein ist als Schutz vor einem Fehlklick zu wenig.
	 */
	async function confirmDeletion(event: SubmitEvent): Promise<void> {
		event.preventDefault();

		questionDialogData.questionText = tr('settings.account.confirm');
		questionDialogData.showDialog = true;
		await tick();

		const dialog: HTMLDialogElement | undefined = questionDialogData.dialog;
		if (!dialog) {
			return;
		}
		dialog.showModal();
		const onclose = () => {
			if (questionDialogData.answerYes) {
				// Direkt submit() statt requestSubmit(): Der onsubmit-Handler soll beim
				// bestätigten Absenden nicht erneut greifen und wieder abbrechen.
				deleteForm?.submit();
			}
			dialog.removeEventListener('close', onclose);
			questionDialogData.answerYes = false;
		};
		dialog.addEventListener('close', onclose);
	}
</script>

<QuestionDialog
	bind:questionDialogData
	buttonLabels={{ yes: tr('settings.account.confirmYes'), no: tr('form.cancel') }}
	testId="account-delete-dialog"
/>

<article>
	<h2>{tr('settings.heading')}</h2>
	<form autocomplete="on" method="POST" action="?/changePassword">
		<section>
			<details>
				<summary data-testid="password-section">{tr('settings.password.section')}</summary>
				<p>
					<label for="currentPassword">{tr('settings.password.currentLabel')} </label>
					<input
						id="currentPassword"
						name="currentPassword"
						placeholder={tr('settings.password.currentPlaceholder')}
						type="password"
						autocomplete="current-password"
						required
					/>
				</p>
				<p>
					<label for="password">{tr('settings.password.newLabel')} </label>
					<input
						id="password"
						name="password"
						placeholder={tr('settings.password.newPlaceholder')}
						type="password"
						autocomplete="new-password"
						minlength={MIN_PASSWORD_LENGTH}
						required
					/>
				</p>
				<p>
					<label for="passwordRepeat">{tr('settings.password.repeatLabel')} </label>
					<input
						id="passwordRepeat"
						name="passwordRepeat"
						placeholder={tr('settings.password.repeatPlaceholder')}
						type="password"
						autocomplete="new-password"
						minlength={MIN_PASSWORD_LENGTH}
						required
					/>
				</p>
				<p>
					<button type="submit" data-testid="password-save">{tr('form.save')}</button>
				</p>
			</details>

			{#if passwordMessage}
				<p><span>{passwordMessage}</span></p>
			{/if}
		</section>
	</form>

	<form bind:this={deleteForm} method="POST" action="?/deleteAccount" onsubmit={confirmDeletion}>
		<section>
			<details>
				<summary data-testid="account-section">{tr('settings.account.delete')}</summary>
				<p>
					{tr('settings.account.explanation')}
				</p>
				<p>
					<label for="deletePassword">{tr('settings.account.passwordLabel')} </label>
					<input
						id="deletePassword"
						name="deletePassword"
						placeholder={tr('form.password')}
						type="password"
						autocomplete="current-password"
						required
					/>
				</p>
				<p>
					<button type="submit" data-testid="account-delete">{tr('settings.account.delete')}</button>
				</p>
			</details>
			{#if accountMessage}
				<p><span>{accountMessage}</span></p>
			{/if}
		</section>
	</form>
</article>
