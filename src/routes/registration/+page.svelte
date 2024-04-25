<script lang="ts">
	import type { LoginRegisterFormData } from '$lib/models/LoginRegisterFormData';

	export let data: LoginRegisterFormData;
</script>

<article>
	<h2>Registration</h2>

	<form method="POST">
		<section>
			<p>
				<input bind:value={data.nickname} minlength="3" name="nickname" placeholder="Nickname" required type="text" />
			</p>

			<p>
				<input
					bind:value={data.password}
					minlength="3"
					name="password"
					placeholder="Passwort"
					required
					type="password"
				/>

				<input
					bind:value={data.password2}
					minlength="3"
					name="password2"
					placeholder="Passwort Wiederholung"
					required
					type="password"
				/>
			</p>

			<p>
				<button disabled={data.password !== data.password2 || !data.nickname || !data.password} type="submit">
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
