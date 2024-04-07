<script lang='ts'>
	import type { LoginRegisterFormData } from '$lib/models/LoginRegisterFormData';

	export let data: LoginRegisterFormData;
</script>

<article>
	<h2>Anmeldung</h2>

	<form method='POST'>
		<section>
			<p>
				<input
					name='nickname'
					required
					bind:value={data.nickname}
					type='text'
					placeholder='Nickname'
					minlength='3' />
			</p>

			<p>
				<input
					name='password'
					required
					bind:value={data.password}
					type='password'
					placeholder='Passwort'
					minlength='3'
				/>
			</p>

			<p>
				<button
					type='submit'
					disabled='{!data.nickname || !data.password}'
				>
					Los gehts!
				</button>
			</p>
		</section>

		<section>
			<p>
				Noch nicht angemeldet? Dann <a href='/registration'>hier registrieren.</a>
			</p>
		</section>
	</form>
</article>
