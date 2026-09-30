<script lang="ts">
	import { tr } from '$lib/i18n/tr';
	import type { StandardResponse } from '$lib/models/transferData/StandardResponse';

	let { form }: { form: StandardResponse | null } = $props();
</script>

<article>
	<h2>{tr('forgotPassword.heading')}</h2>
	<p>{tr('forgotPassword.explanation')}</p>

	{#if form?.message}
		<p class={form.success ? 'success' : 'error'} data-testid="forgot-password-message">{form.message}</p>
	{/if}

	{#if !form?.success}
		<form method="POST">
			<p>
				<input
					name="identifier"
					placeholder={tr('forgotPassword.identifier')}
					aria-label={tr('forgotPassword.identifier')}
					autocomplete="username"
					required
					type="text"
				/>
			</p>
			<p>
				<button type="submit" data-testid="forgot-password-submit">{tr('forgotPassword.submit')}</button>
			</p>
		</form>
	{/if}
</article>

<style>
	.success {
		color: var(--accent);
	}

	.error {
		color: var(--error);
	}
</style>
