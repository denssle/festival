<script>
	import { authorized } from '$lib/stores/authorized-store';
	import { goto } from '$app/navigation';

	async function logout() {
		await fetch('/logout', {
			method: 'POST'
		});
		await goto('/login');
		authorized.set(false);
	}

	export let data;
	authorized.set(data.currentUser?.isAuthenticated);
</script>

<nav>
	{#if $authorized}
		<a class="button" href="/">Festivals</a>
		<a class="button" href="/festival/new">Neu</a>
		<a class="button" href="/settings">Einstellungen</a>
		<a class="button" href="/about">About</a>
		<!-- TODO: Add guestbook -->
		<button on:click|trusted={logout}>Logout</button>
	{/if}
</nav>

<main>
	<slot />
</main>

<style global>
	:global(:root) {
		--red: #d81e30;
		--green: #439e8f;
		--white: #fdf8e1;
		--orange: #fd904d;
	}

	:global(body) {
		color: var(--white);
		background-color: black;
	}
</style>
