import type { BasicDialogData } from '$lib/models/dialogData/BasicDialogData';

export interface QuestionDialogData extends BasicDialogData {
	questionText: string;
	answerYes: boolean;
}
