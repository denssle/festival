<script lang='ts'>

	import type { VisitingFestival } from '$lib/models/user/VisitingFestival';
	import { afterUpdate, onMount } from 'svelte';

	export let userId: string = '';

	let festivals: VisitingFestival[] = [];
	let previousUserId: string;

	onMount(() => {
		previousUserId = userId;
		loadFestivals();
	});

	afterUpdate(() => {
		if (previousUserId !== userId) {
			previousUserId = userId;
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
{:else }
	<p>Angemeldet bei: </p>
	{#each festivals as fest}
		<a href={'/festival/'+fest.festivalId}>{fest.festivalName}</a>
	{/each}
{/if}

