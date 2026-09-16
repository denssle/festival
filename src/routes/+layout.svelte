<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { CurrentUser } from '$lib/models/user/CurrentUser';
	import type { Snippet } from 'svelte';
	import { type Locale, t } from '$lib/i18n';
	import LanguageSwitcher from '$lib/sharedComponents/LanguageSwitcher.svelte';

	let {
		data,
		children
	}: {
		data: { currentUser: CurrentUser | undefined; locale: Locale };
		children: Snippet;
	} = $props();

	async function logout() {
		await fetch(resolve('/logout'), {
			method: 'POST'
		});
		await invalidateAll();
		await goto(resolve('/login'));
	}
</script>

<header>
	<nav>
		{#if data?.currentUser?.isAuthenticated}
			<a href={resolve('/')}>{t(data.locale, 'nav.festivals')}</a>
			<a href={resolve('/group')}>{t(data.locale, 'nav.groups')}</a>
			<a href={resolve('/user/[user_id]', { user_id: data.currentUser.id })}>{data.currentUser.nickname}</a>
			<a href={resolve('/updates')}>{t(data.locale, 'nav.updates')}</a>
			<a href={resolve('/settings')}>{t(data.locale, 'nav.settings')}</a>
			<button onclick={logout}>{t(data.locale, 'nav.logout')}</button>
		{:else}
			<a href={resolve('/login')}>{t(data.locale, 'nav.login')}</a>
			<a href={resolve('/registration')}>{t(data.locale, 'nav.register')}</a>
		{/if}
	</nav>
</header>

{@render children()}

<footer>
	<nav>
		<a href={resolve('/about')}>{t(data.locale, 'footer.about')}</a>
		<a href={resolve('/impressum')}>{t(data.locale, 'footer.imprint')}</a>
		<a href={resolve('/datenschutz')}>{t(data.locale, 'footer.privacy')}</a>
	</nav>
	<LanguageSwitcher locale={data.locale} />
</footer>

<style global>
	:global(:root) {
		--red: #d81e30;
		--light-green: #62bcad;
		--green: #439e8f;
		--dark-green: #2c685e;
		--darkest-green: #214f47;
		--white: #efefef;
		--orange: #fd904d;
		--light-orange: #feaf7f;
		--black: #212121;
		--dark-gray: #444;
	}

	:root {
		--accent: var(--light-green);
		--accent-bg: var(--dark-green);
		--bg: var(--black);
		--text: var(--orange);
		--text-light: var(--darkest-green);
		--border: var(--dark-green);
		--accent-light: var(--red);
		--code: var(--red);
		--preformatted: var(--dark-gray);
		--marked: var(--light-orange);
		--disabled: var(--white);
		--error: var(--red);
	}

	:global(button) {
		user-select: none;
		-webkit-user-select: none; /*Safari*/
		-moz-user-select: none; /*Firefox*/
		caret-color: transparent;
		padding-left: 1rem;
		padding-right: 1rem;
	}

	:global(input::-webkit-outer-spin-button) {
		-webkit-appearance: none;
		margin: 0;
	}

	:global(input::-webkit-inner-spin-button) {
		-webkit-appearance: none;
		margin: 0;
	}

	:global(input[type='number']) {
		-moz-appearance: textfield;
		appearance: textfield;
	}
</style>
