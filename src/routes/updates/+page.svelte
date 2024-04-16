<script lang='ts'>
	import type { UpdateTransferData } from '$lib/models/updates/UpdateTransferData';

	export let data: UpdateTransferData;

	function addFriend() {
		console.log('addFriend');
	}

	function declineFriendRequest() {
		console.log('declineFriendRequest');
	}

	function cancelFriendRequest() {
		console.log('cancelFriendRequest');
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
					<button on:click={() => addFriend()}>
						Annehmen
					</button>
					<button on:click={() => declineFriendRequest()}>
						Ablehnen
					</button>
				</div>
			</div>
		{/each}
		{#if (data.incoming.length === 0)}
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
				<button on:click={() => cancelFriendRequest()}>
					Zurückziehen
				</button>
			</div>
		{/each}
		{#if (data.outgoing.length === 0)}
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