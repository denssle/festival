<script lang="ts">
	import type { QuestionDialogData } from '$lib/models/dialogData/QuestionDialogData';
	import BaseDialog from '$lib/sharedComponents/BaseDialog.svelte';

	// buttonLabels wird an BaseDialog durchgereicht: bei folgenschweren Fragen ist
	// "Endgültig löschen"/"Abbrechen" deutlicher als das voreingestellte "Ja"/"Nope".
	let {
		questionDialogData = $bindable(),
		buttonLabels,
		testId
	}: {
		questionDialogData: QuestionDialogData;
		buttonLabels?: { yes: string; no: string };
		testId?: string;
	} = $props();
</script>

<BaseDialog
	bind:dialogData={questionDialogData}
	{...buttonLabels ? { buttonLabels } : {}}
	{...testId ? { testId } : {}}
>
	<p>{questionDialogData.questionText}</p>
</BaseDialog>
