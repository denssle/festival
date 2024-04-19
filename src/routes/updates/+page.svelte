<script lang='ts'>
	import type { UpdateTransferData } from '$lib/models/updates/UpdateTransferData';
	import { invalidateAll } from '$app/navigation';

	export let data: UpdateTransferData;

	async function acceptFriendRequest(id: string | undefined) {
		await fetch(`updates/accept-friend`, { method: 'POST', body: id });
		invalidateAll();
	}

	async function declineFriendRequest(id: string | undefined) {
		await fetch(`updates/cancel-request`, { method: 'POST', body: id });
		invalidateAll();
	}

	async function cancelFriendRequest(id: string | undefined) {
		await fetch(`updates/decline-friend`, { method: 'POST', body: id });
		invalidateAll();
	}
</script>

<article>
	<h2>Updates</h2>
	<section>
		<h4>Eingegangene Freundschaftsanfragen</h4>
		{#each data.receivedFriendRequests as received}
			<div class='friend-request'>
				<a href='/user/{received?.sendTo?.id}'>
					{received?.sendTo?.nickname}
				</a>
				<div>
					<button on:click={() => acceptFriendRequest(received?.sendTo?.id)}> Annehmen</button>
					<button on:click={() => declineFriendRequest(received?.sendTo?.id)}> Ablehnen</button>
				</div>
			</div>
		{/each}
		{#if data.receivedFriendRequests.length === 0}
			<p>Keine Anfragen</p>
		{/if}
	</section>
	<section>
		<h4>Ausstehende Freundschaftsanfragen</h4>
		{#each data.sentFriendRequests as send}
			<div class='friend-request'>
				<a href='/user/{send?.receivedFrom?.id}'>
					{send?.receivedFrom?.nickname}
				</a>
				<button on:click={() => cancelFriendRequest(send?.receivedFrom?.id)}> Zurückziehen</button>
			</div>
		{/each}
		{#if data.sentFriendRequests.length === 0}
			<p>Keine Anfragen</p>
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
