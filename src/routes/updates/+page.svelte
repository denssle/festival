<script lang='ts'>
	import type { UpdateTransferData } from '$lib/models/updates/UpdateTransferData';

	export let data: UpdateTransferData;

	function acceptFriendRequest(id: string | undefined) {
		fetch(`updates/accept-friend`, { method: 'POST', body: id });
	}

	function declineFriendRequest(id: string | undefined) {
		fetch(`updates/cancel-request`, { method: 'POST', body: id });
	}

	function cancelFriendRequest(id: string | undefined) {
		fetch(`updates/decline-friend`, { method: 'POST', body: id });
	}
</script>

<article>
	<h2>Updates</h2>
	<section>
		<h4>Eingegangene Freundschaftsanfragen</h4>
		{#each data.incoming as incomingRequest}
			<div class='friend-request'>
				<a href='/user/{incomingRequest?.requestedBy?.id}'>
					{incomingRequest?.requestedBy?.nickname}
				</a>
				<div>
					<button on:click={() => acceptFriendRequest(incomingRequest?.requestedBy?.id)}> Annehmen</button>
					<button on:click={() => declineFriendRequest(incomingRequest?.requestedBy?.id)}> Ablehnen</button>
				</div>
			</div>
		{/each}
		{#if data.incoming.length === 0}
			<p>Keine Anfragen</p>
		{/if}
	</section>
	<section>
		<h4>Ausstehende Freundschaftsanfragen</h4>
		{#each data.outgoing as outgoingRequest}
			<div class='friend-request'>
				<a href='/user/{outgoingRequest?.requestedTo?.id}'>
					{outgoingRequest?.requestedTo?.nickname}
				</a>
				<button on:click={() => cancelFriendRequest(outgoingRequest?.requestedTo?.id)}> Zurückziehen</button>
			</div>
		{/each}
		{#if data.outgoing.length === 0}
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
