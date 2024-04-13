<script lang='ts'>
	import AvatarImage from '$lib/sharedComponents/AvatarImage.svelte';
	import AvatarUpload from './AvatarUpload.svelte';
	import UserDataForm from './UserDataForm.svelte';
	import AddFriend from './AddFriend.svelte';
	import type { UserTransferData } from '$lib/models/user/UserTransferData';
	import FriendlistEntry from './FriendlistEntry.svelte';

	export let data: UserTransferData;
</script>

<article>
	<h2>Benutzer <strong>{data.user.nickname}</strong></h2>
	<section style='display: flex'>
		<AvatarImage userId={data.user.id} />
		<div>
			{#if data.isOwnProfil}
				<AvatarUpload isOwnProfil={data.isOwnProfil} />
			{:else}
				<AddFriend friendId={data.user.id} friends={data.yourFriend} />
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
	<section>
		<h4>Freunde: </h4>
		{#each data.friends as friend}
			<FriendlistEntry user='{friend}' />
		{/each}
	</section>
</article>
