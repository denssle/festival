<script lang="ts">
	import { tr } from '$lib/i18n/tr';
	import type { PageData } from './$types';
	import uberspaceBanner from '../../images/uberspace_badge_dark.png';

	let { data }: { data: PageData } = $props();
</script>

<article>
	<h2>{tr('about.heading')}</h2>
	<section>
		<p>
			{tr('about.builtWith')} <a href="https://kit.svelte.dev/">svelte</a>. {tr('about.stylingFrom')}
			<a href="https://simplecss.org/">simple css </a>
			{tr('about.dataStoredIn')} <a href="https://mariadb.com/">Maria DB</a>.
		</p>
	</section>
	<section>
		<img alt={tr('about.uberspaceAlt')} class="center" src={uberspaceBanner} />
		<p class="center-text">
			{tr('about.hostedOn')} <a href="https://uberspace.de/">uberspace</a>.
		</p>
	</section>
	<section>
		<p>{tr('about.version', { version: data.version ?? '' })}</p>
	</section>
</article>

<style>
	.center {
		display: block;
		margin-left: auto;
		margin-right: auto;
	}

	.center-text {
		text-align: center;
	}
</style>
