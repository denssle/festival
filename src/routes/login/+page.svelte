<script lang="ts">
	import type { LoginRegisterFormData } from '$lib/models/LoginRegisterFormData';

	export let data: LoginRegisterFormData;
</script>

<article>
	<h2>Anmeldung</h2>

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
			</p>

			<p>
				<button disabled={!data.nickname || !data.password} type="submit"> Los gehts!</button>
			</p>
		</section>

		<section>
			<p>
				Noch nicht angemeldet? Dann <a href="/registration">hier registrieren.</a>
			</p>
		</section>
	</form>
</article>
