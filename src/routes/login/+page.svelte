<script lang="ts">
	import type { NicknamePasswordFormData } from '$lib/models/NicknamePasswordFormData';
	import NicknamePasswordForm from '$lib/sharedComponents/NicknamePasswordForm.svelte';

	export let data: NicknamePasswordFormData;
</script>

<NicknamePasswordForm {data} headline={'Anmeldung'}>
	Noch kein Konto? <a href="/registration">Hier registrieren.</a>
</NicknamePasswordForm>
