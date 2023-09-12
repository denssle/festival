<script>
	export let data;
</script>

{#if data?.error}
	<p class="error">Festival invalid</p>
{/if}

<h1>Neu anlegen</h1>
<form method="POST">
	<p>
		<input name="name" autocomplete="off" required value={data?.name ?? ''} placeholder="Name der Veranstaltung" />
		<textarea name="description" placeholder="Kurze Beschreibung" />
	</p>

	<p>
		<input name='startDate' type="date" placeholder="date" />
		<input name='startTime' type="time" placeholder="time" />
	</p>

	<button type="submit">Speichern</button>
	<a class="button" href="/">Zurück</a>
</form>
