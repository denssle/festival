<script lang="ts">
	import type { VisitingFestival } from '$lib/models/user/VisitingFestival';

	let { userId = '' } = $props();

	let festivals: VisitingFestival[] = $state([]);

	$effect(() => {
		if (userId) {
			loadFestivals();
		}
	});

	function loadFestivals() {
		fetch(userId + '/visiting-festivals', {
			method: 'GET'
		}).then((response) => {
			response.json().then((data: VisitingFestival[]) => {
				if (data.length > 0) {
					festivals = data;
				} else {
					festivals = [];
				}
			});
		});
	}
</script>

{#if festivals.length === 0}
	<p>Zu nichts angemeldet.</p>
{:else}
	<p>Angemeldet bei:</p>
	<ul>
		{#each festivals as fest}
			<li><a href={'/festival/' + fest.festivalId}>{fest.festivalName}</a></li>
		{/each}
	</ul>
{/if}
