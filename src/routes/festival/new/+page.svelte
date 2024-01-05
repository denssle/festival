<script lang="ts">
</script>

<article>
	<h2>Neue Veranstaltung anlegen</h2>
	<section>
		<form method="POST">
			<p>
				<input name="name" required placeholder="Name der Veranstaltung" />
				<textarea name="description" placeholder="Kurze Beschreibung" />
			</p>

			<p>
				<input name="startDate" type="date" placeholder="date" />
				<input name="startTime" type="time" placeholder="time" />
			</p>

			<p>
				<textarea name="location" placeholder="Ort" />
			</p>

			<p>
				<label>
					<input type="checkbox" name="bringYourOwnFood" />
					Gäste sollen etwas zu Essen mitbringen.
				</label>
				<label>
					<input type="checkbox" name="bringYourOwnBottle" />
					Gäste sollen etwas zu trinken mitbringen.
				</label>
			</p>

			<button type="submit">Speichern</button>
			<a class="button" href="/">Zurück</a>
		</form>
	</section>
</article>
