<script lang="ts">
	import type { BackendUser } from '$lib/models/BackendUser';

	export let data: BackendUser;
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
					<input name="password" value={data?.password ?? ''} type="password" placeholder="Ändere dein Passwort" />
				</p>

				<p>
					<button type="submit">Speichern</button>
				</p>
			</section>
		</form>
	</section>
</article>
