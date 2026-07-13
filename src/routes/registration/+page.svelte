<script lang="ts">
	import { resolve } from '$app/paths';
	import type { LoginRegisterFormData } from '$lib/models/transferData/LoginRegisterFormData';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
	let formData: LoginRegisterFormData = $state({ nickname: '', password: '', password2: '' });
</script>

<article>
	<h2>Registration</h2>

	<form method="POST">
		<section>
			<p>
				<input
					bind:value={formData.nickname}
					minlength="3"
					name="nickname"
					placeholder="Nickname"
					required
					type="text"
				/>
			</p>

			<p>
				<input
					bind:value={formData.password}
					minlength="3"
					name="password"
					placeholder="Passwort"
					required
					type="password"
				/>

				<input
					bind:value={formData.password2}
					minlength="3"
					name="password2"
					placeholder="Passwort Wiederholung"
					required
					type="password"
				/>
			</p>

			<p>
				<button
					disabled={formData.password !== formData.password2 || !formData.nickname || !formData.password}
					type="submit"
				>
					Los gehts!
				</button>
				{#if form?.success === false}
					<span style="color: var(--error)">{form.message}</span>
				{/if}
			</p>
		</section>

		<section>
			<p>
				Bereits ein Konto? <a href={resolve('/login')}>Hier geht es zur Anmeldung.</a>
			</p>
		</section>
	</form>
</article>
