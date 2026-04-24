<script lang="ts">
	let { form }: { form: any } = $props();
</script>

<article>
	<h2>Einstellungen</h2>
	<form autocomplete="on" method="POST">
		<section>
			<details>
				<summary>Passwort</summary>
				<p>
					<label for="password">Ändere dein Passwort: </label>
					<input id="password" name="password" placeholder="Passwort" type="password" value={''} />

					{#if form?.message}
						<span>{form.message}</span>
					{/if}
				</p>
			</details>

			<p>
				<button type="submit">Speichern</button>
			</p>
		</section>
	</form>
</article>
