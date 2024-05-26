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
			<a href="/updates">Updates</a>
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
		--light-green: #62bcad;
		--green: #439e8f;
		--dark-green: #2c685e;
		--darkest-green: #214f47;
		--white: #efefef;
		--orange: #fd904d;
		--light-orange: #feaf7f;
		--black: #212121;
		--dark-gray: #444;
	}

	:root {
		--accent: var(--light-green);
		--accent-bg: var(--dark-green);
		--bg: var(--black);
		--text: var(--orange);
		--text-light: var(--darkest-green);
		--border: var(--dark-green);
		--accent-light: var(--red);
		--code: var(--red);
		--preformatted: var(--dark-gray);
		--marked: var(--light-orange);
		--disabled: var(--white);
		--error: var(--red);
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
