<script lang="ts">
	import { tr } from '$lib/i18n/tr';
	import { resolve } from '$app/paths';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<article>
	<h2>{tr('group.heading')}</h2>
	<p>{tr('group.intro')}</p>

	<section>
		<h3>{tr('group.mine')}</h3>
		{#if data.groups && data.groups.length > 0}
			<ul>
				{#each data.groups as group (group.id)}
					<li><a href={resolve('/group/[group_id]', { group_id: group.id })}>{group.name}</a></li>
				{/each}
			</ul>
		{:else}
			<p data-testid="my-groups-empty">{tr('group.mineEmpty')}</p>
		{/if}
	</section>

	<section class="search-section">
		<h3>{tr('group.search.heading')}</h3>
		<form method="GET">
			<input type="text" name="q" placeholder={tr('group.search.placeholder')} value={data.searchTerm || ''} />
			<button type="submit">{tr('group.search.submit')}</button>
		</form>

		{#if data.searchTerm}
			<h4>{tr('group.search.results', { term: data.searchTerm })}</h4>
			{#if data.searchResults && data.searchResults.length > 0}
				<ul>
					{#each data.searchResults as group (group.id)}
						<li>
							<a href={resolve('/group/[group_id]', { group_id: group.id })}>{group.name}</a>
							{#if group.description}
								<p class="description">{group.description}</p>
							{/if}
						</li>
					{/each}
				</ul>
			{:else}
				<p data-testid="group-search-empty">{tr('group.search.empty')}</p>
			{/if}
		{/if}
	</section>

	<section>
		<h3>{tr('group.new.section')}</h3>
		<div class="actions">
			<a class="button" href={resolve('/group/new')}>{tr('group.new.create')}</a>
		</div>
	</section>
</article>

<style>
	.actions {
		margin-bottom: 2rem;
	}

	.search-section {
		margin-bottom: 2rem;
		padding-bottom: 2rem;
	}

	.description {
		font-size: 0.9rem;
		color: #666;
		margin: 0;
	}

	form {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	input[type='text'] {
		flex-grow: 1;
		padding: 0.5rem;
	}
</style>
