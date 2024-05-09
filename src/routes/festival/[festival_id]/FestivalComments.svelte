<script lang='ts'>

	export let festivalId: string = '';

	async function handleSubmit(event: { currentTarget: EventTarget & HTMLFormElement }) {
		const data = new FormData(event.currentTarget);
		console.log(data);
		const response = await fetch('festival/' + festivalId + '/comments', {
			method: 'POST',
			body: data
		});
		/*
		const result: ActionResult = deserialize(await response.text());

		if (result.type === 'success') {
			// rerun all `load` functions, following the successful update
			await invalidateAll();
		}

		applyAction(result);
		 */
	}
</script>

<form>
	<label for='comment'>Kommentar: </label>
	<input
		type='text'
		id='comment'
		name='comment'>
	<p>
		<button on:submit|preventDefault={handleSubmit}>
			Absenden
		</button>
	</p>
</form>

