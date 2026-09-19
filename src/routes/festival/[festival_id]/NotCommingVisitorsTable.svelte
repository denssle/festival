<script lang="ts">
	import { tr } from '$lib/i18n/tr';
	import { resolve } from '$app/paths';
	import { getTotalNumberOfNotComingGuests } from '$lib/utils/festivalEvent.util';
	import type { FestivalTransferData } from '$lib/models/transferData/FestivalTransferData';

	let { data }: { data: FestivalTransferData } = $props();
</script>

<section data-testid="festival-notcoming-section">
	<h5 data-testid="festival-notcoming-heading">{tr('festival.notComing.heading')}</h5>
	{#if getTotalNumberOfNotComingGuests(data.festival)}
		<table style="width: 100%">
			<thead>
				<tr>
					<th>{tr('table.name')}</th>
					<th>{tr('festival.notComing.comment')}</th>
				</tr>
			</thead>
			<tbody>
				{#each data.festival.frontendGuestInformation.filter((value) => !value.coming) as guest (guest.user?.id)}
					<tr>
						<td>
							<a href={resolve('/user/[user_id]', { user_id: guest.user?.id ?? '' })}>{guest.user?.nickname}</a>
						</td>
						<td>
							{guest.comment}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{:else}
		<p>{tr('festival.notComing.empty')}</p>
	{/if}
</section>
