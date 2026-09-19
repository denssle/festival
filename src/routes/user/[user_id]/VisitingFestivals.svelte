<script lang="ts">
	import { tr } from '$lib/i18n/tr';
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
		const response = await fetch(resolve('/user/[user_id]/visiting-festivals', { user_id: userId }), {
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
	<p>{tr('profile.visiting.none')}</p>
{:else}
	<p>{tr('profile.visiting.intro')}</p>
	<ul>
		{#each festivals as fest (fest.festivalId)}
			<li><a href={resolve('/festival/[festival_id]', { festival_id: fest.festivalId })}>{fest.festivalName}</a></li>
		{/each}
	</ul>
{/if}
