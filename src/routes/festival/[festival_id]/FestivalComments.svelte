<script lang='ts'>

	import { onMount } from 'svelte';
	import type { FrontendComment } from '$lib/models/FrontendComment';
	import type { QuestionDialogData } from '$lib/models/dialogData/QuestionDialogData';
	import QuestionDialog from '$lib/sharedComponents/QuestionDialog.svelte';

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
		// TODO Check if own comment. Lol
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

	let questionDialogData: QuestionDialogData = {
		showDialog: false,
		dialog: undefined,
		questionText: 'Bist du dir sicher?',
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
	<fieldset>
		<legend><a href='/user/{comment.writtenBy?.id}'>{comment.writtenBy?.nickname}</a></legend>
		<p class='notice'>{comment.comment}</p>
		<button on:click={() => deleteComment(comment.id)}>Löschen</button>
	</fieldset>
{/each}
