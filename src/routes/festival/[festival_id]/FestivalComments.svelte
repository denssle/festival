<script lang='ts'>

	import { onMount } from 'svelte';
	import type { FrontendComment } from '$lib/models/FrontendComment';
	import type { QuestionDialogData } from '$lib/models/dialogData/QuestionDialogData';
	import QuestionDialog from '$lib/sharedComponents/QuestionDialog.svelte';
	import AvatarImage from '$lib/sharedComponents/AvatarImage.svelte';

	export let festivalId: string = '';

	let comments: FrontendComment[] = [];

	function handleSubmit(e: SubmitEvent) {
		const formData = new FormData(e.target as HTMLFormElement);
		fetch(festivalId + '/comments', {
			method: 'POST',
			body: formData
		}).then(() => {
			loadComments();
		});
	}

	function loadComments() {
		fetch(festivalId + '/comments', {
			method: 'GET'
		}).then((response) => {
			response.json().then((data: FrontendComment[]) => {
				comments = data;
			});
		});
	}

	onMount(() => {
		loadComments();
	});

	function deleteComment(commentId: string | undefined) {
		questionDialogData.showDialog = true;
		if (questionDialogData.dialog) {
			questionDialogData.dialog.onclose = () => {
				if (questionDialogData.answerYes) {
					fetch(festivalId + '/comments', {
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
			fetch(festivalId + '/comments', {
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
	<label for='comment'>Kommentar: </label>
	<textarea id='comment' name='comment' />
	<p>
		<button type='submit'>Absenden</button>
	</p>
</form>

{#each comments as comment}
	{@const notYours = !comment.yourComment}
	<fieldset>
		<legend>
			<AvatarImage userId={comment.writtenBy?.id} size={4}></AvatarImage>
			<a href='/user/{comment.writtenBy?.id}'>{comment.writtenBy?.nickname}</a>
		</legend>
		{#if comment.editMode}
			<textarea bind:value={comment.comment} />
		{:else }
			<p class='notice'>{comment.comment}</p>
		{/if}
		<button on:click={() => deleteComment(comment.id)} disabled={notYours}>Löschen</button>
		<button on:click={() => comment.editMode = !comment.editMode} disabled={notYours}>
			{#if comment.editMode}
				Abbrechen
			{:else }
				Bearbeiten
			{/if}
		</button>
		<button on:click={()=> updateComment(comment)} disabled={notYours || !comment.editMode}>
			Speichern
		</button>
	</fieldset>
{/each}

<style>
    legend {
        display: ruby;
    }
</style>