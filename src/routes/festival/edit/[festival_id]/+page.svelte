<script>
	import { page } from '$app/stores';

	export let data;
</script>

<form method="POST">
	<label>
		Name
		<input name="name" required value={data?.name ?? ''} />
	</label>

	<div>
		<label>
			Beschreibung
			<textarea name="description" value={data?.description ?? ''} />
		</label>
	</div>

	<button type="submit">Ok</button>
</form>

<style></style>
