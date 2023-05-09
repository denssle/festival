<script>
	import { authorized } from '$lib/stores/authorized-store.ts';

	function logout() {
		console.log('go out');
		authorized.set(false);
	}

</script>

<nav>
	<a href='/'>Home</a>
	<a href='/about'>About</a>
	{#if $authorized}
		<a href='/settings'>Settings</a>
		<a href='/login' on:click|trusted={logout}>Logout</a>
	{:else}
		<a href='/login'>Login</a>
		<a href='/registration'>Registration</a>
	{/if}
</nav>

<slot />
