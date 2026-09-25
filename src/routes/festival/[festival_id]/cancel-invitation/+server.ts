import { answerWithCommentHandler } from '$lib/controller/answer.controller';

/**
 * POST /festival/:festival_id/cancel-invitation
 *
 * Sagt ab („nicht dabei“). Der optionale Kommentar im Body wird als Begründung gespeichert.
 * Details siehe `answerWithCommentHandler`.
 */
export const POST = answerWithCommentHandler('no');
