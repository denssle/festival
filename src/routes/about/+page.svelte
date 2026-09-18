<script lang="ts">
	import { tr } from '$lib/i18n/tr';
	import type { PageData } from './$types';
	import RichText from '$lib/sharedComponents/RichText.svelte';
	import uberspaceBanner from '../../images/uberspace_badge_dark.png';

	let { data }: { data: PageData } = $props();
</script>

<article>
	<h2>{tr('about.heading')}</h2>
	<section>
		<p>
			<RichText text={tr('about.credits')}>
				{#snippet svelte()}<a href="https://kit.svelte.dev/">svelte</a>{/snippet}
				{#snippet simplecss()}<a href="https://simplecss.org/">simple css</a>{/snippet}
				{#snippet mariadb()}<a href="https://mariadb.com/">Maria DB</a>{/snippet}
			</RichText>
		</p>
	</section>
	<section>
		<img alt={tr('about.uberspaceAlt')} class="center" src={uberspaceBanner} />
		<p class="center-text">
			<RichText text={tr('about.hosting')}>
				{#snippet uberspace()}<a href="https://uberspace.de/">uberspace</a>{/snippet}
			</RichText>
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
