<script lang="ts">
	import type { FrontendUser } from '$lib/models/user/FrontendUser';

	export let user: FrontendUser | undefined;
</script>

{#if user}
	<img src={user.image} alt="alt avatar" class="avatar" />
	<a href="/user/{user.id}">{user.nickname}</a>
{/if}

<style>
	.avatar {
		vertical-align: middle;
		object-fit: cover;
		border-radius: 50%;
		width: 5em;
		height: 5em;
		border: solid var(--green);
	}
</style>
