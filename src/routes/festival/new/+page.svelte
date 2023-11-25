<script lang="ts">
</script>

<article>
	<h2>Neue Veranstaltung anlegen</h2>
	<section>
		<form method="POST">
			<p>
				<input name="name" autocomplete="off" required placeholder="Name der Veranstaltung" />
				<textarea name="description" placeholder="Kurze Beschreibung" />
			</p>

			<p>
				<input name="startDate" type="date" placeholder="date" />
				<input name="startTime" type="time" placeholder="time" />
			</p>

			<button type="submit">Speichern</button>
			<a class="button" href="/">Zurück</a>
		</form>
	</section>
</article>
