<script lang="ts">
	import type { BaseDialogData } from '$lib/models/dialogData/BaseDialogData';

	let {
		dialogData = $bindable(),
		buttonLabels = { yes: 'Ja', no: 'Nope' },
		children
	} = $props<{
		dialogData: BaseDialogData;
		buttonLabels?: { yes: string; no: string };
		children?: any;
	}>();

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
		dialogData.dialog?.dispatchEvent(new Event('close'));
	}
</script>

<dialog bind:this={dialogData.dialog}>
	{@render children?.()}

	<section style="text-align: right;">
		<button on:click={() => onNo()}>{buttonLabels.no}</button>
		<button on:click={() => onYes()}>{buttonLabels.yes}</button>
	</section>
</dialog>
