<script lang="ts">
	import type { CancelInvitationDialogData } from '$lib/models/dialogData/CancelInvitationDialogData';

	export let cancelInvitationDialogData: CancelInvitationDialogData;

	$: if (cancelInvitationDialogData.dialog && cancelInvitationDialogData.showDialog)
		cancelInvitationDialogData.dialog.showModal();
</script>

<dialog bind:this={cancelInvitationDialogData.dialog} on:close={() => (cancelInvitationDialogData.showDialog = false)}>
	<h4>Leider bin ich bei dem Event nicht dabei</h4>

	<section>
		<label>
			Kommentar:
			<input type="text" id="comment" bind:value={cancelInvitationDialogData.comment} />
		</label>
	</section>

	<button on:click={() => cancelInvitationDialogData.dialog?.close()}> Absagen </button>
</dialog>
