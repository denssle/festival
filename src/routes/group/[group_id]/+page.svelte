<script lang="ts">
	import type { PageData } from './$types';
	export let data: PageData;

	const { group, members, currentUser } = data;
</script>

<article>
	<header>
		<h1>{group.name}</h1>
		{#if group.description}
			<p class="description">{group.description}</p>
		{/if}
	</header>

	<section>
		<h3>Mitglieder</h3>
		{#if members && members.length > 0}
			<ul>
				{#each members as member}
					<li>
						<a href="/user/{member.id}">{member.nickname}</a>
						{#if member.id === group.ownerId}
							<span class="badge">Besitzer</span>
						{/if}
					</li>
				{/each}
			</ul>
		{:else}
			<p>Keine Mitglieder in dieser Gruppe.</p>
		{/if}
	</section>

	<div class="actions">
		<a href="/group" class="button secondary">Zurück zur Übersicht</a>
	</div>
</article>

<style>
	header {
		margin-bottom: 2rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid #ccc;
	}
	.description {
		font-style: italic;
		color: #555;
	}
	.badge {
		background: #eee;
		padding: 2px 6px;
		border-radius: 4px;
		font-size: 0.8rem;
		margin-left: 0.5rem;
		vertical-align: middle;
	}
	.actions {
		margin-top: 2rem;
	}
	.button.secondary {
		background-color: #6c757d;
		color: white;
		text-decoration: none;
		padding: 0.5rem 1rem;
		border-radius: 4px;
	}
</style>
