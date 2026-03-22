<script lang="ts">
	import AvatarImage from '$lib/sharedComponents/AvatarImage.svelte';
	import AvatarUpload from './AvatarUpload.svelte';
	import UserDataForm from './UserDataForm.svelte';
	import type { UserTransferData } from '$lib/models/user/UserTransferData';
	import FriendListEntry from './FriendListEntry.svelte';
	import FriendButtons from './FriendButtons.svelte';
	import FestivalComments from '$lib/sharedComponents/Comments.svelte';
	import UserDataReadOnly from './UserDataReadOnly.svelte';
	import VisitingFestivals from './VisitingFestivals.svelte';

	export let data: UserTransferData;
</script>

<article>
	<h2>Benutzer <strong>{data.user.nickname}</strong></h2>
	<section style="display: flex">
		<AvatarImage userId={data.user.id} />
		<div>
			{#if data.isOwnProfil}
				<AvatarUpload isOwnProfil={data.isOwnProfil} userId={data.user.id} />
			{:else}
				<FriendButtons friendId={data.user.id} yourFriend={data.yourFriend} />
			{/if}
		</div>
	</section>

	<section>
		{#if data.isOwnProfil}
			<UserDataForm data={data.user} />
		{:else}
			<UserDataReadOnly user={data.user} />
		{/if}
	</section>

	<section>
		<h4>Freunde:</h4>
		{#each data.friendList as friend}
			<FriendListEntry user={friend} />
		{/each}
		{#if data.friendList.length === 0}
			<p>Es sieht so aus, als hättest du keine Freunde hier.</p>
			<p>Das liegt bestimmt nicht an dir...</p>
		{/if}
	</section>

	<section>
		<h4>Festivals:</h4>
		<VisitingFestivals userId={data.user.id} />
	</section>

	<section>
		<h4>Gruppen:</h4>
		{#if data.groupList && data.groupList.length > 0}
			<ul>
				{#each data.groupList as group}
					<li><a href="/group/{group.id}">{group.name}</a></li>
				{/each}
			</ul>
		{:else}
			<p>{data.isOwnProfil ? 'Du bist in keiner Gruppe.' : 'Dieser Benutzer ist in keiner Gruppe.'}</p>
		{/if}
	</section>

	<FestivalComments whereId={data.user.id} />
</article>
