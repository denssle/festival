<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';
	export let data: PageData;
	export let form: ActionData;

	const { group, members, currentUser, isMember } = data;

	function confirmDelete(event: Event) {
		if (!confirm('Bist du sicher, dass du diese Gruppe löschen möchtest? Dies kann nicht rückgängig gemacht werden.')) {
			event.preventDefault();
		}
	}
</script>

<article>
	<header>
		<div class="header-content">
			<h1>{group.name}</h1>
			<div class="header-actions">
				{#if currentUser && group.ownerId === currentUser.id}
					<a href="/group/{group.id}/edit" class="button">Bearbeiten</a>
					<form method="POST" action="?/delete" use:enhance on:submit={confirmDelete}>
						<button type="submit" class="button danger">Gruppe löschen</button>
					</form>
				{/if}
				{#if currentUser && !isMember}
					<form method="POST" action="?/join" use:enhance>
						<button type="submit" class="button primary">Beitreten</button>
					</form>
				{/if}
				{#if currentUser && isMember && group.ownerId !== currentUser.id}
					<form method="POST" action="?/leave" use:enhance>
						<button type="submit" class="button danger">Gruppe verlassen</button>
					</form>
				{/if}
			</div>
		</div>
		{#if group.description}
			<p class="description">{group.description}</p>
		{/if}

		{#if form?.success}
			<p class="message success">
				{#if form.success === true}
					Aktion erfolgreich ausgeführt!
				{/if}
			</p>
		{:else if form?.message}
			<p class="message error">{form.message}</p>
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
	.header-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.description {
		font-style: italic;
		color: #555;
	}
	.message {
		padding: 0.5rem;
		border-radius: 4px;
		margin-top: 1rem;
	}
	.message.success {
		background-color: #d4edda;
		color: #155724;
		border: 1px solid #c3e6cb;
	}
	.message.error {
		background-color: #f8d7da;
		color: #721c24;
		border: 1px solid #f5c6cb;
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
	.button.primary {
		background-color: #007bff;
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 4px;
		cursor: pointer;
	}
	.button.danger {
		background-color: #dc3545;
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 4px;
		cursor: pointer;
		margin-right: 0.5rem;
	}
	.header-actions {
		display: flex;
		align-items: center;
	}
	.button.secondary {
		background-color: #6c757d;
		color: white;
		text-decoration: none;
		padding: 0.5rem 1rem;
		border-radius: 4px;
	}
</style>
