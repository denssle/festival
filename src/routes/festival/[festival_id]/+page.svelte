<script>
	import { page } from '$app/stores';

	console.log(page);
	export let data;
</script>

<div>
	<h4>{data.name}</h4>
	<p>{data.description}</p>
	<a href="/festival/edit/{data.id}">Bearbeiten</a>
</div>

<style></style>
