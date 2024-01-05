import type { BaseDialogData } from '$lib/models/dialogData/BaseDialogData';

export interface QuestionDialogData extends BaseDialogData {
	questionText: string;
	answerYes: boolean;
}
