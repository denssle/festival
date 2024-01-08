<script lang="ts">
	import type { NicknamePasswordFormData } from '$lib/models/NicknamePasswordFormData';
	import NicknamePasswordForm from '$lib/sharedComponents/NicknamePasswordForm.svelte';
	import type { ActionData } from '../../../.svelte-kit/types/src/routes/registration/$types';

	export let data: NicknamePasswordFormData;
	export let form: ActionData;
	console.log('form', form);
</script>

<NicknamePasswordForm {data} headline={'Anmeldung'}>
	Noch kein Konto? <a href="/registration">Hier registrieren.</a>
</NicknamePasswordForm>
