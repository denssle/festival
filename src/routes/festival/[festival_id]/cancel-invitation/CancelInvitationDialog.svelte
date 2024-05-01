<script lang="ts">
	import type { CancelInvitationDialogData } from '$lib/models/dialogData/CancelInvitationDialogData';
	import BaseDialog from '$lib/sharedComponents/BaseDialog.svelte';

	export let cancelInvitationDialogData: CancelInvitationDialogData;
</script>

<BaseDialog bind:dialogData={cancelInvitationDialogData} buttonLabels={{ yes: 'Absagen', no: 'Zurück' }}>
	<p>Leider bin ich / sind wir bei dem Event nicht dabei.</p>

	<section>
		<label for="comment">Kommentar (optional):</label>
		<input bind:value={cancelInvitationDialogData.comment} id="comment" type="text" />
	</section>
</BaseDialog>
