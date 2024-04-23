<script lang='ts'>
	import type { QuestionDialogData } from '$lib/models/dialogData/QuestionDialogData';
	import BaseDialog from '$lib/sharedComponents/BaseDialog.svelte';

	export let questionDialogData: QuestionDialogData;
</script>

<BaseDialog bind:dialogData={questionDialogData}>
	<p>{questionDialogData.questionText}</p>
</BaseDialog>
