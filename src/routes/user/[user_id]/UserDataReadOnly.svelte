<script lang='ts'>
	import type { FrontendUser } from '$lib/models/user/FrontendUser';

	export let user: FrontendUser;
</script>

<div>
	<div>
		<span>Vorname:</span>
		<span>{user.forename ?? 'Nicht hinterlegt'}</span>

		<br>

		<span>Nachnamen:</span>
		<span>{user.lastname ?? 'Nicht hinterlegt'}</span>
	</div>
	<p>
		<span>Email: </span>
		<span>{user.email ?? 'Keine Email hinterlegt. '}</span>
	</p>
</div>
