import { BaseDialogData } from '$lib/models/dialogData/BaseDialogData';
import type { CommentAnswer } from '$lib/models/Answer';

export interface CancelInvitationDialogData extends BaseDialogData {
	comment: string;
	/** Absage ('no') oder „Vielleicht“ ('maybe') – derselbe Dialog, andere Texte. */
	answer: CommentAnswer;
}
