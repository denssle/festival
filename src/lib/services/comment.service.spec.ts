import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { startDB } from '$lib/db/db';
import { Comment } from '$lib/db/model/comment';
import { createFestival, createUser, resetDatabase } from '$lib/db/test-fixtures';
import { CommentService, type CommentTarget } from '$lib/services/comment.service';

/** Kommentare: nur der Autor ändert und löscht; die Liste weiß, welche die eigenen sind. */
describe('CommentService', () => {
	let author: string;
	let other: string;
	let target: CommentTarget;

	async function onlyCommentId(): Promise<string> {
		const comments = await Comment.findAll();
		expect(comments).toHaveLength(1);
		return comments[0].dataValues.id;
	}

	beforeAll(async () => {
		await startDB();
	});

	beforeEach(async () => {
		await resetDatabase();
		author = await createUser('autorin');
		other = await createUser('andere');
		target = { festivalId: await createFestival(author) };
		await CommentService.saveComment(author, target, 'Ich bringe Kuchen mit');
	});

	it('nur die Autorin darf ändern', async () => {
		const id = await onlyCommentId();
		expect(await CommentService.updateComment(other, id, 'gekapert')).toBe('Not authorized');
		expect(await CommentService.updateComment(author, id, 'Doch lieber Salat')).toBe('Success');
		expect((await Comment.findByPk(id))?.dataValues.comment).toBe('Doch lieber Salat');
	});

	it('nur die Autorin darf löschen', async () => {
		const id = await onlyCommentId();
		expect(await CommentService.deleteComment(other, id)).toBe('Not authorized');
		expect(await CommentService.deleteComment(author, id)).toBe('Success');
		expect(await Comment.count()).toBe(0);
	});

	it('meldet unbekannte Kommentare', async () => {
		expect(await CommentService.updateComment(author, crypto.randomUUID(), 'x')).toBe('Data Missing');
		expect(await CommentService.deleteComment(author, crypto.randomUUID())).toBe('Data Missing');
	});

	it('kennzeichnet die eigenen Kommentare, neueste zuerst', async () => {
		await new Promise((resolve) => setTimeout(resolve, 10));
		await CommentService.saveComment(other, target, 'Ich bringe Getränke');

		const asAuthor = await CommentService.getComments(target, author);
		expect(asAuthor.map((c) => [c.comment, c.yourComment, c.writtenBy?.nickname])).toEqual([
			['Ich bringe Getränke', false, 'andere'],
			['Ich bringe Kuchen mit', true, 'autorin']
		]);
	});

	it('trennt die Kommentare nach Ziel', async () => {
		await CommentService.saveComment(other, { profileUserId: author }, 'Hallo auf dem Profil');

		expect((await CommentService.getComments(target, author)).map((c) => c.comment)).toEqual(['Ich bringe Kuchen mit']);
		expect((await CommentService.getComments({ profileUserId: author }, author)).map((c) => c.comment)).toEqual([
			'Hallo auf dem Profil'
		]);
	});
});
