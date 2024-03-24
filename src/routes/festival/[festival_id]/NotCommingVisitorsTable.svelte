<script lang="ts">
	import type { FrontendFestivalEvent } from '$lib/models/FrontendFestivalEvent';
	import { getTotalNumberOfNotComingGuests } from '$lib/utils/festivalEventUtils';

	export let data: { festival: FrontendFestivalEvent; yourFestival: boolean; visitor: boolean };
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
							<a href="/user/{guest.userId}">{guest.user.nickname}</a>
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
