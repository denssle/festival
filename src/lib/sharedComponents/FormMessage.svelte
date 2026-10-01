<!--
	Rückmeldung einer Form-Action – Erfolg oder Fehler, überall gleich dargestellt.
	Vorher gab es fünf Varianten (rotes <p>, Inline-Style, ungefärbtes <span>, …), in den
	Einstellungen sahen Erfolg und Fehler gleich aus.
-->
<script lang="ts">
	let {
		message,
		success = false,
		testId = 'form-message'
	}: { message?: string | null; success?: boolean; testId?: string } = $props();
</script>

{#if message}
	<p class="form-message" class:success class:error={!success} role={success ? 'status' : 'alert'} data-testid={testId}>
		{message}
	</p>
{/if}

<style>
	.success {
		color: var(--accent);
	}

	.error {
		color: var(--error);
	}
</style>
