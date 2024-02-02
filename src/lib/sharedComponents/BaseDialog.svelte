<script lang="ts">
	import type { BaseDialogData } from '$lib/models/dialogData/BaseDialogData';
	export let dialogData: BaseDialogData;

	$: if (dialogData.dialog && dialogData.showDialog) dialogData.dialog.showModal();

	function onYes() {
		dialogData.answerYes = true;
		dialogData.dialog?.close();
	}

	function onNo() {
		dialogData.answerYes = false;
		dialogData.dialog?.close();
	}
</script>

<dialog bind:this={dialogData.dialog} on:close={() => (dialogData.showDialog = false)}>

	<slot />

	<section>
		<button on:click={() => onNo()}>Nope</button>
		<button on:click={() => onYes()}>Ja</button>
	</section>
</dialog>
