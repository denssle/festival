<script lang="ts">
	import FormMessage from '$lib/sharedComponents/FormMessage.svelte';
	import { tr } from '$lib/i18n/tr';
	import { resolve } from '$app/paths';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
	let formData = $state({ nickname: '', password: '' });
</script>

<article>
	<h2>{tr('login.heading')}</h2>

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
					minlength="3"
					name="password"
					placeholder={tr('form.password')}
					required
					type="password"
				/>
			</p>

			<p>
				<button disabled={!formData.nickname || !formData.password} type="submit">{tr('form.go')}</button>
			</p>
			<FormMessage message={form?.message} success={form?.success} />
		</section>

		<section>
			<p>
				{tr('login.noAccount')} <a href={resolve('/registration')}>{tr('login.registerLink')}</a>
			</p>
			<p>
				<a href={resolve('/forgot-password')} data-testid="login-forgot-password">{tr('login.forgotPassword')}</a>
			</p>
		</section>
	</form>
</article>
