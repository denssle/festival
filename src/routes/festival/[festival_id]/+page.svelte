<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { tick } from 'svelte';
	import { formateDateTime } from '$lib/utils/date.util';
	import InfoDialog from '$lib/sharedComponents/InfoDialog.svelte';
	import JoinEventDialog from './join/JoinEventDialog.svelte';
	import type { JoinEventDialogData } from '$lib/models/dialogData/JoinEventDialogData';
	import type { InfoDialogData } from '$lib/models/dialogData/InfoDialogData';
	import type { BaseGuestInformation } from '$lib/models/guestInformation/BaseGuestInformation';
	import QuestionDialog from '$lib/sharedComponents/QuestionDialog.svelte';
	import type { QuestionDialogData } from '$lib/models/dialogData/QuestionDialogData';
	import type { CancelInvitationDialogData } from '$lib/models/dialogData/CancelInvitationDialogData';
	import CancelInvitationDialog from './cancel-invitation/CancelInvitationDialog.svelte';
	import ComingVisitorsTable from './CommingVisitorsTable.svelte';
	import NotComingVisitorsTable from './NotCommingVisitorsTable.svelte';
	import type { FestivalTransferData } from '$lib/models/transferData/FestivalTransferData';
	import FestivalComments from '$lib/sharedComponents/Comments.svelte';

	let { data }: { data: FestivalTransferData } = $props();

	async function editFestival(): Promise<void> {
		if (data.yourFestival) {
			await goto('/festival/' + data.festival.id + '/edit');
		} else {
			infoDialogData.infoDialogText = 'Das ist nicht dein Event. ';
			infoDialogData.showDialog = true;
		}
	}

	async function deleteFestival(): Promise<void> {
		if (data.yourFestival) {
			questionDialogData.questionText = 'Bist du dir sicher?';
			questionDialogData.showDialog = true;
			await tick();

			const dialog = questionDialogData.dialog;
			if (dialog) {
				dialog.showModal();
				const onclose = async () => {
					if (questionDialogData.answerYes) {
						const response = await fetch('/festival/' + data.festival.id, {
							method: 'DELETE'
						});
						if (response.ok) {
							await goto('/');
						} else {
							infoDialogData.infoDialogText = 'Löschen fehlgeschlagen.';
							infoDialogData.showDialog = true;
						}
					}
					dialog.removeEventListener('close', onclose);
					questionDialogData.answerYes = false;
				};
				dialog.addEventListener('close', onclose);
			}
		} else {
			infoDialogData.infoDialogText = 'Das ist nicht dein Event. ';
			infoDialogData.showDialog = true;
		}
	}

	async function joinFestival(): Promise<void> {
		joinDialogData.showDialog = true;
		await tick();
		const dialog = joinDialogData.dialog;
		if (dialog) {
			if (!dialog.open) dialog.showModal();
			const onclose = async () => {
				if (joinDialogData.answerYes) {
					const eventData: BaseGuestInformation = {
						food: joinDialogData.food,
						drink: joinDialogData.drink,
						numberOfOtherGuests: joinDialogData.numberOfOtherGuests,
						coming: true,
						comment: ''
					};
					try {
						const response = await fetch('/festival/' + data.festival.id + '/join', {
							method: 'POST',
							body: JSON.stringify(eventData)
						});
						if (response.ok) {
							await afterRequest();
						} else {
							const errorData = await response.json();
							console.error('Failed to join festival:', errorData);
							infoDialogData.infoDialogText = 'Fehler beim Zusagen: ' + (errorData.message || 'Unbekannter Fehler');
							infoDialogData.showDialog = true;
						}
					} catch (error) {
						console.error('Fetch error joining festival:', error);
						infoDialogData.infoDialogText = 'Netzwerkfehler beim Zusagen.';
						infoDialogData.showDialog = true;
					}
				}
				dialog.removeEventListener('close', onclose);
				joinDialogData.answerYes = false;
			};
			dialog.addEventListener('close', onclose);
		}
	}

	async function cancelInvitation(): Promise<void> {
		cancelInvitationDialogData.showDialog = true;
		await tick();
		const dialog = cancelInvitationDialogData.dialog;
		if (dialog) {
			dialog.showModal();
			const onclose = async () => {
				if (cancelInvitationDialogData.answerYes) {
					const response = await fetch('/festival/' + data.festival.id + '/cancel-invitation', {
						method: 'POST',
						body: JSON.stringify({ comment: cancelInvitationDialogData.comment })
					});
					if (response.ok) {
						await afterRequest();
					} else {
						infoDialogData.infoDialogText = 'Absagen fehlgeschlagen.';
						infoDialogData.showDialog = true;
					}
				}
				dialog.removeEventListener('close', onclose);
				cancelInvitationDialogData.answerYes = false;
			};
			dialog.addEventListener('close', onclose);
		}
	}

	async function afterRequest(): Promise<void> {
		await invalidateAll();
	}

	let joinFestivalButtonText = $derived(data.yourGuestInformation?.coming ? 'Zusage bearbeiten' : 'Zusagen');
	let cancelFestivalButtonText = $derived(
		data.yourGuestInformation && !data.yourGuestInformation.coming ? 'Absage bearbeiten' : 'Absagen'
	);

	let guestFood = $derived(data.yourGuestInformation?.food ?? '');
	let guestDrink = $derived(data.yourGuestInformation?.drink ?? '');
	let guestComment = $derived(data.yourGuestInformation?.comment ?? '');
	let guestNumberOfOtherGuests = $derived(data.yourGuestInformation?.numberOfOtherGuests ?? 0);
	let festivalBringYourOwnBottle = $derived(data.festival.bringYourOwnBottle);
	let festivalBringYourOwnFood = $derived(data.festival.bringYourOwnFood);

	let cancelInvitationDialogData: CancelInvitationDialogData = $state({
		showDialog: false,
		dialog: undefined,
		comment: '',
		answerYes: false
	});
	let infoDialogData: InfoDialogData = $state({
		showDialog: false,
		infoDialogText: '',
		dialog: undefined,
		answerYes: false
	});
	let joinDialogData: JoinEventDialogData = $state({
		showDialog: false,
		bringYourOwnBottle: false,
		bringYourOwnFood: false,
		food: '',
		drink: '',
		numberOfOtherGuests: 0,
		dialog: undefined,
		coming: true,
		comment: '',
		answerYes: false
	});

	$effect(() => {
		cancelInvitationDialogData.comment = guestComment;
		joinDialogData.food = guestFood;
		joinDialogData.drink = guestDrink;
		joinDialogData.comment = guestComment;
		joinDialogData.numberOfOtherGuests = guestNumberOfOtherGuests;
		joinDialogData.bringYourOwnBottle = festivalBringYourOwnBottle;
		joinDialogData.bringYourOwnFood = festivalBringYourOwnFood;
	});
	let questionDialogData: QuestionDialogData = $state({
		showDialog: false,
		dialog: undefined,
		questionText: '',
		answerYes: false
	});
</script>

<InfoDialog bind:infoDialogData />
<JoinEventDialog bind:joinDialogData />
<QuestionDialog bind:questionDialogData />
<CancelInvitationDialog bind:cancelInvitationDialogData />

<article>
	<section>
		<h4><u>{data.festival.name}</u></h4>
		{#if data.festival.createdBy}
			<p>Organisiert von <a href="/user/{data.festival.createdBy.id}">{data.festival.createdBy.nickname}</a></p>
		{/if}
		<mark>Startdatum: {formateDateTime(data.festival.startDate)}</mark>

		<p><u>Beschreibung:</u></p>
		<p>{data.festival.description}</p>

		<u>Wo:</u>
		<p>{data.festival.location}</p>

		<label>
			<input checked={data.festival.bringYourOwnFood} disabled name="bringYourOwnFood" type="checkbox" />
			Gäste sollen etwas zu Essen mitbringen.
		</label>
		<label>
			<input checked={data.festival.bringYourOwnBottle} disabled name="bringYourOwnBottle" type="checkbox" />
			Gäste sollen etwas zu trinken mitbringen.
		</label>
	</section>

	<ComingVisitorsTable {data} />

	<NotComingVisitorsTable {data} />

	<section>
		<button onclick={editFestival}>Bearbeiten</button>
		<button onclick={deleteFestival}>Löschen</button>
		<button onclick={cancelInvitation}>{cancelFestivalButtonText}</button>
		<button onclick={joinFestival}>{joinFestivalButtonText}</button>
		<a class="button" href="/">Zurück</a>
	</section>

	<FestivalComments whereId={data.festival.id} />
</article>
