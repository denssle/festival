<script>
	import EmailPasswordForm from '$lib/components/EmailPasswordForm.svelte';

	export let data;
</script>

<EmailPasswordForm {data} headline={'Login'}>
	Noch kein Konto? <a class="button" href="/registration">Registration</a>
</EmailPasswordForm>
