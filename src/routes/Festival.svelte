<script>

	export let data;
</script>

{#if data?.error}
	<p class='error'>Festival invalid</p>
{/if}

<form method='POST'>
	<label>
		Name
		<input name='name'
					 autocomplete='off'
					 required
					 value={data?.name ?? ''}
		/>
	</label>

	<button type='submit'>Ok</button>
</form>