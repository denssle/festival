<script lang="ts">
	import { resolve } from '$app/paths';
	import type { FrontendUser } from '$lib/models/user/FrontendUser';
	import AvatarImage from '$lib/sharedComponents/AvatarImage.svelte';

	let { user }: { user: FrontendUser | undefined } = $props();
</script>

{#if user}
	<div class="entry">
		<AvatarImage userId={user.id} size={5}></AvatarImage>
		<a href={resolve('/user/[user_id]', { user_id: user.id })}>{user.nickname}</a>
	</div>
{/if}

<style>
	.entry {
		display: flex;
	}
</style>
