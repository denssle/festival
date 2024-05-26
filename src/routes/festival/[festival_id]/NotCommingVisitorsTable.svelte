<script lang="ts">
	import { getTotalNumberOfNotComingGuests } from '$lib/utils/festivalEvent.util';
	import type { FestivalTransferData } from '$lib/models/FestivalTransferData';

	export let data: FestivalTransferData;
</script>

<section>
	<h5>Absagen:</h5>
	{#if getTotalNumberOfNotComingGuests(data.festival)}
		<table style="width: 100%">
			<thead>
				<tr>
					<th>Name</th>
					<th>Kommentar</th>
				</tr>
			</thead>
			<tbody>
				{#each data.festival.frontendGuestInformation.filter((value) => !value.coming) as guest}
					<tr>
						<td>
							<a href="/user/{guest.user.id}">{guest.user.nickname}</a>
						</td>
						<td>
							{guest.comment}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{:else}
		<p>Es hat noch niemand abgesagt.</p>
	{/if}
</section>
