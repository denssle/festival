<script lang="ts">
	import { goto } from '$app/navigation';
	import type { CurrentUser } from '$lib/models/user/CurrentUser';

	async function logout() {
		await fetch('/logout', {
			method: 'POST'
		});
		data.currentUser = undefined;
		await goto('/login');
	}

	export let data: { currentUser: CurrentUser | undefined };
</script>

<header>
	<nav>
		{#if data?.currentUser?.isAuthenticated}
			<a href="/">Festivals</a>
			<a href="/festival/new">Neu</a>
			<a href="/settings">Einstellungen</a>
			<a href="/user/{data.currentUser.id}">{data.currentUser.nickname}</a>
			<button on:click|trusted={logout}>Logout</button>
		{:else}
			<a href="/login">Anmelden</a>
			<a href="/registration">Registrieren</a>
		{/if}
	</nav>
</header>

<slot />

<footer>
	<nav>
		<a href="/about">About</a>
		<a href="/impressum">Impressum</a>
	</nav>
</footer>

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

	:global(button) {
		user-select: none;
		-webkit-user-select: none; /*Safari*/
		-moz-user-select: none; /*Firefox*/
		caret-color: transparent;
		min-width: 8vw;
	}

	:global(input::-webkit-outer-spin-button) {
		-webkit-appearance: none;
		margin: 0;
	}

	:global(input::-webkit-inner-spin-button) {
		-webkit-appearance: none;
		margin: 0;
	}

	:global(input[type='number']) {
		-moz-appearance: textfield;
	}
</style>
