<script lang="ts">
	import type { LoginRegisterFormData } from '$lib/models/LoginRegisterFormData';

	export let data: LoginRegisterFormData;
</script>

<article>
	<h2>Registration</h2>

	<form method="POST">
		<section>
			<p>
				<input name="nickname" required bind:value={data.nickname} type="text" placeholder="Nickname" minlength="3" />
			</p>

			<p>
				<input
					name="password"
					required
					bind:value={data.password}
					type="password"
					placeholder="Passwort"
					minlength="3"
				/>

				<input
					name="password2"
					required
					bind:value={data.password2}
					type="password"
					placeholder="Passwort Wiederholung"
					minlength="3"
				/>
			</p>

			<p>
				<button type="submit" disabled={data.password !== data.password2 || !data.nickname || !data.password}>
					Los gehts!
				</button>
			</p>
		</section>

		<section>
			<p>
				Bereits ein Konto? <a href="/login">Hier geht es zur Anmeldung.</a>
			</p>
		</section>
	</form>
</article>
