<script lang="ts">
	import type { FrontendUser } from '$lib/models/FrontendUser';

	export let data: FrontendUser;
</script>

<article>
	<h2>Einstellungen</h2>
	<section>
		<h4>Persönliche Einstellungen</h4>
		<form method="POST" autocomplete="on">
			<section>
				<p>
					<label for="nickname">Deine Nickname: </label>
					<input name="nickname" id="nickname" value={data?.nickname ?? ''} type="text" placeholder="Nickname" />
				</p>

				<p>
					<label for="forename">Dein Vorname: </label>
					<input
						name="forename"
						id="forename"
						value={data?.forename ?? ''}
						type="text"
						placeholder="Vorname"
						autocomplete="given-name"
					/>

					<label for="lastname">Dein Nachname: </label>
					<input
						name="lastname"
						id="lastname"
						value={data?.lastname ?? ''}
						type="text"
						placeholder="Nachname"
						autocomplete="family-name"
					/>
				</p>

				<p>
					<label for="email">Deine Email: </label>
					<input
						name="email"
						id="email"
						value={data?.email ?? ''}
						type="email"
						placeholder="Email"
						autocomplete="email"
					/>
				</p>

				<p>
					<label for="password">Ändere dein Passwort: </label>
					<input name="password" id="password" value={''} type="password" placeholder="Passwort" />
				</p>

				<p>
					<button type="submit">Speichern</button>
				</p>
			</section>
		</form>
	</section>
</article>
