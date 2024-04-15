<script lang='ts'>
	import type { UpdateTransferData } from '$lib/models/updates/UpdateTransferData';

	export let data: UpdateTransferData;
</script>

<article>
	<section>
		<p>Eingegangene Freundschaftsanfragen</p>
		{#each data.incoming as incomingRequest}
			<p>{incomingRequest?.requestedBy?.nickname}</p>
		{/each}
	</section>
	<section>
		<p>Ausstehende Freundschaftsanfragen</p>
		{#each data.outgoing as outgoingRequest}
			<p>{outgoingRequest?.requestedTo?.nickname}</p>
		{/each}
	</section>
</article>