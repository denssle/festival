<script lang="ts">
	import type { BaseDialogData } from '$lib/models/dialogData/BaseDialogData';
	export let dialogData: BaseDialogData;
	export let buttonLabels: { yes: string; no: string } = { yes: 'Ja', no: 'Nope' };
	$: if (dialogData.dialog && dialogData.showDialog) dialogData.dialog.showModal();

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
	<slot />

	<section style="text-align: right;">
		<button on:click={() => onNo()}>{buttonLabels.no}</button>
		<button on:click={() => onYes()}>{buttonLabels.yes}</button>
	</section>
</dialog>
