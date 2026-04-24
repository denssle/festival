<script lang="ts">
	import type { QuestionDialogData } from '$lib/models/dialogData/QuestionDialogData';
	import BaseDialog from '$lib/sharedComponents/BaseDialog.svelte';

	let { questionDialogData = $bindable() }: { questionDialogData: QuestionDialogData } = $props();
</script>

<BaseDialog bind:dialogData={questionDialogData}>
	<p>{questionDialogData.questionText}</p>
</BaseDialog>
