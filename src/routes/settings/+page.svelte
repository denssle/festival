<script lang="ts">
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

		questionDialogData.questionText =
			'Konto endgültig löschen? Damit verschwinden auch deine Festivals samt Zusagen, ' +
			'deine Gruppen, Kommentare und Freundschaften. Das lässt sich nicht rückgängig machen.';
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

<QuestionDialog bind:questionDialogData buttonLabels={{ yes: 'Endgültig löschen', no: 'Abbrechen' }} />

<article>
	<h2>Einstellungen</h2>
	<form autocomplete="on" method="POST" action="?/changePassword">
		<section>
			<details>
				<summary>Passwort</summary>
				<p>
					<label for="currentPassword">Aktuelles Passwort: </label>
					<input
						id="currentPassword"
						name="currentPassword"
						placeholder="Aktuelles Passwort"
						type="password"
						autocomplete="current-password"
						required
					/>
				</p>
				<p>
					<label for="password">Neues Passwort: </label>
					<input
						id="password"
						name="password"
						placeholder="Neues Passwort"
						type="password"
						autocomplete="new-password"
						minlength={MIN_PASSWORD_LENGTH}
						required
					/>
				</p>
				<p>
					<label for="passwordRepeat">Neues Passwort wiederholen: </label>
					<input
						id="passwordRepeat"
						name="passwordRepeat"
						placeholder="Neues Passwort wiederholen"
						type="password"
						autocomplete="new-password"
						minlength={MIN_PASSWORD_LENGTH}
						required
					/>
				</p>
			</details>

			<p>
				<button type="submit">Speichern</button>
				{#if passwordMessage}
					<span>{passwordMessage}</span>
				{/if}
			</p>
		</section>
	</form>

	<form bind:this={deleteForm} method="POST" action="?/deleteAccount" onsubmit={confirmDeletion}>
		<section>
			<details>
				<summary>Konto löschen</summary>
				<p>
					Beim Löschen des Kontos werden alle zugehörigen Daten entfernt: Profil und Profilbild, die von dir angelegten
					Festivals samt Zu- und Absagen deiner Gäste, deine Gruppen, deine Kommentare sowie Freundschaften und offene
					Anfragen. Was du in fremden Festivals zugesagt hast, verschwindet ebenfalls. Der Vorgang lässt sich nicht
					rückgängig machen.
				</p>
				<p>
					<label for="deletePassword">Zur Bestätigung dein Passwort: </label>
					<input
						id="deletePassword"
						name="deletePassword"
						placeholder="Passwort"
						type="password"
						autocomplete="current-password"
						required
					/>
				</p>
				<p>
					<button type="submit">Konto löschen</button>
				</p>
			</details>
			{#if accountMessage}
				<p><span>{accountMessage}</span></p>
			{/if}
		</section>
	</form>
</article>
