<script lang="ts">
	import FormMessage from '$lib/sharedComponents/FormMessage.svelte';
	import { tr } from '$lib/i18n/tr';
	import type { StandardResponse } from '$lib/models/transferData/StandardResponse';

	let { form }: { form: StandardResponse | null } = $props();
</script>

<article>
	<h2>{tr('forgotPassword.heading')}</h2>
	<p>{tr('forgotPassword.explanation')}</p>

	<FormMessage message={form?.message} success={form?.success} testId="forgot-password-message" />

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
