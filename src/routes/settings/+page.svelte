<script lang='ts'>
</script>

<article>
	<h2>Einstellungen</h2>
	<form autocomplete='on' method='POST'>
		<section>
			<details>
				<summary>Passwort</summary>
				<p>
					<label for='password'>Ändere dein Passwort: </label>
					<input id='password' name='password' placeholder='Passwort' type='password' value={''} />
				</p>
			</details>

			<p>
				<button type='submit'>Speichern</button>
			</p>
		</section>
	</form>
</article>
