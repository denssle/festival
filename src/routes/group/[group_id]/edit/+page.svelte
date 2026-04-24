<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<article>
	<h2>Gruppe bearbeiten</h2>
	<section>
		<form method="POST" use:enhance>
			<p>
				<label for="name">Name</label>
				<input id="name" name="name" placeholder="Name der Gruppe" value={data.group.name} required />
			</p>
			<p>
				<label for="description">Beschreibung</label>
 			<textarea id="description" name="description" placeholder="Kurze Beschreibung" value={data.group.description}></textarea>
			</p>

			{#if form?.message}
				<p class="error">{form.message}</p>
			{/if}

			<button type="submit">Speichern</button>
			<a class="button secondary" href="/group/{data.group.id}">Abbrechen</a>
		</form>
	</section>
</article>

<style>
	label {
		display: block;
		margin-bottom: 0.5rem;
	}
	input,
	textarea {
		width: 100%;
		margin-bottom: 1rem;
	}
	.error {
		color: red;
	}
	.secondary {
		background-color: #666;
	}
</style>
