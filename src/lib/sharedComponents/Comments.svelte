<script lang="ts">
	import { afterUpdate, onMount } from 'svelte';
	import type { FrontendComment } from '$lib/models/FrontendComment';
	import type { QuestionDialogData } from '$lib/models/dialogData/QuestionDialogData';
	import QuestionDialog from '$lib/sharedComponents/QuestionDialog.svelte';
	import AvatarImage from '$lib/sharedComponents/AvatarImage.svelte';
	import CreationChangedDate from '$lib/sharedComponents/CreationChangedDate.svelte';

	export let whereId: string = '';

	let comments: FrontendComment[] = [];
	let previousWhereId: string;
	let inputComment: string;

	onMount(() => {
		previousWhereId = whereId;
		loadComments();
	});

	afterUpdate(() => {
		if (previousWhereId !== whereId) {
			previousWhereId = whereId;
			inputComment = '';
			loadComments();
		}
	});

	function handleSubmit(e: SubmitEvent) {
		const formData = new FormData(e.target as HTMLFormElement);
		fetch(whereId + '/comments', {
			method: 'POST',
			body: formData
		}).then(() => {
			loadComments();
			inputComment = '';
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
		questionDialogData.showDialog = true;
		if (questionDialogData.dialog) {
			questionDialogData.dialog.onclose = () => {
				if (questionDialogData.answerYes) {
					fetch(whereId + '/comments', {
						method: 'DELETE',
						body: commentId
					}).then(() => {
						loadComments();
					});
				}
			};
		}
	}

	function updateComment(comment: FrontendComment) {
		if (comment.yourComment) {
			fetch(whereId + '/comments', {
				method: 'PUT',
				body: JSON.stringify(comment)
			}).then(() => {
				loadComments();
			});
		}
	}

	let questionDialogData: QuestionDialogData = {
		showDialog: false,
		dialog: undefined,
		questionText: 'Kommentar löschen. Bist du dir sicher?',
		answerYes: false
	};
</script>

<QuestionDialog bind:questionDialogData />
<form on:submit|preventDefault={handleSubmit}>
	<label for="comment">Kommentar: </label>
	<textarea id="comment" name="comment" bind:value={inputComment} />
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
			<textarea bind:value={comment.comment} />
		{:else}
			<p class="notice">{comment.comment}</p>
		{/if}
		{#if comment.yourComment}
			<div>
				<button on:click={() => deleteComment(comment.id)} disabled={notYours}>Löschen</button>
				<button on:click={() => (comment.editMode = !comment.editMode)} disabled={notYours}>
					{#if comment.editMode}
						Abbrechen
					{:else}
						Bearbeiten
					{/if}
				</button>
				<button on:click={() => updateComment(comment)} disabled={notYours || !comment.editMode}> Speichern</button>
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
