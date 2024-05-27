<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
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
	import type { FestivalTransferData } from '$lib/models/FestivalTransferData';
	import FestivalComments from '$lib/sharedComponents/Comments.svelte';

	export let data: FestivalTransferData;

	async function editFestival(): Promise<void> {
		if (data.yourFestival) {
			goto('/festival/' + data.festival.id + '/edit');
		} else {
			infoDialogData.infoDialogText = 'Das ist nicht dein Event. ';
			infoDialogData.showDialog = true;
		}
	}

	async function deleteFestival(): Promise<void> {
		if (data.yourFestival) {
			questionDialogData.questionText = 'Bist du dir sicher?';
			questionDialogData.showDialog = true;
			if (questionDialogData.dialog) {
				questionDialogData.dialog.onclose = () => {
					if (questionDialogData.answerYes) {
						fetch('/festival/' + data.festival.id, {
							method: 'DELETE'
						}).then(() => {
							goto('/');
						});
					}
				};
			}
		} else {
			infoDialogData.infoDialogText = 'Das ist nicht dein Event. ';
			infoDialogData.showDialog = true;
		}
	}

	function joinFestival(): void {
		joinDialogData.showDialog = true;
		if (joinDialogData.dialog) {
			joinDialogData.dialog.onclose = () => {
				if (joinDialogData.answerYes) {
					const eventData: BaseGuestInformation = {
						food: joinDialogData.food,
						drink: joinDialogData.drink,
						numberOfOtherGuests: joinDialogData.numberOfOtherGuests,
						coming: true,
						comment: ''
					};
					fetch('/festival/' + data.festival.id + '/join', {
						method: 'POST',
						body: JSON.stringify(eventData)
					}).then(() => {
						afterRequest();
					});
				}
			};
		}
	}

	function leaveFestival(): void {
		cancelInvitationDialogData.showDialog = true;
		if (cancelInvitationDialogData.dialog) {
			cancelInvitationDialogData.dialog.onclose = () => {
				if (cancelInvitationDialogData.answerYes) {
					fetch('/festival/' + data.festival.id + '/cancel-invitation', {
						method: 'POST',
						body: cancelInvitationDialogData.comment
					}).then(() => {
						afterRequest();
					});
				}
			};
		}
	}

	function afterRequest(): void {
		invalidateAll().then(() => {
			updateButtonLabels();
		});
	}

	let joinFestivalButtonText = 'Zusagen';
	let leaveFestivalButtonText = 'Absagen';
	updateButtonLabels();

	function updateButtonLabels() {
		joinFestivalButtonText = 'Zusagen';
		leaveFestivalButtonText = 'Absagen';
		if (data.guestInformation) {
			if (data.guestInformation.coming) {
				joinFestivalButtonText = 'Zusage bearbeiten';
			} else {
				leaveFestivalButtonText = 'Absage bearbeiten';
			}
		}
	}

	let cancelInvitationDialogData: CancelInvitationDialogData = {
		showDialog: false,
		dialog: undefined,
		comment: data.guestInformation?.comment ?? '',
		answerYes: false
	};
	let infoDialogData: InfoDialogData = {
		showDialog: false,
		infoDialogText: '',
		dialog: undefined,
		answerYes: false
	};
	let joinDialogData: JoinEventDialogData = {
		showDialog: false,
		bringYourOwnBottle: data.festival.bringYourOwnBottle,
		bringYourOwnFood: data.festival.bringYourOwnFood,
		food: data.guestInformation?.food ?? '',
		drink: data.guestInformation?.drink ?? '',
		numberOfOtherGuests: data.guestInformation?.numberOfOtherGuests ?? 0,
		dialog: undefined,
		coming: true,
		comment: data.guestInformation?.comment ?? '',
		answerYes: false
	};
	let questionDialogData: QuestionDialogData = {
		showDialog: false,
		dialog: undefined,
		questionText: '',
		answerYes: false
	};
</script>

<InfoDialog bind:infoDialogData />
<JoinEventDialog bind:joinDialogData />
<QuestionDialog bind:questionDialogData />
<CancelInvitationDialog bind:cancelInvitationDialogData />

<article>
	<section>
		<h4><u>{data.festival.name}</u></h4>
		<p>Organisiert von <a href="/user/{data.festival.createdBy?.id}">{data.festival.createdBy?.nickname}</a></p>
		<mark>Startdatum: {formateDateTime(data.festival.startDate)}</mark>

		<p><u>Beschreibung:</u></p>
		<p>{data.festival.description}</p>

		<u>Wo:</u>
		<p>{data.festival.location}</p>

		<label>
			<input bind:checked={data.festival.bringYourOwnFood} disabled name="bringYourOwnFood" type="checkbox" />
			Gäste sollen etwas zu Essen mitbringen.
		</label>
		<label>
			<input bind:checked={data.festival.bringYourOwnBottle} disabled name="bringYourOwnBottle" type="checkbox" />
			Gäste sollen etwas zu trinken mitbringen.
		</label>
	</section>

	<ComingVisitorsTable {data} />

	<NotComingVisitorsTable {data} />

	<section>
		<button on:click={editFestival}>Bearbeiten</button>
		<button on:click={deleteFestival}>Löschen</button>
		<button on:click={leaveFestival}>{leaveFestivalButtonText}</button>
		<button on:click={joinFestival}>{joinFestivalButtonText}</button>
		<a class="button" href="/">Zurück</a>
	</section>

	<FestivalComments whereId={data.festival.id} />
</article>
