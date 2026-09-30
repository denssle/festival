<script lang="ts">
	import { tr } from '$lib/i18n/tr';
	import { resolve } from '$app/paths';
	import type { PageData } from './$types';
	import type { StandardResponse } from '$lib/models/transferData/StandardResponse';

	let { data, form }: { data: PageData; form: StandardResponse | null } = $props();
</script>

<article>
	<h2>{tr('verifyEmail.heading')}</h2>
	{#if form?.message}
		<p class={form.success ? 'success' : 'error'} data-testid="verify-email-message">{form.message}</p>
	{:else if data.verified === true}
		<p class="success" data-testid="verify-email-message">{tr('verifyEmail.success')}</p>
	{:else if data.verified === false}
		<p class="error" data-testid="verify-email-message">{tr('verifyEmail.invalid')}</p>
	{/if}
	<p><a href={resolve('/')}>{tr('verifyEmail.toStart')}</a></p>
</article>

<style>
	.success {
		color: var(--accent);
	}

	.error {
		color: var(--error);
	}
</style>
