<script lang="ts">
	import { tr } from '$lib/i18n/tr';
	import type { InfoDialogData } from '$lib/models/dialogData/InfoDialogData';
	import InfoDialog from '$lib/sharedComponents/InfoDialog.svelte';
	import { invalidateAll } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { request } from '$lib/utils/request';

	let { yourFriend = false, friendId }: { yourFriend?: boolean; friendId: string } = $props();

	async function addFriend(): Promise<void> {
		const result = await request(resolve('/user/[user_id]/add-friend', { user_id: friendId }), { method: 'POST' });
		openDialog(result.ok ? tr('friend.requestSent') : result.message, false);
	}

	async function removeFriend(): Promise<void> {
		const result = await request(resolve('/user/[user_id]/remove-friend', { user_id: friendId }), { method: 'POST' });
		openDialog(result.ok ? tr('friend.removed') : result.message, result.ok);
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
