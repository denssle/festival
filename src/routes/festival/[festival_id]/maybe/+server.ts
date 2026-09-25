import { answerWithCommentHandler } from '$lib/controller/answer.controller';

/**
 * POST /festival/:festival_id/maybe
 *
 * Antwortet mit „vielleicht“. Der optionale Kommentar im Body sagt, woran es hängt.
 * Details siehe `answerWithCommentHandler`.
 */
export const POST = answerWithCommentHandler('maybe');
