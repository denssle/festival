<script lang="ts">
	import { currentLocale, tr } from '$lib/i18n/tr';
	import { formatDateTime } from '$lib/utils/date.util';
	let { createdAt, updatedAt }: { createdAt: Date; updatedAt: Date } = $props();

	let createdDate = $derived(new Date(createdAt));
	let updatedDate = $derived(new Date(updatedAt));
	let edited = $derived(createdDate.getTime() !== updatedDate.getTime());
</script>

<i>
	{tr('comment.written')}
	{formatDateTime(createdDate, currentLocale())}
	{#if edited}
		{tr('comment.updated')} {formatDateTime(updatedDate, currentLocale())}
	{/if}
</i>
