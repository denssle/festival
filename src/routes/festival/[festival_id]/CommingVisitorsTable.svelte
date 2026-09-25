<script lang="ts">
	import { tr } from '$lib/i18n/tr';
	import { resolve } from '$app/paths';
	import { getGuestsWithAnswer, getTotalNumberOfComingGuests } from '$lib/utils/festivalEvent.util';
	import type { FestivalTransferData } from '$lib/models/transferData/FestivalTransferData';

	let { data }: { data: FestivalTransferData } = $props();
</script>

<section data-testid="festival-coming-section">
	<h5 data-testid="festival-coming-heading">{tr('festival.coming.heading')}</h5>
	{#if getTotalNumberOfComingGuests(data.festival)}
		<p>{tr('festival.coming.intro')}</p>
		<table style="width: 100%">
			<thead>
				<tr>
					<th>{tr('table.name')}</th>
					<th>{tr('festival.coming.food')}</th>
					<th>{tr('festival.coming.drink')}</th>
					<th>{tr('festival.coming.otherGuests')}</th>
				</tr>
			</thead>
			<tbody>
				{#each getGuestsWithAnswer(data.festival, 'yes') as guest (guest.user?.id)}
					<tr>
						<td>
							<a href={resolve('/user/[user_id]', { user_id: guest.user?.id ?? '' })}>{guest.user?.nickname}</a>
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
					<td>{tr('festival.coming.total')}</td>
					<td></td>
					<td></td>
					<td>{getTotalNumberOfComingGuests(data.festival)}</td>
				</tr>
			</tfoot>
		</table>
	{:else}
		<p>{tr('festival.coming.empty')}</p>
	{/if}
</section>
