<script lang='ts'>

	import { onMount } from 'svelte';
	import type { FrontendComment } from '$lib/models/FrontendComment';

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
</script>

<form on:submit|preventDefault={handleSubmit}>
	<label for='comment'>Kommentar: </label>
	<textarea id='comment' name='comment' />
	<p>
		<button type='submit'>Absenden</button>
	</p>
</form>

{#each comments as comment}
	<fieldset>
		<legend><a href="/user/{comment.writtenBy?.id}">{comment.writtenBy?.nickname}</a></legend>
		<p class='notice'>{comment.comment}</p>
	</fieldset>
{/each}
