<script lang="ts">
	import type { InfoDialogData } from '$lib/models/dialogData/InfoDialogData';
	import InfoDialog from '$lib/sharedComponents/InfoDialog.svelte';
	import { invalidateAll } from '$app/navigation';

	let { yourFriend = false, friendId }: { yourFriend?: boolean; friendId: string } = $props();

	async function addFriend(): Promise<void> {
		try {
			const value = await fetch(`/user/` + friendId + `/add-friend`, { method: 'POST' });
			if (value.ok) {
				openDialog('Freundschaftsanfrage wurde geschickt.', false);
			} else {
				openDialog('Fehler bei Anfrage.', false);
			}
		} catch (reason) {
			console.error('addFriend fetch error:', reason);
		}
	}

	async function removeFriend(): Promise<void> {
		try {
			const value = await fetch(`/user/` + friendId + `/remove-friend`, { method: 'POST' });
			if (value.ok) {
				openDialog('Freundschaft gekündigt.', true);
			} else {
				openDialog('Fehler bei Anfrage.', false);
			}
		} catch (reason) {
			console.error('removeFriend fetch error:', reason);
		}
	}

	function openDialog(msg: string, reloadOnClose: boolean) {
		infoDialogData.infoDialogText = msg;
		infoDialogData.showDialog = true;
		if (reloadOnClose) {
			infoDialogData.onClose = () => {
				invalidateAll();
				infoDialogData.onClose = undefined;
			};
		} else {
			infoDialogData.onClose = undefined;
		}
	}

	let infoDialogData: InfoDialogData = $state({
		showDialog: false,
		infoDialogText: '',
		dialog: undefined,
		answerYes: false
	});
</script>

<InfoDialog bind:infoDialogData />
<div>
	{#if yourFriend}
		<button onclick={() => removeFriend()}> Freund entfernen</button>
	{:else}
		<button onclick={() => addFriend()}> Anfreunden</button>
	{/if}
</div>
