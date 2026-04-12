<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form } = $props();

	let { group, members, currentUser } = $derived(data);
	let isMember = $derived(data.isMember);

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
				{form.message}
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
</article>

<style>
    header {
        margin-bottom: 2rem;
        padding-bottom: 1rem;
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
        color: var(--dark-green);
        border: 1px solid var(--darkest-green);
    }

    .message.error {
        background-color: #f8d7da;
        color: var(--red);
        border: 1px solid #f5c6cb;
    }

    .badge {
        background: var(--green);
        color: var(--dark-gray);
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 0.8rem;
        margin-left: 0.5rem;
        vertical-align: middle;
    }

    .button.primary {
        border: none;
        padding: 0.5rem 1rem;
        cursor: pointer;
    }

    .button.danger {
        background-color: var(--red);
        padding: 0.5rem 1rem;
        cursor: pointer;
    }

    .header-actions {
        display: flex;
        align-items: center;
    }
</style>
