<script lang="ts">
	import { tr } from '$lib/i18n/tr';
	import type { FrontendUser } from '$lib/models/user/FrontendUser';

	let { user }: { user: FrontendUser } = $props();
</script>

<div>
	<div>
		<span>{tr('profile.forename')}</span>
		<span>{user.forename || tr('profile.notProvided')}</span>

		<br />

		<span>{tr('profile.lastname')}</span>
		<span>{user.lastname || tr('profile.notProvided')}</span>
	</div>
</div>
