<script lang="ts">
	import { currentLocale, tr } from '$lib/i18n/tr';
	import { formatDateTime } from '$lib/utils/date.util';
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
				<i>{tr('home.start')} {formatDateTime(loadedEvent.startDate, currentLocale())}</i>
				<p>
					<span>{tr('home.guestCount', { count: getTotalNumberOfComingGuests(loadedEvent) })}</span>
				</p>
			</fieldset>
		{:else}
			<p>{tr('home.empty')}</p>
		{/each}
	</section>
</article>
