<script lang="ts">
	import type { FrontendUser } from '$lib/models/user/FrontendUser';

	export let data: FrontendUser;
</script>

<form autocomplete="on" method="POST">
	<p>
		<label for="nickname">Deine Nickname: </label>
		<input id="nickname" name="nickname" placeholder="Nickname" type="text" value={data.nickname} />
	</p>

	<div>
		<label for="forename">Dein Vorname: </label>
		<input
			autocomplete="given-name"
			id="forename"
			name="forename"
			placeholder="Vorname"
			type="text"
			value={data.forename}
		/>

		<label for="lastname">Dein Nachname: </label>
		<input
			autocomplete="family-name"
			id="lastname"
			name="lastname"
			placeholder="Nachname"
			type="text"
			value={data.lastname}
		/>
	</div>

	<p>
		<label for="email">Deine Email: </label>
		<input autocomplete="email" id="email" name="email" placeholder="Email" type="email" value={data.email} />
	</p>
	<p>
		<button type="submit">Speichern</button>
	</p>
</form>
