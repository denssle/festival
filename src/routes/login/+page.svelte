<script lang="ts">
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
				{#if form?.success === false}
					<span style="color: var(--error)">{form.message}</span>
				{/if}
			</p>
		</section>

		<section>
			<p>
				{tr('login.noAccount')} <a href={resolve('/registration')}>{tr('login.registerLink')}</a>
			</p>
		</section>
	</form>
</article>
