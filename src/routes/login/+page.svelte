<script lang="ts">
	import EmailPasswordForm from '$lib/sharedComponents/EmailPasswordForm.svelte';
	import type { EmailPasswordFormData } from "$lib/sharedComponents/EmailPasswordFormData";

	export let data: EmailPasswordFormData;
</script>

<EmailPasswordForm {data} headline={'Anmeldung'}>
	Noch kein Konto? <a href="/registration">Hier registrieren.</a>
</EmailPasswordForm>
