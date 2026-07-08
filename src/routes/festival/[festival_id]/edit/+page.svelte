<script lang="ts">
	import { untrack } from 'svelte';
	import { dateToHHMM, dateToString } from '$lib/utils/date.util';
	import type { FrontendFestivalEvent } from '$lib/models/festivalEvent/FrontendFestivalEvent';

	let { data }: { data: FrontendFestivalEvent } = $props();

	// Formular einmalig aus data vorbefüllen (gilt für SSR und Client). Bewusst KEIN $effect,
	// der formData nachträglich aus data setzt: Der Effect liefe erst nach der Hydration und
	// würde eine bereits getätigte Eingabe (bind:value) wieder mit den Altwerten überschreiben
	// – ein Race, der zum Speichern der alten Werte führt. untrack signalisiert Svelte, dass
	// der einmalige Snapshot von data hier gewollt ist (kein reaktives Nachziehen).
	let formData = $state(
		untrack(() => ({
			name: data?.name ?? '',
			description: data?.description ?? '',
			startDate: dateToString(data.startDate),
			startTime: dateToHHMM(data.startDate),
			location: data.location ?? '',
			bringYourOwnFood: data.bringYourOwnFood,
			bringYourOwnBottle: data.bringYourOwnBottle
		}))
	);
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
