<script>
	import EmailPasswordForm from '$lib/sharedComponents/EmailPasswordForm.svelte';

	export let data;
</script>

<EmailPasswordForm {data} headline={'Registration'}>
	Bereits ein Konto? <a href="/login">Hier geht es zur Anmeldung.</a>
</EmailPasswordForm>