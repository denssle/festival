<script>
	import EmailPasswordForm from '$lib/components/EmailPasswordForm.svelte';

	export let data;
</script>

<EmailPasswordForm {data} headline={'Anmeldung'}>
	Noch kein Konto? <a href="/registration">Hier registrieren.</a>
</EmailPasswordForm>
