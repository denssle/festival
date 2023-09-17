<script lang="ts">
	import type { FrontendFestivalEvent } from '$lib/models/FrontendFestivalEvent';

	export let data: { visitor: boolean; festival: FrontendFestivalEvent };
	function joinFestival() {
		if (!data.visitor) {
			fetch('/festival/' + data.festival.id + '/join', {
				method: 'POST'
			});
		}
	}

	function leaveFestival() {
		if (data.visitor) {
			fetch('/festival/' + data.festival.id + '/leave', {
				method: 'POST'
			}).then((value) => {
				console.log(value);
				if (value.body) {
					value.body
						.getReader()
						.read()
						.then((value1) => {
							console.log('boday value', value1);
						});
				}
			});
		}
	}
</script>

{#if data.visitor}
	<button on:click={leaveFestival}>Absagen</button>
{:else}
	<button on:click={joinFestival}>Mitmachen</button>
{/if}
