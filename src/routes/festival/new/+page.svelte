<script lang='ts'>
</script>

<article>
	<h2>Neue Veranstaltung anlegen</h2>
	<section>
		<form method='POST'>
			<p>
				<input name='name' placeholder='Name der Veranstaltung' required />
				<textarea name='description' placeholder='Kurze Beschreibung' />
			</p>

			<p>
				<input name='startDate' placeholder='date' type='date' />
				<input name='startTime' placeholder='time' type='time' />
			</p>

			<p>
				<textarea name='location' placeholder='Ort' />
			</p>

			<p>
				<label>
					<input name='bringYourOwnFood' type='checkbox' />
					Gäste sollen etwas zu Essen mitbringen.
				</label>
				<label>
					<input name='bringYourOwnBottle' type='checkbox' />
					Gäste sollen etwas zu trinken mitbringen.
				</label>
			</p>

			<button type='submit'>Speichern</button>
			<a class='button' href='/'>Zurück</a>
		</form>
	</section>
</article>
