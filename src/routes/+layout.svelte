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
		<a href="/">Home</a>
		<a href="/festival/new">Neu</a>
		<a href="/settings">Settings</a>
		<a href="/about">About</a>
		<button on:click|trusted={logout}>Logout</button>
	{:else}
		<a href="/login">Login</a>
		<a href="/registration">Registration</a>
	{/if}
</nav>

<slot />

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

	:global(button) {
		width: 5vw;
		padding: 1%;
	}

	button.valid {
		background-color: var(--green);
	}

	nav {
		display: flex;
		justify-content: center;
		gap: 3vw;
	}
</style>
