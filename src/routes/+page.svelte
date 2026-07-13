<script lang="ts">
	import type { PageData } from './$types';
	import { resolve } from '$app/paths';
	import { getTotalNumberOfComingGuests } from '$lib/utils/festivalEvent.util';

	let { data }: { data: PageData } = $props();
</script>

<article>
	<h2>Festivals</h2>
	<p>Willkommen hier.</p>

	<section>
		<a class="button" href={resolve('/festival/new')}>Neues Fest anlegen</a>

		{#each data.festivalEvents as loadedEvent (loadedEvent.id)}
			<fieldset>
				<legend>
					<a href={resolve('/festival/[festival_id]', { festival_id: loadedEvent.id })}>{loadedEvent.name}</a>
					{#if loadedEvent.createdBy}
						von <a href={resolve('/user/[user_id]', { user_id: loadedEvent.createdBy.id })}
							>{loadedEvent.createdBy.nickname}</a
						>
					{/if}
				</legend>
				<i>Start: {loadedEvent.startDate?.toLocaleString()}</i>
				<p>
					<span>Bisherige Gäste: {getTotalNumberOfComingGuests(loadedEvent)}</span>
				</p>
			</fieldset>
		{:else}
			<p>Es gibt noch keine Feste. Leg das erste an!</p>
		{/each}
	</section>
</article>
