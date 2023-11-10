<script lang="ts">

	import { dateToDateString, dateToTimeString } from '$lib/utils/dateUtils';
	import type { FrontendFestivalEvent } from '$lib/models/FrontendFestivalEvent';

	export let data: FrontendFestivalEvent;
</script>

<form method="POST">
	<p>
		<input name="name" autocomplete="off" required value={data?.name ?? ''} placeholder="Name der Veranstaltung" />
		<textarea name="description" placeholder="Kurze Beschreibung" />
	</p>

	<p>
		<input name="startDate" type="date" placeholder="date" value={dateToDateString(data.startDate)} />
		<input name="startTime" type="time" placeholder="time" value={dateToTimeString(data.startDate)} />
	</p>

	<button type="submit">Speichern</button>
	<a class="button" href={'/festival/' + data.id}>Zurück</a>
</form>
