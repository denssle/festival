<script>
	import EmailPasswordForm from '$lib/components/EmailPasswordForm.svelte';

	export let data;
	console.log('login data', data);
</script>

<h1>Login</h1>

<EmailPasswordForm data={data} />