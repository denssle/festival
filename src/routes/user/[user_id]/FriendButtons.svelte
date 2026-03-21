<script lang="ts">
	import { error } from '@sveltejs/kit';
	import type { InfoDialogData } from '$lib/models/dialogData/InfoDialogData';
	import InfoDialog from '$lib/sharedComponents/InfoDialog.svelte';
	import { invalidateAll } from '$app/navigation';

	export let yourFriend = false;
	export let friendId: string;

	async function addFriend(): Promise<void> {
		console.log('addFriend called for', friendId);
		fetch(`/user/` + friendId + `/add-friend`, { method: 'POST' })
			.then((value: Response) => {
				console.log('addFriend response status:', value.status);
				if (value.ok) {
					openDialog('Freundschaftsanfrage wurde geschickt.');
				} else {
					openDialog('Fehler bei Anfrage.');
				}
				invalidateAll();
			})
			.catch((reason) => {
				console.error('addFriend fetch error:', reason);
				error(reason);
			});
	}

	function removeFriend(): void {
		fetch(`/user/` + friendId + `/remove-friend`, { method: 'POST' })
			.then((value: Response) => {
				if (value.ok) {
					openDialog('Freundschaft gekündigt.');
				} else {
					openDialog('Fehler bei Anfrage.');
				}
				invalidateAll();
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
