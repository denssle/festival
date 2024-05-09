<script lang='ts'>

	export let festivalId: string = '';

	function handleSubmit(e: SubmitEvent) {
		const formData = new FormData(e.target as HTMLFormElement);
		fetch(festivalId + '/comments', {
			method: 'POST',
			body: formData
		}).then(value => {
			console.log(value);
		});
	}
</script>

<form on:submit|preventDefault={handleSubmit}>
	<label for='comment'>Kommentar: </label>
	<input type='text' id='comment' name='comment' />
	<p>
		<button type='submit'>Absenden</button>
	</p>
</form>
