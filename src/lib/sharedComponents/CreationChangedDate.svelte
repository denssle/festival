<script lang="ts">
	import { tr } from '$lib/i18n/tr';
	let { createdAt, updatedAt }: { createdAt: Date; updatedAt: Date } = $props();

	let createdDate = $derived(new Date(createdAt));
	let updatedDate = $derived(new Date(updatedAt));
	let edited = $derived(createdDate.getTime() !== updatedDate.getTime());
</script>

<i>
	{tr('comment.written')}
	{createdDate.toLocaleString()}
	{#if edited}
		{tr('comment.updated')} {updatedDate.toLocaleString()}
	{/if}
</i>
