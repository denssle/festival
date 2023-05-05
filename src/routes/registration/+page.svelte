<script>
	import EmailPasswordForm from '$lib/components/EmailPasswordForm.svelte';

	export let data;
</script>

<h1>Registration</h1>

<EmailPasswordForm data={data} />