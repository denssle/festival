<script lang="ts">
	import EmailPasswordForm from '$lib/sharedComponents/EmailPasswordForm.svelte';
	import type { EmailPasswordFormData } from '$lib/models/EmailPasswordFormData';

	export let data: EmailPasswordFormData;
</script>

<EmailPasswordForm {data} headline={'Registration'}>
	Bereits ein Konto? <a href="/login">Hier geht es zur Anmeldung.</a>
</EmailPasswordForm>
