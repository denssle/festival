<script lang="ts">
	import { tr } from '$lib/i18n/tr';
	import { resolve } from '$app/paths';
	import type { VisitingFestival } from '$lib/models/user/VisitingFestival';
	import { request } from '$lib/utils/request';

	let { userId = '' } = $props();

	let festivals: VisitingFestival[] = $state([]);
	/** Statt der Liste anzuzeigen, wenn sie nicht geladen werden konnte – etwa bei Nicht-Freunden (403). */
	let errorMessage: string | null = $state(null);

	$effect(() => {
		if (userId) {
			loadFestivals();
		}
	});

	async function loadFestivals() {
		const result = await request(resolve('/user/[user_id]/visiting-festivals', { user_id: userId }), {
			method: 'GET'
		});
		if (result.ok) {
			festivals = await result.response.json();
			errorMessage = null;
		} else {
			festivals = [];
			errorMessage = result.message;
		}
	}
</script>

{#if errorMessage}
	<p data-testid="visiting-festivals-error">{errorMessage}</p>
{:else if festivals.length === 0}
	<p>{tr('profile.visiting.none')}</p>
{:else}
	<p>{tr('profile.visiting.intro')}</p>
	<ul>
		{#each festivals as fest (fest.festivalId)}
			<li><a href={resolve('/festival/[festival_id]', { festival_id: fest.festivalId })}>{fest.festivalName}</a></li>
		{/each}
	</ul>
{/if}
