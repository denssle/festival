<script>
	export let data;
</script>

<h1>Registration</h1>

<form method='POST'>
	<label>
		email
		<input name='email' required value={data?.email ?? ''} type='email' />
	</label>

	<label>
		password
		<input name='password' required value={data?.password ?? ''} type='password' />
	</label>

	<button type='submit'>Ok</button>
</form>