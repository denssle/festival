<script lang="ts">
	import { tr } from '$lib/i18n/tr';
	import type { FrontendUser } from '$lib/models/user/FrontendUser';

	let { data, email }: { data: FrontendUser; email: string } = $props();
</script>

<form autocomplete="on" method="POST">
	<p>
		<label for="nickname">{tr('profile.form.nickname')} </label>
		<input id="nickname" name="nickname" placeholder={tr('form.nickname')} type="text" value={data.nickname} />
	</p>

	<div>
		<label for="forename">{tr('profile.form.forename')} </label>
		<input
			autocomplete="given-name"
			id="forename"
			name="forename"
			placeholder={tr('profile.form.forenamePlaceholder')}
			type="text"
			value={data.forename}
		/>

		<label for="lastname">{tr('profile.form.lastname')} </label>
		<input
			autocomplete="family-name"
			id="lastname"
			name="lastname"
			placeholder={tr('profile.form.lastnamePlaceholder')}
			type="text"
			value={data.lastname}
		/>
	</div>

	<p>
		<label for="email">{tr('profile.form.email')} </label>
		<input
			autocomplete="email"
			id="email"
			name="email"
			placeholder={tr('profile.form.emailPlaceholder')}
			type="email"
			value={email}
		/>
	</p>
	<p>
		<button type="submit" data-testid="profile-save">{tr('form.save')}</button>
	</p>
</form>
