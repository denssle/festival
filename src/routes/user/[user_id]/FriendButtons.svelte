<script lang='ts'>
	import { error } from '@sveltejs/kit';
	import type { InfoDialogData } from '$lib/models/dialogData/InfoDialogData';
	import InfoDialog from '$lib/sharedComponents/InfoDialog.svelte';

	export let yourFriend = false;
	export let friendId: string;

	async function addFriend(): Promise<void> {
		fetch(friendId + `/add-friend`, { method: 'POST' })
			.then((value: Response) => {
				if (value.ok) {
					openDialog('Freundschaftsanfrage wurde geschickt.');
				} else {
					openDialog('Fehler bei Anfrage.');
				}
			})
			.catch((reason) => error(reason));
	}

	function removeFriend(): void {
		fetch(friendId + `/remove-friend`, { method: 'POST' })
			.then((value: Response) => {
				if (value.ok) {
					openDialog('Freundschaft gekündigt.');
				} else {
					openDialog('Fehler bei Anfrage.');
				}
			})
			.catch((reason) => error(reason));
	}

	function openDialog(msg: string) {
		infoDialogData.infoDialogText = msg;
		infoDialogData.showDialog = true;
	}

	let infoDialogData: InfoDialogData = {
		showDialog: false,
		infoDialogText: '',
		dialog: undefined,
		answerYes: false
	};
</script>

<InfoDialog bind:infoDialogData />
<div>
	{#if yourFriend}
		<button on:click={() => removeFriend()}> Freund entfernen</button>
	{:else}
		<button on:click={() => addFriend()}> Anfreunden</button>
	{/if}
</div>
