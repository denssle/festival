<script lang="ts">
	import type { FrontendUser } from '$lib/models/FrontendUser';

	export let data: FrontendUser;
</script>

<article>
	<h2>Einstellungen</h2>
	<section>
		<p>Persönliche Einstellungen</p>
		<form method="POST">
			<section>
				<p>
					<input name="email" value={data?.email ?? ''} type="email" placeholder="Ändere deine Email" />
				</p>

				<p>
					<input name="nickname" value={data?.nickname ?? ''} type="email" placeholder="Ändere deinen Nickname" />
				</p>

				<p>
					<input name="password" value={''} type="password" placeholder="Ändere dein Passwort" />
				</p>

				<p>
					<button type="submit">Speichern</button>
				</p>
			</section>
		</form>
	</section>
</article>
