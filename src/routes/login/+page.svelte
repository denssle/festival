<script>
	import EmailPasswordForm from '$lib/components/EmailPasswordForm.svelte';

	export let data;
</script>

<h1>Login</h1>

<EmailPasswordForm data={data} />