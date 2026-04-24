<script lang="ts">
	import type { BaseDialogData } from '$lib/models/dialogData/BaseDialogData';
	import type { Snippet } from 'svelte';

	let {
		dialogData = $bindable(),
		buttonLabels = { yes: 'Ja', no: 'Nope' },
		children
	}: {
		dialogData: BaseDialogData;
		buttonLabels?: { yes: string; no: string };
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

<dialog bind:this={dialogData.dialog}>
	{@render children?.()}

	<section style="text-align: right;">
		<button onclick={() => onNo()}>{buttonLabels.no}</button>
		<button onclick={() => onYes()}>{buttonLabels.yes}</button>
	</section>
</dialog>
