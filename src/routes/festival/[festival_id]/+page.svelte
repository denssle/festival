<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import type { FrontendFestivalEvent } from '$lib/models/FrontendFestivalEvent';
	import { dateToDDMMYYYY, formateDateTime } from '$lib/utils/dateUtils';
	import InfoDialog from '$lib/sharedComponents/InfoDialog.svelte';
	import JoinEventDialog from './join/JoinEventDialog.svelte';
	import type { JoinEventDialogData } from '$lib/models/dialogData/JoinEventDialogData';
	import type { InfoDialogData } from '$lib/models/dialogData/InfoDialogData';
	import type { BaseGuestInformation } from '$lib/models/BaseGuestInformation';
	import QuestionDialog from '$lib/sharedComponents/QuestionDialog.svelte';
	import type { QuestionDialogData } from '$lib/models/dialogData/QuestionDialogData';
	import { getTotalNumberOfGuests } from '$lib/utils/festivalEventUtils';
	import type { CancelInvitationDialogData } from '$lib/models/dialogData/CancelInvitationDialogData';
	import CancelInvitationDialog from './cancel-invitation/CancelInvitationDialog.svelte';

	export let data: { festival: FrontendFestivalEvent; yourFestival: boolean; visitor: boolean };

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
		if (data.visitor) {
			// TODO Zeige die Zusage um sie zu bearbeiten
			infoDialogData.infoDialogText = 'Du bist bereits dabei!';
			infoDialogData.showDialog = true;
		} else {
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
							invalidateAll();
						});
					}
				};
			}
		}
	}

	function leaveFestival(): void {
		if (data.visitor) {
			// TODO Wechel Zusage gegen Absage aus
			fetch('/festival/' + data.festival.id + '/leave', {
				method: 'POST'
			}).then(() => {
				invalidateAll();
			});
		} else {
			cancelInvitationDialogData.showDialog = true;
			if (cancelInvitationDialogData.dialog) {
				cancelInvitationDialogData.dialog.onclose = () => {
					console.log('cancel close ', cancelInvitationDialogData.answerYes);
				};
			}
		}
	}

	let cancelInvitationDialogData: CancelInvitationDialogData = {
		showDialog: false,
		dialog: undefined,
		comment: '',
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
		food: '',
		drink: '',
		numberOfOtherGuests: 0,
		dialog: undefined,
		coming: true,
		comment: '',
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
		<h4>{data.festival.name}</h4>
		<sub>Starting: {formateDateTime(data.festival.startDate)}</sub>
		<sub>Erstellt am {dateToDDMMYYYY(data.festival.createdAt)} von {data.festival.createdBy?.nickname}</sub>

		<p>{data.festival.description}</p>

		<p>{data.festival.location}</p>

		<label>
			<input type="checkbox" bind:checked={data.festival.bringYourOwnFood} name="bringYourOwnFood" disabled />
			Gäste sollen etwas zu Essen mitbringen.
		</label>
		<label>
			<input type="checkbox" bind:checked={data.festival.bringYourOwnBottle} name="bringYourOwnBottle" disabled />
			Gäste sollen etwas zu trinken mitbringen.
		</label>
	</section>

	<section>
		{#if data.festival.frontendGuestInformation.length}
			<p>Bisher haben sich angemeldet:</p>
			<table style="width: 100%">
				<thead>
					<tr>
						<th>Name</th>
						<th>Essen</th>
						<th>Trinken</th>
						<th>Weitere Gäste</th>
					</tr>
				</thead>
				<tbody>
					{#each data.festival.frontendGuestInformation as guest}
						<tr>
							<td>
								<a href="/user/{guest.userId}">{guest.user.nickname}</a>
							</td>
							<td>
								{guest.food}
							</td>
							<td>
								{guest.drink}
							</td>
							<td>
								{guest.numberOfOtherGuests}
							</td>
						</tr>
					{/each}
				</tbody>
				<tfoot>
					<tr>
						<td>Summe</td>
						<td></td>
						<td></td>
						<td>{getTotalNumberOfGuests(data.festival)}</td>
					</tr>
				</tfoot>
			</table>
		{:else}
			<p>Es hat sich noch niemand angemeldet.</p>
		{/if}
	</section>

	<section>
		<button on:click={editFestival}>Bearbeiten</button>
		<button on:click={deleteFestival}>Löschen</button>
		<button on:click={leaveFestival}>Absagen</button>
		<button on:click={joinFestival}>Mitmachen</button>
		<a class="button" href="/">Zurück</a>
	</section>
</article>

<style></style>
