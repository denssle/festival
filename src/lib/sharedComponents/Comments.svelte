<script lang="ts">
	import { resolve } from '$app/paths';
	import type { FrontendComment } from '$lib/models/transferData/FrontendComment';
	import type { QuestionDialogData } from '$lib/models/dialogData/QuestionDialogData';
	import QuestionDialog from '$lib/sharedComponents/QuestionDialog.svelte';
	import AvatarImage from '$lib/sharedComponents/AvatarImage.svelte';
	import CreationChangedDate from '$lib/sharedComponents/CreationChangedDate.svelte';

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
		const optimisticComment: FrontendComment = {
			id: crypto.randomUUID(),
			comment: inputComment,
			createdAt: new Date(),
			updatedAt: new Date(),
			writtenTo: whereId,
			writtenBy: null,
			yourComment: true,
			editMode: false
		};
		inputComment = '';
		comments = [optimisticComment, ...comments];
		const response = await fetch(whereId + '/comments', {
			method: 'POST',
			body: formData
		});
		if (response.ok) {
			comments = await response.json();
		} else {
			// Optimistisch eingefügten Kommentar wieder verwerfen
			await loadComments();
		}
	}

	async function loadComments() {
		const response = await fetch(whereId + '/comments', {
			method: 'GET'
		});
		if (response.ok) {
			comments = await response.json();
		}
	}

	async function deleteComment(commentId: string | undefined) {
		questionDialogData.answerYes = false;
		questionDialogData.showDialog = true;

		if (questionDialogData.dialog) {
			const onclose = async () => {
				if (questionDialogData.answerYes) {
					await fetch(whereId + '/comments', {
						method: 'DELETE',
						headers: {
							'Content-Type': 'text/plain'
						},
						body: commentId
					});
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
			const response = await fetch(whereId + '/comments', {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					id: comment.id,
					comment: comment.comment
				})
			});
			if (response.ok) {
				comments = await response.json();
			}
		}
	}

	let questionDialogData: QuestionDialogData = $state({
		showDialog: false,
		dialog: undefined,
		questionText: 'Kommentar löschen. Bist du dir sicher?',
		answerYes: false
	});
</script>

<QuestionDialog bind:questionDialogData />

<form onsubmit={handleSubmit}>
	<label for="comment">Kommentar: </label>
	<textarea id="comment" name="comment" bind:value={inputComment}></textarea>
	<p>
		<button type="submit">Absenden</button>
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
			<textarea name="updateComment" bind:value={comment.comment}></textarea>
		{:else}
			<p class="notice">{comment.comment}</p>
		{/if}
		{#if comment.yourComment}
			<div>
				<button onclick={() => deleteComment(comment.id)} disabled={notYours}>Löschen</button>
				<button onclick={() => (comment.editMode = !comment.editMode)} disabled={notYours}>
					{#if comment.editMode}
						Abbrechen
					{:else}
						Bearbeiten
					{/if}
				</button>
				<button onclick={() => updateComment(comment)} disabled={notYours || !comment.editMode}> Speichern</button>
			</div>
		{/if}
		<CreationChangedDate createdAt={comment.createdAt} updatedAt={comment.updatedAt} />
	</fieldset>
{:else}
	<p>Noch keine Kommentare. Schreib den ersten!</p>
{/each}

<style>
	legend {
		display: ruby;
	}
</style>
