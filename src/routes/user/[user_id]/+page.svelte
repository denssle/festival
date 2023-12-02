<script lang="ts">
	import type { FrontendUser } from '$lib/models/FrontendUser';
	import AvatarImage from '$lib/sharedComponents/AvatarImage.svelte';
	import AvatarUpload from './AvatarUpload.svelte';

	export let data: { user: FrontendUser; isOwnProfil: boolean };
</script>

<article>
	<h2>Benutzer</h2>
	<section style="display: flex">
		<AvatarImage userId={data.user.id} />
		<AvatarUpload isOwnProfil={data.isOwnProfil} />
	</section>
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
</article>
