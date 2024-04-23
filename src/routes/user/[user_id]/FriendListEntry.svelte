<script lang='ts'>
	import type { FrontendUser } from '$lib/models/user/FrontendUser';
	import AvatarImage from '$lib/sharedComponents/AvatarImage.svelte';

	export let user: FrontendUser | undefined;
</script>

{#if user}
	<div class='entry'>
		<AvatarImage userId='{user.id}' size='{5}'></AvatarImage>
		<a href='/user/{user.id}'>{user.nickname}</a>
	</div>
{/if}

<style>
    .entry {
        display: flex;
    }
</style>