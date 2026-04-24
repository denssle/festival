<script lang="ts">
	import type { FrontendComment } from '$lib/models/transferData/FrontendComment';
	import type { QuestionDialogData } from '$lib/models/dialogData/QuestionDialogData';
	import QuestionDialog from '$lib/sharedComponents/QuestionDialog.svelte';
	import AvatarImage from '$lib/sharedComponents/AvatarImage.svelte';
	import CreationChangedDate from '$lib/sharedComponents/CreationChangedDate.svelte';

	let { whereId = '' } = $props();

	let comments: FrontendComment[] = $state([]);
	let inputComment: string = $state('');

	$effect(() => {
		if (whereId) {
			inputComment = '';
			loadComments();
		}
	});

	function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		const form = e.target as HTMLFormElement;
		const formData = new FormData(form);
		fetch(whereId + '/comments', {
			method: 'POST',
			body: formData
		}).then(() => {
			inputComment = '';
			loadComments();
		});
	}

	function loadComments() {
		fetch(whereId + '/comments', {
			method: 'GET'
		}).then((response) => {
			response.json().then((data: FrontendComment[]) => {
				comments = data;
			});
		});
	}

	function deleteComment(commentId: string | undefined) {
		questionDialogData.answerYes = false;
		questionDialogData.showDialog = true;

		if (questionDialogData.dialog) {
			const onclose = () => {
				if (questionDialogData.answerYes) {
					fetch(whereId + '/comments', {
						method: 'DELETE',
						headers: {
							'Content-Type': 'text/plain'
						},
						body: commentId
					}).then(() => {
						loadComments();
					});
				}
				questionDialogData.dialog?.removeEventListener('close', onclose);
				questionDialogData.answerYes = false;
			};
			questionDialogData.dialog.addEventListener('close', onclose);
		} else {
			console.error('no dialog');
		}
	}

	function updateComment(comment: FrontendComment) {
		if (comment.yourComment) {
			fetch(whereId + '/comments', {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					id: comment.id,
					comment: comment.comment
				})
			}).then(() => {
				const index = comments.findIndex((c) => c.id === comment.id);
				if (index !== -1) {
					comments[index].editMode = false;
				}
				loadComments();
			});
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

{#each comments as comment}
	{@const notYours = !comment.yourComment}
	<fieldset>
		<legend>
			<AvatarImage userId={comment.writtenBy?.id} size={4}></AvatarImage>
			<a href="/user/{comment.writtenBy?.id}">{comment.writtenBy?.nickname}</a>
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
{/each}

<style>
	legend {
		display: ruby;
	}
</style>
