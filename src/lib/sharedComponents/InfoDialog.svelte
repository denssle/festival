<script lang="ts">
	import { tr } from '$lib/i18n/tr';
	import type { InfoDialogData } from '$lib/models/dialogData/InfoDialogData';

	// testId: Liegen mehrere InfoDialogs auf einer Seite (etwa der Seite und der
	// Kommentare), braucht jeder eine eigene, sonst gibt es in Playwright eine
	// "strict mode violation".
	let { infoDialogData = $bindable(), testId = 'info-dialog' }: { infoDialogData: InfoDialogData; testId?: string } =
		$props();

	$effect(() => {
		if (infoDialogData.dialog && infoDialogData.showDialog && !infoDialogData.dialog.open) {
			infoDialogData.dialog.showModal();
		}
	});
</script>

<dialog
	data-testid={testId}
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
