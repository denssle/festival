<script lang="ts">
	import type { FrontendUser } from '$lib/models/user/FrontendUser';
	import AvatarImage from '$lib/sharedComponents/AvatarImage.svelte';
	import AvatarUpload from './AvatarUpload.svelte';
	import UserDataForm from './UserDataForm.svelte';
	import AddFriend from './AddFriend.svelte';

	export let data: { user: FrontendUser; isOwnProfil: boolean };
</script>

<article>
	<h2>Benutzer <strong>{data.user.nickname}</strong></h2>
	<section style="display: flex">
		<AvatarImage userId={data.user.id} />
		<div>
			{#if data.isOwnProfil}
				<AvatarUpload isOwnProfil={data.isOwnProfil} />
			{:else}
				<AddFriend friendId={data.user.id} friends={false} />
			{/if}
		</div>
	</section>
	<section>
		{#if data.isOwnProfil}
			<UserDataForm data={data.user} />
		{:else}
			<p>
				<b>Name:</b>
				{#if data.user.forename}
					{data.user.forename}
				{/if}

				{#if data.user.lastname}
					{data.user.lastname}
				{/if}
			</p>
		{/if}
	</section>
</article>
