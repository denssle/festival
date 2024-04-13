<script lang='ts'>
	import type { FrontendUser } from '$lib/models/user/FrontendUser';

	export let user: FrontendUser | undefined;
</script>

{#if user}
	<a href='/user/{user.id}'>{user.nickname}</a>
{/if}
