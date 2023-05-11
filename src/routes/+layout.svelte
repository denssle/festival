<script>
	import { authorized } from '$lib/stores/authorized-store.ts';

	function logout() {
		console.log('go out');
		console.log(document.cookie);
		// TODO Remove session cookie
		authorized.set(false);
	}

</script>

<nav>
	{#if $authorized}
		<a href='/'>Home</a>
		<a href='/settings'>Settings</a>
		<a href='/about'>About</a>
		<a href='/login' on:click|trusted={logout}>Logout</a>
	{:else}
		<a href='/login'>Login</a>
		<a href='/registration'>Registration</a>
	{/if}
</nav>

<slot />
