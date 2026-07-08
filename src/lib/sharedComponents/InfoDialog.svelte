<script lang="ts">
	import type { InfoDialogData } from '$lib/models/dialogData/InfoDialogData';

	let { infoDialogData = $bindable() }: { infoDialogData: InfoDialogData } = $props();

	$effect(() => {
		if (infoDialogData.dialog && infoDialogData.showDialog && !infoDialogData.dialog.open) {
			infoDialogData.dialog.showModal();
		}
	});
</script>

<dialog
	bind:this={infoDialogData.dialog}
	onclose={() => {
		infoDialogData.showDialog = false;
		infoDialogData.onClose?.();
	}}
>
	<p>{infoDialogData.infoDialogText}</p>
	<button onclick={() => infoDialogData.dialog?.close()} style="float: right">Okay</button>
</dialog>
