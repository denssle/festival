<script lang="ts">
	import type { InfoDialogData } from '$lib/models/dialogData/InfoDialogData';
	export let infoDialogData: InfoDialogData;

	$: if (infoDialogData.dialog && infoDialogData.showDialog) infoDialogData.dialog.showModal();
</script>

<dialog bind:this={infoDialogData.dialog} on:close={() => (infoDialogData.showDialog = false)}>
	<p>{infoDialogData.infoDialogText}</p>
	<button on:click={() => infoDialogData.dialog?.close()} style="float: right">Okay</button>
</dialog>
