<script lang="ts">
	import type { PageData } from './$types';
	export let data: PageData;
</script>

<article>
	<a class="button" href="/group/new">Neue Gruppe anlegen</a>

	<section>
		<h3>Deine Gruppen</h3>
		{#if data.groups && data.groups.length > 0}
			<ul>
				{#each data.groups as group}
					<li>{group.name}</li>
				{/each}
			</ul>
		{:else}
			<p>Du bist in keiner Gruppe.</p>
		{/if}
	</section>
</article>
