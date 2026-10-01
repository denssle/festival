<script lang="ts">
	import FormMessage from '$lib/sharedComponents/FormMessage.svelte';
	import { tr } from '$lib/i18n/tr';
	import { resolve } from '$app/paths';
	import type { PageData } from './$types';
	import type { StandardResponse } from '$lib/models/transferData/StandardResponse';

	let { data, form }: { data: PageData; form: StandardResponse | null } = $props();
</script>

<article>
	<h2>{tr('verifyEmail.heading')}</h2>
	{#if form?.message}
		<FormMessage message={form.message} success={form.success} testId="verify-email-message" />
	{:else if data.verified !== null}
		<FormMessage
			message={data.verified ? tr('verifyEmail.success') : tr('verifyEmail.invalid')}
			success={data.verified}
			testId="verify-email-message"
		/>
	{/if}
	<p><a href={resolve('/')}>{tr('verifyEmail.toStart')}</a></p>
</article>
