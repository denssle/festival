<script lang="ts">
	import { goto } from '$app/navigation';
	import { authorized } from '$lib/stores/authorized-store';

	async function logout() {
		await fetch('/logout', {
			method: 'POST'
		});
		authorized.set(false);
		await goto('/login');
	}

	export let data;
	authorized.set(data.currentUser?.isAuthenticated);
</script>

<header>
	<nav>
		{#if $authorized}
			<a href="/">Festivals</a>
			<a href="/festival/new">Neu</a>
			<a href="/settings">Einstellungen</a>
			<a href="/about">About</a>
			<!-- TODO: Add guestbook -->
			<button on:click|trusted={logout}>Logout</button>
		{/if}
	</nav>
</header>

<slot />

<style global>
	:global(:root) {
		--red: #d81e30;
		--green: #439e8f;
		--dark-green: #2c685e;
		--white: #fdf8e1;
		--orange: #fd904d;
		--light-orange: #feaf7f;
	}

	:root {
		--accent: var(--green);
		--accent-bg: var(--dark-green);
		--bg: #212121;
		--text: var(--orange);
		--text-light: var(--light-orange);
		--border: var(--dark-green);
		--accent-light: var(--red);
		--code: var(--red);
		--preformatted: #444;
		--marked: #ffdd33;
		--disabled: #efefef;
	}
</style>
