<script lang="ts">
	import { tr } from '$lib/i18n/tr';
	import type { InfoDialogData } from '$lib/models/dialogData/InfoDialogData';

	let { infoDialogData = $bindable() }: { infoDialogData: InfoDialogData } = $props();

	$effect(() => {
		if (infoDialogData.dialog && infoDialogData.showDialog && !infoDialogData.dialog.open) {
			infoDialogData.dialog.showModal();
		}
	});
</script>

<dialog
	data-testid="info-dialog"
	bind:this={infoDialogData.dialog}
	onclose={() => {
		infoDialogData.showDialog = false;
		infoDialogData.onClose?.();
	}}
>
	<p>{infoDialogData.infoDialogText}</p>
	<button data-testid="info-ok" onclick={() => infoDialogData.dialog?.close()} style="float: right"
		>{tr('dialog.ok')}</button
	>
</dialog>
