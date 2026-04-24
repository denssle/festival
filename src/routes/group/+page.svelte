<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<article>
	<h2>Gruppen</h2>
	<p>Hier kannst du dich vernetzen.</p>

	<section>
		<h3>Deine Gruppen</h3>
		{#if data.groups && data.groups.length > 0}
			<ul>
				{#each data.groups as group}
					<li><a href="/group/{group.id}">{group.name}</a></li>
				{/each}
			</ul>
		{:else}
			<p>Du bist in keiner Gruppe.</p>
		{/if}
	</section>

	<section class="search-section">
		<h3>Gruppen suchen</h3>
		<form method="GET">
			<input type="text" name="q" placeholder="Gruppenname oder Beschreibung..." value={data.searchTerm || ''} />
			<button type="submit">Suchen</button>
		</form>

		{#if data.searchTerm}
			<h4>Suchergebnisse für "{data.searchTerm}"</h4>
			{#if data.searchResults && data.searchResults.length > 0}
				<ul>
					{#each data.searchResults as group}
						<li>
							<a href="/group/{group.id}">{group.name}</a>
							{#if group.description}
								<p class="description">{group.description}</p>
							{/if}
						</li>
					{/each}
				</ul>
			{:else}
				<p>Keine Gruppen gefunden.</p>
			{/if}
		{/if}
	</section>

	<section>
		<h3>Neue Gruppe</h3>
		<div class="actions">
			<a class="button" href="/group/new">Neue Gruppe anlegen</a>
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
