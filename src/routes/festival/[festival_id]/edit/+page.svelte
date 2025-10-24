<script lang="ts">
	import { dateToHHMM, dateToString } from '$lib/utils/date.util';
	import type { FrontendFestivalEvent } from '$lib/models/festivalEvent/FrontendFestivalEvent';

	export let data: FrontendFestivalEvent;
</script>

<article>
	<form method="POST">
		<p>
			<input autocomplete="off" name="name" placeholder="Name der Veranstaltung" required value={data?.name ?? ''} />
			<textarea name="description" placeholder="Kurze Beschreibung" value={data?.description}></textarea>
		</p>

		<p>
			<input name="startDate" placeholder="date" type="date" value={dateToString(data.startDate)} />
			<input name="startTime" placeholder="time" type="time" value={dateToHHMM(data.startDate)} />
		</p>

		<p>
			<textarea name="location" placeholder="Ort" value={data.location}></textarea>
		</p>

		<p>
			<label>
				<input bind:checked={data.bringYourOwnFood} name="bringYourOwnFood" type="checkbox" />
				Gäste sollen etwas zu Essen mitbringen.
			</label>
			<label>
				<input bind:checked={data.bringYourOwnBottle} name="bringYourOwnBottle" type="checkbox" />
				Gäste sollen etwas zu trinken mitbringen.
			</label>
		</p>

		<button type="submit">Speichern</button>
		<a class="button" href={'/festival/' + data.id}>Zurück</a>
	</form>
</article>
