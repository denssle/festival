<script lang="ts">
	import type { NicknamePasswordFormData } from '$lib/models/NicknamePasswordFormData';
	import NicknamePasswordForm from '$lib/sharedComponents/NicknamePasswordForm.svelte';
	import type { ActionData } from '../../../.svelte-kit/types/src/routes/registration/$types';

	export let data: NicknamePasswordFormData;
	export let form: ActionData;
	console.log(form);
</script>

<NicknamePasswordForm {data} headline={'Registration'}>
	Bereits ein Konto? <a href="/login">Hier geht es zur Anmeldung.</a>
</NicknamePasswordForm>
