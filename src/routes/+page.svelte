<script lang="ts">
	import { tr } from '$lib/i18n/tr';
	import type { PageData } from './$types';
	import { resolve } from '$app/paths';
	import { getTotalNumberOfComingGuests } from '$lib/utils/festivalEvent.util';

	let { data }: { data: PageData } = $props();
</script>

<article>
	<h2>{tr('home.heading')}</h2>
	<p>{tr('home.welcome')}</p>

	<section>
		<a class="button" href={resolve('/festival/new')}>{tr('home.newFestival')}</a>

		{#each data.festivalEvents as loadedEvent (loadedEvent.id)}
			<fieldset>
				<legend>
					<a href={resolve('/festival/[festival_id]', { festival_id: loadedEvent.id })}>{loadedEvent.name}</a>
					{#if loadedEvent.createdBy}
						{tr('home.by')}
						<a href={resolve('/user/[user_id]', { user_id: loadedEvent.createdBy.id })}
							>{loadedEvent.createdBy.nickname}</a
						>
					{/if}
				</legend>
				<i>{tr('home.start')} {loadedEvent.startDate?.toLocaleString()}</i>
				<p>
					<span>{tr('home.guestCount', { count: getTotalNumberOfComingGuests(loadedEvent) })}</span>
				</p>
			</fieldset>
		{:else}
			<p>{tr('home.empty')}</p>
		{/each}
	</section>
</article>
