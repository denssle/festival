<script lang="ts">
	import { tr } from '$lib/i18n/tr';
	import { MAX_SHORT_TEXT_LENGTH } from '$lib/services/text-length.logic';
	import type { FrontendUser } from '$lib/models/user/FrontendUser';
	import { resolve } from '$app/paths';

	let { data, email, emailVerified }: { data: FrontendUser; email: string; emailVerified: boolean } = $props();
</script>

<form autocomplete="on" method="POST">
	<p>
		<label for="nickname">{tr('profile.form.nickname')} </label>
		<input
			id="nickname"
			name="nickname"
			maxlength={MAX_SHORT_TEXT_LENGTH}
			placeholder={tr('form.nickname')}
			type="text"
			value={data.nickname}
		/>
	</p>

	<div>
		<label for="forename">{tr('profile.form.forename')} </label>
		<input
			autocomplete="given-name"
			id="forename"
			name="forename"
			maxlength={MAX_SHORT_TEXT_LENGTH}
			placeholder={tr('profile.form.forenamePlaceholder')}
			type="text"
			value={data.forename}
		/>

		<label for="lastname">{tr('profile.form.lastname')} </label>
		<input
			autocomplete="family-name"
			id="lastname"
			name="lastname"
			maxlength={MAX_SHORT_TEXT_LENGTH}
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
			maxlength={MAX_SHORT_TEXT_LENGTH}
			placeholder={tr('profile.form.emailPlaceholder')}
			type="email"
			value={email}
		/>
		{#if email}
			<small data-testid="email-status">
				{emailVerified ? tr('profile.email.verified') : tr('profile.email.unverified')}
			</small>
		{/if}
	</p>
	<p>
		<button type="submit" data-testid="profile-save">{tr('form.save')}</button>
	</p>
</form>

{#if email && !emailVerified}
	<!-- Eigenes Formular: Die Profilseite nutzt die Default-Action, daneben sind in SvelteKit keine benannten erlaubt. -->
	<form method="POST" action="{resolve('/verify-email')}?/send">
		<button type="submit" class="secondary" data-testid="email-send-link">{tr('profile.email.sendLink')}</button>
	</form>
{/if}
