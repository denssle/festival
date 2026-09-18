<script lang="ts">
	import { tr } from '$lib/i18n/tr';
	import type { InfoDialogData } from '$lib/models/dialogData/InfoDialogData';
	import InfoDialog from '$lib/sharedComponents/InfoDialog.svelte';
	import { invalidateAll } from '$app/navigation';
	import { resolve } from '$app/paths';

	let { yourFriend = false, friendId }: { yourFriend?: boolean; friendId: string } = $props();

	async function addFriend(): Promise<void> {
		try {
			const value = await fetch(resolve('/user/[user_id]/add-friend', { user_id: friendId }), { method: 'POST' });
			if (value.ok) {
				openDialog(tr('friend.requestSent'), false);
			} else {
				openDialog(tr('friend.requestFailed'), false);
			}
		} catch (reason) {
			console.error('addFriend fetch error:', reason);
		}
	}

	async function removeFriend(): Promise<void> {
		try {
			const value = await fetch(resolve('/user/[user_id]/remove-friend', { user_id: friendId }), { method: 'POST' });
			if (value.ok) {
				openDialog(tr('friend.removed'), true);
			} else {
				openDialog(tr('friend.requestFailed'), false);
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
		<button data-testid="friend-remove" onclick={() => removeFriend()}>{tr('friend.remove')}</button>
	{:else}
		<button data-testid="friend-add" onclick={() => addFriend()}>{tr('friend.add')}</button>
	{/if}
</div>
