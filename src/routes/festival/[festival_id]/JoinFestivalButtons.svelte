<script lang="ts">
	import type { FrontendFestivalEvent } from '$lib/models/FrontendFestivalEvent';

	export let data: { visitor: boolean; festival: FrontendFestivalEvent };
	function joinFestival(): void {
		if (!data.visitor) {
			fetch('/festival/' + data.festival.id + '/join', {
				method: 'POST'
			});
		}
	}

	function leaveFestival(): void {
		if (data.visitor) {
			fetch('/festival/' + data.festival.id + '/leave', {
				method: 'POST'
			});
		}
	}
</script>

{#if data.visitor}
	<button on:click={leaveFestival}>Absagen</button>
{:else}
	<button on:click={joinFestival}>Mitmachen</button>
{/if}
