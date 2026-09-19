<script lang="ts">
	import { tr } from '$lib/i18n/tr';
	import { resolve } from '$app/paths';
	import { MIN_PASSWORD_LENGTH } from '$lib/constants';
	import type { LoginRegisterFormData } from '$lib/models/transferData/LoginRegisterFormData';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
	let formData: LoginRegisterFormData = $state({ nickname: '', password: '', password2: '' });
</script>

<article>
	<h2>{tr('registration.heading')}</h2>

	<form method="POST">
		<section>
			<p>
				<input
					bind:value={formData.nickname}
					minlength="3"
					name="nickname"
					placeholder={tr('form.nickname')}
					required
					type="text"
				/>
			</p>

			<p>
				<input
					bind:value={formData.password}
					minlength={MIN_PASSWORD_LENGTH}
					name="password"
					placeholder={tr('form.password')}
					required
					type="password"
				/>

				<input
					bind:value={formData.password2}
					minlength={MIN_PASSWORD_LENGTH}
					name="password2"
					placeholder={tr('form.passwordRepeat')}
					required
					type="password"
				/>
			</p>

			<p>
				<button
					disabled={formData.password !== formData.password2 || !formData.nickname || !formData.password}
					type="submit"
				>
					{tr('form.go')}
				</button>
				{#if form?.success === false}
					<span style="color: var(--error)">{form.message}</span>
				{/if}
			</p>
		</section>

		<section>
			<p>
				{tr('registration.haveAccount')} <a href={resolve('/login')}>{tr('registration.loginLink')}</a>
			</p>
		</section>
	</form>
</article>
