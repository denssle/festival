<script lang="ts">
	import type { FrontendFestivalEvent } from '$lib/models/FrontendFestivalEvent';

	export let data: FrontendFestivalEvent;
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
