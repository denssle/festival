<script>
	export let form;
</script>

{#if form?.error}
	<p class='error'>{form.error}</p>
{/if}

<form method='POST'>
	<label>
		Name
		<input name='name'
					 autocomplete='off'
					 required
					 value={form?.name ?? ''}
		/>
	</label>

	<button type='submit'>Ok</button>
</form>
