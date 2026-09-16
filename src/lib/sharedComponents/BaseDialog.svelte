<script lang="ts">
	import type { BaseDialogData } from '$lib/models/dialogData/BaseDialogData';
	import type { Snippet } from 'svelte';

	let {
		dialogData = $bindable(),
		buttonLabels = { yes: 'Ja', no: 'Nope' },
		testId = 'base-dialog',
		children
	}: {
		dialogData: BaseDialogData;
		buttonLabels?: { yes: string; no: string };
		/** Kennung fuer E2E-Tests. Ueberschreiben, wenn eine Seite mehrere Dialoge zeigt. */
		testId?: string;
		children?: Snippet;
	} = $props();

	$effect(() => {
		if (dialogData.dialog && dialogData.showDialog) {
			dialogData.dialog.showModal();
		}
	});

	function onYes() {
		dialogData.answerYes = true;
		closeDialog();
	}

	function onNo() {
		dialogData.answerYes = false;
		closeDialog();
	}

	function closeDialog() {
		dialogData.dialog?.close();
		dialogData.showDialog = false;
	}
</script>

<dialog bind:this={dialogData.dialog} data-testid={testId}>
	{@render children?.()}

	<section style="text-align: right;">
		<button data-testid="dialog-no" onclick={() => onNo()}>{buttonLabels.no}</button>
		<button data-testid="dialog-yes" onclick={() => onYes()}>{buttonLabels.yes}</button>
	</section>
</dialog>
