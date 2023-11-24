<script lang="ts">
	import type { FrontendUser } from '$lib/models/FrontendUser';
	import Avatar from '../../settings/AvatarUpload.svelte';

	export let data: { user: FrontendUser; isOwnProfil: boolean };
</script>

<article>
	<h2>Benutzer</h2>
	<section>
		<strong>{data.user.nickname}</strong>
		<p>
			{#if data.user.forename}
				{data.user.forename}
			{/if}

			{#if data.user.lastname}
				{data.user.lastname}
			{/if}
		</p>
	</section>
	<Avatar />
</article>
