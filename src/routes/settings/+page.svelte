<script lang="ts">
	import type { ActionData } from './$types';
	import { MIN_PASSWORD_LENGTH } from '$lib/constants';

	let { form }: { form: ActionData } = $props();
</script>

<article>
	<h2>Einstellungen</h2>
	<form autocomplete="on" method="POST">
		<section>
			<details>
				<summary>Passwort</summary>
				<p>
					<label for="password">Ändere dein Passwort: </label>
					<input id="password" name="password" placeholder="Passwort" type="password" minlength={MIN_PASSWORD_LENGTH} />

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
