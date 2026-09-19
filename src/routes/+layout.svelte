<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { CurrentUser } from '$lib/models/user/CurrentUser';
	import type { Snippet } from 'svelte';
	import { tr } from '$lib/i18n/tr';
	import LanguageSwitcher from '$lib/sharedComponents/LanguageSwitcher.svelte';

	let {
		data,
		children
	}: {
		data: { currentUser: CurrentUser | undefined };
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
			<a data-testid="nav-festivals" href={resolve('/')}>{tr('nav.festivals')}</a>
			<a data-testid="nav-groups" href={resolve('/group')}>{tr('nav.groups')}</a>
			<a data-testid="nav-profile" href={resolve('/user/[user_id]', { user_id: data.currentUser.id })}
				>{data.currentUser.nickname}</a
			>
			<a data-testid="nav-updates" href={resolve('/updates')}>{tr('nav.updates')}</a>
			<a data-testid="nav-settings" href={resolve('/settings')}>{tr('nav.settings')}</a>
			<button data-testid="nav-logout" onclick={logout}>{tr('nav.logout')}</button>
		{:else}
			<a data-testid="nav-login" href={resolve('/login')}>{tr('nav.login')}</a>
			<a data-testid="nav-register" href={resolve('/registration')}>{tr('nav.register')}</a>
		{/if}
	</nav>
</header>

{@render children()}

<footer>
	<nav>
		<a data-testid="footer-about" href={resolve('/about')}>{tr('footer.about')}</a>
		<a data-testid="footer-imprint" href={resolve('/impressum')}>{tr('footer.imprint')}</a>
		<a data-testid="footer-privacy" href={resolve('/datenschutz')}>{tr('footer.privacy')}</a>
	</nav>
	<LanguageSwitcher />
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
