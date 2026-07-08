<script lang="ts">
	import { dateToHHMM, dateToString } from '$lib/utils/date.util';
	import type { FrontendFestivalEvent } from '$lib/models/festivalEvent/FrontendFestivalEvent';

	let { data }: { data: FrontendFestivalEvent } = $props();

	let formData = $state({
		name: '',
		description: '',
		startDate: '',
		startTime: '',
		location: '',
		bringYourOwnFood: false,
		bringYourOwnBottle: false
	});

	$effect(() => {
		formData.name = data?.name ?? '';
		formData.description = data?.description ?? '';
		formData.startDate = dateToString(data.startDate);
		formData.startTime = dateToHHMM(data.startDate);
		formData.location = data.location ?? '';
		formData.bringYourOwnFood = data.bringYourOwnFood;
		formData.bringYourOwnBottle = data.bringYourOwnBottle;
	});
</script>

<article>
	<form method="POST">
		<p>
			<input name="name" placeholder="Name der Veranstaltung" required bind:value={formData.name} />
		</p>
		<p>
			<textarea name="description" placeholder="Kurze Beschreibung" bind:value={formData.description}></textarea>
		</p>

		<p>
			<input name="startDate" placeholder="date" type="date" bind:value={formData.startDate} />
			<input name="startTime" placeholder="time" type="time" bind:value={formData.startTime} />
		</p>

		<p>
			<textarea name="location" placeholder="Ort" bind:value={formData.location}></textarea>
		</p>

		<p>
			<label>
				<input type="checkbox" name="bringYourOwnFood" bind:checked={formData.bringYourOwnFood} />
				Gäste sollen etwas zu Essen mitbringen.
			</label>
			<label>
				<input type="checkbox" name="bringYourOwnBottle" bind:checked={formData.bringYourOwnBottle} />
				Gäste sollen etwas zu trinken mitbringen.
			</label>
		</p>

		<button type="submit">Speichern</button>
		<a class="button" href={'/festival/' + data.id}>Zurück</a>
	</form>
</article>
