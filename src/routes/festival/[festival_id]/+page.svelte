<script lang="ts">
	import { currentLocale, tr } from '$lib/i18n/tr';
	import { resolve } from '$app/paths';
	import { goto, invalidateAll } from '$app/navigation';
	import { tick } from 'svelte';
	import { formatDateTime } from '$lib/utils/date.util';
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
			await goto(resolve('/festival/[festival_id]/edit', { festival_id: data.festival.id }));
		} else {
			infoDialogData.infoDialogText = tr('festival.notYours');
			infoDialogData.showDialog = true;
		}
	}

	async function deleteFestival(): Promise<void> {
		if (data.yourFestival) {
			questionDialogData.questionText = tr('common.areYouSure');
			questionDialogData.showDialog = true;
			await tick();

			const dialog = questionDialogData.dialog;
			if (dialog) {
				dialog.showModal();
				const onclose = async () => {
					if (questionDialogData.answerYes) {
						const response = await fetch(resolve('/festival/[festival_id]', { festival_id: data.festival.id }), {
							method: 'DELETE'
						});
						if (response.ok) {
							await goto(resolve('/'));
						} else {
							infoDialogData.infoDialogText = tr('festival.error.deleteFailed');
							infoDialogData.showDialog = true;
						}
					}
					dialog.removeEventListener('close', onclose);
					questionDialogData.answerYes = false;
				};
				dialog.addEventListener('close', onclose);
			}
		} else {
			infoDialogData.infoDialogText = tr('festival.notYours');
			infoDialogData.showDialog = true;
		}
	}

	async function joinFestival(): Promise<void> {
		// Felder einmalig beim Öffnen aus den aktuellen Gastdaten vorbefüllen
		// (statt via Dauer-Effect, der Nutzereingaben überschreiben könnte).
		joinDialogData.food = guestFood;
		joinDialogData.drink = guestDrink;
		joinDialogData.comment = guestComment;
		joinDialogData.numberOfOtherGuests = guestNumberOfOtherGuests;
		joinDialogData.bringYourOwnBottle = festivalBringYourOwnBottle;
		joinDialogData.bringYourOwnFood = festivalBringYourOwnFood;
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
						const response = await fetch(resolve('/festival/[festival_id]/join', { festival_id: data.festival.id }), {
							method: 'POST',
							body: JSON.stringify(eventData)
						});
						if (response.ok) {
							await afterRequest();
						} else {
							const errorData = await response.json();
							console.error('Failed to join festival:', errorData);
							infoDialogData.infoDialogText = tr('festival.error.joinFailed', {
								message: errorData.message || tr('error.unknown')
							});
							infoDialogData.showDialog = true;
						}
					} catch (error) {
						console.error('Fetch error joining festival:', error);
						infoDialogData.infoDialogText = tr('festival.error.joinNetwork');
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
		// Kommentar einmalig beim Öffnen aus den aktuellen Gastdaten vorbefüllen.
		cancelInvitationDialogData.comment = guestComment;
		cancelInvitationDialogData.showDialog = true;
		await tick();
		const dialog = cancelInvitationDialogData.dialog;
		if (dialog) {
			dialog.showModal();
			const onclose = async () => {
				if (cancelInvitationDialogData.answerYes) {
					const response = await fetch(
						resolve('/festival/[festival_id]/cancel-invitation', { festival_id: data.festival.id }),
						{
							method: 'POST',
							body: JSON.stringify({ comment: cancelInvitationDialogData.comment })
						}
					);
					if (response.ok) {
						await afterRequest();
					} else {
						infoDialogData.infoDialogText = tr('festival.error.declineFailed');
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

	let joinFestivalButtonText = $derived(
		data.yourGuestInformation?.coming ? tr('festival.joinEdit') : tr('festival.join')
	);
	let cancelFestivalButtonText = $derived(
		data.yourGuestInformation && !data.yourGuestInformation.coming ? tr('festival.declineEdit') : tr('festival.decline')
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

	let questionDialogData: QuestionDialogData = $state({
		showDialog: false,
		dialog: undefined,
		questionText: '',
		answerYes: false
	});
</script>

<InfoDialog bind:infoDialogData />
<JoinEventDialog bind:joinDialogData />
<QuestionDialog bind:questionDialogData testId="festival-delete-dialog" />
<CancelInvitationDialog bind:cancelInvitationDialogData />

<article>
	<section>
		<h4><u>{data.festival.name}</u></h4>
		{#if data.festival.createdBy}
			<p>
				{tr('festival.organisedBy')}
				<a href={resolve('/user/[user_id]', { user_id: data.festival.createdBy.id })}
					>{data.festival.createdBy.nickname}</a
				>
			</p>
		{/if}
		<mark data-testid="festival-start"
			>{tr('festival.startDate')} {formatDateTime(data.festival.startDate, currentLocale(), 'long')}</mark
		>

		<p><u>{tr('festival.description')}</u></p>
		<p>{data.festival.description}</p>

		<u>{tr('festival.where')}</u>
		<p>{data.festival.location}</p>

		<label>
			<input checked={data.festival.bringYourOwnFood} disabled name="bringYourOwnFood" type="checkbox" />
			{tr('festival.bringFood')}
		</label>
		<label>
			<input checked={data.festival.bringYourOwnBottle} disabled name="bringYourOwnBottle" type="checkbox" />
			{tr('festival.bringDrink')}
		</label>
	</section>

	<ComingVisitorsTable {data} />

	<NotComingVisitorsTable {data} />

	<section>
		<button data-testid="festival-edit" onclick={editFestival}>{tr('action.edit')}</button>
		<button data-testid="festival-delete" onclick={deleteFestival}>{tr('action.delete')}</button>
		<button data-testid="festival-cancel" onclick={cancelInvitation}>{cancelFestivalButtonText}</button>
		<button data-testid="festival-join" onclick={joinFestival}>{joinFestivalButtonText}</button>
		<a class="button" href={resolve('/')}>{tr('form.back')}</a>
	</section>

	<FestivalComments whereId={data.festival.id} />
</article>
