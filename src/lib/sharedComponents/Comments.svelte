<script lang="ts">
	import { tr } from '$lib/i18n/tr';
	import { MAX_LONG_TEXT_LENGTH } from '$lib/services/text-length.logic';
	import { resolve } from '$app/paths';
	import type { FrontendComment } from '$lib/models/transferData/FrontendComment';
	import type { QuestionDialogData } from '$lib/models/dialogData/QuestionDialogData';
	import QuestionDialog from '$lib/sharedComponents/QuestionDialog.svelte';
	import AvatarImage from '$lib/sharedComponents/AvatarImage.svelte';
	import CreationChangedDate from '$lib/sharedComponents/CreationChangedDate.svelte';
	import InfoDialog from '$lib/sharedComponents/InfoDialog.svelte';
	import type { InfoDialogData } from '$lib/models/dialogData/InfoDialogData';
	import { request } from '$lib/utils/request';

	let { whereId = '' } = $props();

	let comments: FrontendComment[] = $state([]);
	let inputComment: string = $state('');

	// Nicht-reaktives Tracking des zuletzt geladenen Ziels. Bewusst kein $state,
	// damit das Schreiben den Effect nicht erneut auslöst.
	let loadedId: string | undefined;

	$effect(() => {
		if (whereId && whereId !== loadedId) {
			// Nur bei einem echten Wechsel des Ziels (z. B. anderes Profil/Festival) das
			// Eingabefeld leeren. Beim ersten Lauf NICHT leeren: Der Effect läuft erst nach
			// der Hydration und würde sonst eine bereits getätigte Eingabe (Race mit dem
			// SSR-gerenderten Textarea) wieder überschreiben.
			if (loadedId !== undefined) {
				inputComment = '';
			}
			loadedId = whereId;
			loadComments();
		}
	});

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		const form = e.target as HTMLFormElement;
		const formData = new FormData(form);
		const text: string = inputComment;
		const optimisticComment: FrontendComment = {
			id: crypto.randomUUID(),
			comment: text,
			createdAt: new Date(),
			updatedAt: new Date(),
			writtenTo: whereId,
			writtenBy: null,
			yourComment: true,
			editMode: false
		};
		inputComment = '';
		comments = [optimisticComment, ...comments];
		const result = await request(whereId + '/comments', {
			method: 'POST',
			body: formData
		});
		if (result.ok) {
			comments = await result.response.json();
		} else {
			// Optimistisch eingefügten Kommentar verwerfen, den Text aber zurückgeben –
			// sonst ist er weg, und der Nutzer erfährt nicht einmal, warum.
			comments = comments.filter((c) => c.id !== optimisticComment.id);
			inputComment = text;
			showError(result.message);
		}
	}

	async function loadComments() {
		const result = await request(whereId + '/comments', {
			method: 'GET'
		});
		if (result.ok) {
			comments = await result.response.json();
		} else {
			showError(result.message);
		}
	}

	async function deleteComment(commentId: string | undefined) {
		questionDialogData.answerYes = false;
		questionDialogData.showDialog = true;

		if (questionDialogData.dialog) {
			const onclose = async () => {
				if (questionDialogData.answerYes) {
					const result = await request(whereId + '/comments', {
						method: 'DELETE',
						headers: {
							'Content-Type': 'text/plain'
						},
						body: commentId
					});
					if (!result.ok) {
						showError(result.message);
					}
					await loadComments();
				}
				questionDialogData.dialog?.removeEventListener('close', onclose);
				questionDialogData.answerYes = false;
			};
			questionDialogData.dialog.addEventListener('close', onclose);
		} else {
			console.error('no dialog');
		}
	}

	async function updateComment(comment: FrontendComment) {
		if (comment.yourComment) {
			const index = comments.findIndex((c) => c.id === comment.id);
			if (index !== -1) {
				comments[index].editMode = false;
			}
			const result = await request(whereId + '/comments', {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					id: comment.id,
					comment: comment.comment
				})
			});
			if (result.ok) {
				comments = await result.response.json();
			} else {
				// Bearbeitungsmodus wieder öffnen, damit der geänderte Text nicht verloren geht.
				if (index !== -1) {
					comments[index].editMode = true;
				}
				showError(result.message);
			}
		}
	}

	function showError(message: string) {
		infoDialogData.infoDialogText = message;
		infoDialogData.showDialog = true;
	}

	let infoDialogData: InfoDialogData = $state({
		showDialog: false,
		infoDialogText: '',
		dialog: undefined,
		answerYes: false
	});

	let questionDialogData: QuestionDialogData = $state({
		showDialog: false,
		dialog: undefined,
		questionText: tr('comment.deleteConfirm'),
		answerYes: false
	});
</script>

<QuestionDialog bind:questionDialogData testId="comment-delete-dialog" />
<InfoDialog bind:infoDialogData testId="comment-error-dialog" />

<form onsubmit={handleSubmit}>
	<label for="comment">{tr('comment.label')} </label>
	<textarea id="comment" name="comment" maxlength={MAX_LONG_TEXT_LENGTH} bind:value={inputComment}></textarea>
	<p>
		<button type="submit" data-testid="comment-submit">{tr('comment.submit')}</button>
	</p>
</form>

{#each comments as comment (comment.id)}
	{@const notYours = !comment.yourComment}
	<fieldset>
		<legend>
			<AvatarImage userId={comment.writtenBy?.id} size={4}></AvatarImage>
			<a href={resolve('/user/[user_id]', { user_id: comment.writtenBy?.id ?? '' })}>{comment.writtenBy?.nickname}</a>
		</legend>
		{#if comment.editMode}
			<textarea name="updateComment" maxlength={MAX_LONG_TEXT_LENGTH} bind:value={comment.comment}></textarea>
		{:else}
			<p class="notice">{comment.comment}</p>
		{/if}
		{#if comment.yourComment}
			<div>
				<button data-testid="comment-delete" onclick={() => deleteComment(comment.id)} disabled={notYours}
					>{tr('action.delete')}</button
				>
				<button
					data-testid="comment-edit-toggle"
					onclick={() => (comment.editMode = !comment.editMode)}
					disabled={notYours}
				>
					{#if comment.editMode}
						{tr('form.cancel')}
					{:else}
						{tr('action.edit')}
					{/if}
				</button>
				<button
					data-testid="comment-save"
					onclick={() => updateComment(comment)}
					disabled={notYours || !comment.editMode}
				>
					{tr('form.save')}</button
				>
			</div>
		{/if}
		<CreationChangedDate createdAt={comment.createdAt} updatedAt={comment.updatedAt} />
	</fieldset>
{:else}
	<p>{tr('comment.empty')}</p>
{/each}

<style>
	legend {
		display: ruby;
	}
</style>
