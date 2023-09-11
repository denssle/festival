<script>
	import EmailPasswordForm from '$lib/components/EmailPasswordForm.svelte';

	export let data;
</script>

<EmailPasswordForm {data} headline={'Registration'}>
	Bereits ein Konto? <a class="button" href="/login">Login</a>
</EmailPasswordForm>