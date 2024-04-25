<script lang="ts">
	import uberspaceBanner from '../../images/uberspace_badge_dark.png';

	export let data: { version: string };
</script>

<article>
	<h2>Über diese Seite</h2>
	<section>
		<p>
			Diese Seite wurde erstellt mit <a href="https://kit.svelte.dev/">svelte</a>. Das Styling kommt von
			<a href="https://simplecss.org/">simple css </a>
			und die Daten werden gespeichert in einer
			<a href="https://redis.io/">redis</a>
			Datenbank auf <a href="https://upstash.com/">upstash</a>.
		</p>
	</section>
	<section>
		<img alt="uberspace Banner" class="center" src={uberspaceBanner} />
		<p style="text-align: center">
			Die Seite ist gehostet auf <a href="https://uberspace.de/">uberspace</a>.
		</p>
	</section>
	<section>
		<p>Version: {data.version}</p>
	</section>
</article>

<style>
	.center {
		display: block;
		margin-left: auto;
		margin-right: auto;
	}
</style>
