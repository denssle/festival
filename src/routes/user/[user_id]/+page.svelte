<script lang="ts">
	import type { FrontendUser } from '$lib/models/FrontendUser';
	import AvatarImage from '$lib/sharedComponents/AvatarImage.svelte';
	import AvatarUpload from './AvatarUpload.svelte';

	export let data: { user: FrontendUser; isOwnProfil: boolean };
</script>

<article>
	<h2>Benutzer <strong>{data.user.nickname}</strong></h2>
	<section style="display: flex">
		<AvatarImage userId={data.user.id} />
		<div>
			<AvatarUpload isOwnProfil={data.isOwnProfil} />
			{#if !data.isOwnProfil}
				<div>
					<button>Anfreunden</button>
				</div>
			{/if}
		</div>
	</section>
	<section>
		<p>
			<b>Name:</b>
			{#if data.user.forename}
				{data.user.forename}
			{/if}

			{#if data.user.lastname}
				{data.user.lastname}
			{/if}
		</p>
	</section>
</article>
