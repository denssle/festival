<script lang="ts">
	import { dateToString, dateToTimeString } from '$lib/utils/dateUtils';
	import type { FrontendFestivalEvent } from '$lib/models/FrontendFestivalEvent';

	export let data: FrontendFestivalEvent;
</script>

<form method="POST">
	<p>
		<input name="name" autocomplete="off" required value={data?.name ?? ''} placeholder="Name der Veranstaltung" />
		<textarea name="description" placeholder="Kurze Beschreibung" value={data?.description} />
	</p>

	<p>
		<input name="startDate" type="date" placeholder="date" value={dateToString(data.startDate)} />
		<input name="startTime" type="time" placeholder="time" value={dateToTimeString(data.startDate)} />
	</p>

	<p>
		<textarea name="location" placeholder="Ort" value={data.location} />
	</p>

	<p>
		<label>
			<input type="checkbox" bind:checked={data.bringYourOwnFood} name="bringYourOwnFood" />
			Gäste sollen etwas zu Essen mitbringen.
		</label>
		<label>
			<input type="checkbox" bind:checked={data.bringYourOwnBottle} name="bringYourOwnBottle" />
			Gäste sollen etwas zu trinken mitbringen.
		</label>
	</p>

	<button type="submit">Speichern</button>
	<a class="button" href={'/festival/' + data.id}>Zurück</a>
</form>
