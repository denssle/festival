<script lang="ts">
	import type { QuestionDialogData } from '$lib/models/dialogData/QuestionDialogData';
	export let questionDialogData: QuestionDialogData;

	$: if (questionDialogData.dialog && questionDialogData.showDialog) questionDialogData.dialog.showModal();

	function onYes() {
		questionDialogData.answerYes = true;
		questionDialogData.dialog?.close();
	}

	function onNo() {
		questionDialogData.answerYes = false;
		questionDialogData.dialog?.close();
	}
</script>

<dialog bind:this={questionDialogData.dialog} on:close={() => (questionDialogData.showDialog = false)}>
	<p>{questionDialogData.questionText}</p>
	<button on:click={() => onNo()}>Nope</button>
	<button on:click={() => onYes()}>Ja</button>
</dialog>
