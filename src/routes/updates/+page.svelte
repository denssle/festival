<script lang="ts">
	import { tr } from '$lib/i18n/tr';
	import { resolve } from '$app/paths';
	import type { UpdateTransferData } from '$lib/models/updates/UpdateTransferData';
	import { invalidateAll } from '$app/navigation';
	import { request } from '$lib/utils/request';
	import InfoDialog from '$lib/sharedComponents/InfoDialog.svelte';
	import type { InfoDialogData } from '$lib/models/dialogData/InfoDialogData';

	let { data }: { data: UpdateTransferData } = $props();

	/** Gemeinsamer Ablauf der drei Knöpfe: Anfrage schicken, bei Fehler melden, Liste neu laden. */
	async function answerFriendRequest(url: string, id: string | undefined) {
		const result = await request(url, { method: 'POST', body: id });
		if (!result.ok) {
			infoDialogData.infoDialogText = result.message;
			infoDialogData.showDialog = true;
		}
		await invalidateAll();
	}

	const acceptFriendRequest = (id: string | undefined) => answerFriendRequest(resolve('/updates/accept-friend'), id);
	const declineFriendRequest = (id: string | undefined) => answerFriendRequest(resolve('/updates/decline-friend'), id);
	const cancelFriendRequest = (id: string | undefined) => answerFriendRequest(resolve('/updates/cancel-request'), id);

	let infoDialogData: InfoDialogData = $state({
		showDialog: false,
		infoDialogText: '',
		dialog: undefined,
		answerYes: false
	});
</script>

<InfoDialog bind:infoDialogData />

<article>
	<h2>{tr('updates.heading')}</h2>
	<section>
		<h4>{tr('updates.received')}</h4>
		{#each data.receivedFriendRequests as received (received.id)}
			<div class="friend-request">
				<a href={resolve('/user/[user_id]', { user_id: received?.receivedFrom?.id ?? '' })}>
					{received?.receivedFrom?.nickname}
				</a>
				<div>
					<button data-testid="request-accept" onclick={() => acceptFriendRequest(received?.receivedFrom?.id)}>
						{tr('updates.accept')}</button
					>
					<button data-testid="request-decline" onclick={() => declineFriendRequest(received?.receivedFrom?.id)}>
						{tr('updates.decline')}</button
					>
				</div>
			</div>
		{/each}
		{#if data.receivedFriendRequests.length === 0}
			<p>{tr('updates.none')}</p>
		{/if}
	</section>
	<section>
		<h4>{tr('updates.sent')}</h4>
		{#each data.sentFriendRequests as send (send.id)}
			<div class="friend-request">
				<a href={resolve('/user/[user_id]', { user_id: send?.sendTo?.id ?? '' })}>
					{send?.sendTo?.nickname}
				</a>
				<button data-testid="request-cancel" onclick={() => cancelFriendRequest(send?.sendTo?.id)}>
					{tr('updates.withdraw')}</button
				>
			</div>
		{/each}
		{#if data.sentFriendRequests.length === 0}
			<p>{tr('updates.none')}</p>
		{/if}
	</section>
</article>

<style>
	.friend-request {
		width: 100%;
		display: flex;
		justify-content: space-between;
	}
</style>
