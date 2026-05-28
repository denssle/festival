<script lang="ts">
	import { getTotalNumberOfComingGuests } from '$lib/utils/festivalEvent.util.js';
	import type { FestivalTransferData } from '$lib/models/transferData/FestivalTransferData';

	let { data }: { data: FestivalTransferData } = $props();
</script>

<section>
	<h5>Zusagen:</h5>
	{#if getTotalNumberOfComingGuests(data.festival)}
		<p>Bisher haben sich angemeldet:</p>
		<table style="width: 100%">
			<thead>
				<tr>
					<th>Name</th>
					<th>Essen</th>
					<th>Trinken</th>
					<th>Weitere Gäste</th>
				</tr>
			</thead>
			<tbody>
				{#each data.festival.frontendGuestInformation.filter((value) => value.coming) as guest (guest.user?.id || guest.id)}
					<tr>
						<td>
							<a href="/user/{guest.user?.id}">{guest.user?.nickname}</a>
						</td>
						<td>
							{guest.food}
						</td>
						<td>
							{guest.drink}
						</td>
						<td>
							{guest.numberOfOtherGuests}
						</td>
					</tr>
				{/each}
			</tbody>
			<tfoot>
				<tr>
					<td>Summe</td>
					<td></td>
					<td></td>
					<td>{getTotalNumberOfComingGuests(data.festival)}</td>
				</tr>
			</tfoot>
		</table>
	{:else}
		<p>Es hat noch niemand zugesagt.</p>
	{/if}
</section>
