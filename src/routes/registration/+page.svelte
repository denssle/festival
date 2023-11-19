<script lang="ts">
	import type { NicknamePasswordFormData } from '$lib/models/NicknamePasswordFormData';
	import NicknamePasswordForm from '$lib/sharedComponents/NicknamePasswordForm.svelte';

	export let data: NicknamePasswordFormData;
</script>

<NicknamePasswordForm {data} headline={'Registration'}>
	Bereits ein Konto? <a href="/login">Hier geht es zur Anmeldung.</a>
</NicknamePasswordForm>
