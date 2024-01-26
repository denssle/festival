<script lang='ts'>
	import uberspaceBanner from '$lib/assets/uberspace_badge_dark.png';

	export let data: { version: string };
	console.log(data);
</script>

<article>
	<h2>Über diese Seite</h2>
	<section>
		<p>Diese Seite wurde erstellt mit <a href='https://kit.svelte.dev/'>svelte</a>.</p>
		<p>
			Das Styling kommt von <a href='https://simplecss.org/'>simple css </a> und die Daten werden gespeichert in einer
			<a href='https://redis.io/'>redis</a>
			Datenbank auf <a href='https://upstash.com/'>upstash</a>.
		</p>
		<p>
			Die Seite ist gehostet auf <a href='https://uberspace.de/'>uberspace</a>.
		</p>
		<img src={uberspaceBanner} alt='uberspace Banner' class='center' />
	</section>
	<p>Version: {data.version}</p>
</article>

<style>
    .center {
        display: block;
        margin-left: auto;
        margin-right: auto;
    }
</style>
