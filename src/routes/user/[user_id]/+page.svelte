<script lang="ts">
	import { tr } from '$lib/i18n/tr';
	import { resolve } from '$app/paths';
	import AvatarImage from '$lib/sharedComponents/AvatarImage.svelte';
	import AvatarUpload from './AvatarUpload.svelte';
	import UserDataForm from './UserDataForm.svelte';
	import type { UserTransferData } from '$lib/models/user/UserTransferData';
	import FriendListEntry from './FriendListEntry.svelte';
	import FriendButtons from './FriendButtons.svelte';
	import FestivalComments from '$lib/sharedComponents/Comments.svelte';
	import UserDataReadOnly from './UserDataReadOnly.svelte';
	import VisitingFestivals from './VisitingFestivals.svelte';

	let { data }: { data: UserTransferData } = $props();
</script>

<article>
	<h2>{tr('profile.heading')} <strong>{data.user.nickname}</strong></h2>
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
			<UserDataForm data={data.user} email={data.email ?? ''} />
		{:else}
			<UserDataReadOnly user={data.user} />
		{/if}
	</section>

	<section>
		<h4>{tr('profile.friends')}</h4>
		{#each data.friendList.filter((f) => f !== undefined) as friend (friend.id)}
			<FriendListEntry user={friend} />
		{/each}
		{#if data.friendList.length === 0}
			<p>{tr('profile.friendsEmpty')}</p>
			<p>{tr('profile.friendsEmptyComfort')}</p>
		{/if}
	</section>

	<section>
		<h4 data-testid="profile-festivals-heading">{tr('profile.festivals')}</h4>
		<VisitingFestivals userId={data.user.id} />
	</section>

	<section data-testid="profile-groups-section">
		<h4>{tr('profile.groups')}</h4>
		{#if data.groupList && data.groupList.length > 0}
			<ul>
				{#each data.groupList as group (group.id)}
					<li><a href={resolve('/group/[group_id]', { group_id: group.id })}>{group.name}</a></li>
				{/each}
			</ul>
		{:else}
			<p>{data.isOwnProfil ? tr('group.mineEmpty') : tr('profile.groupsEmptyOther')}</p>
		{/if}
	</section>

	<FestivalComments whereId={data.user.id} />
</article>
