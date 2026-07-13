<script lang="ts">
	import { resolve } from '$app/paths';
	import type { VisitingFestival } from '$lib/models/user/VisitingFestival';

	let { userId = '' } = $props();

	let festivals: VisitingFestival[] = $state([]);

	$effect(() => {
		if (userId) {
			loadFestivals();
		}
	});

	async function loadFestivals() {
		const response = await fetch('/user/' + userId + '/visiting-festivals', {
			method: 'GET'
		});
		const data = await response.json();
		if (data.length > 0) {
			festivals = data;
		} else {
			festivals = [];
		}
	}
</script>

{#if festivals.length === 0}
	<p>Zu nichts angemeldet.</p>
{:else}
	<p>Angemeldet bei:</p>
	<ul>
		{#each festivals as fest (fest.festivalId)}
			<li><a href={resolve('/festival/[festival_id]', { festival_id: fest.festivalId })}>{fest.festivalName}</a></li>
		{/each}
	</ul>
{/if}
