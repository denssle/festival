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
					<label for="currentPassword">Aktuelles Passwort: </label>
					<input
						id="currentPassword"
						name="currentPassword"
						placeholder="Aktuelles Passwort"
						type="password"
						autocomplete="current-password"
						required
					/>
				</p>
				<p>
					<label for="password">Neues Passwort: </label>
					<input
						id="password"
						name="password"
						placeholder="Neues Passwort"
						type="password"
						autocomplete="new-password"
						minlength={MIN_PASSWORD_LENGTH}
						required
					/>
				</p>
				<p>
					<label for="passwordRepeat">Neues Passwort wiederholen: </label>
					<input
						id="passwordRepeat"
						name="passwordRepeat"
						placeholder="Neues Passwort wiederholen"
						type="password"
						autocomplete="new-password"
						minlength={MIN_PASSWORD_LENGTH}
						required
					/>

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
