<script lang="ts">
	import { error } from '@sveltejs/kit';
	import type { InfoDialogData } from '$lib/models/dialogData/InfoDialogData';
	import InfoDialog from '$lib/sharedComponents/InfoDialog.svelte';

	export let friends = false; // TODO
	export let friendId: string;

	async function addFriend(): Promise<void> {
		fetch(friendId + `/add-friend`, { method: 'POST' })
			.then((value: Response) => {
				if (value.ok) {
					console.log('value ok');
					openDialog("Freundschaftsanfrage wurde geschickt.")
				} else {
					openDialog("Fehler bei Anfrage.")
				}
			})
			.catch((reason) => error(reason));
	}

	function removeFriend(): void {
		console.log('remove friend');
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
	{#if friends}
		<button on:click={() => removeFriend()}> Freund entfernen</button>
	{:else}
		<button on:click={() => addFriend()}> Anfreunden</button>
	{/if}
</div>
