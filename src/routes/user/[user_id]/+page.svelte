<script lang="ts">
	import type { FrontendUser } from '$lib/models/FrontendUser';

	export let data: { user: FrontendUser; isOwnProfil: boolean };
</script>

<article>
	<h2>Benutzer</h2>
	<p>{data.user.nickname}</p>
	<p>
		{#if data.user.forename}
			{data.user.forename}
		{/if}

		{#if data.user.lastname}
			{data.user.lastname}
		{/if}
	</p>
</article>
