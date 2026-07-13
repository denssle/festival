<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<article>
	<h2>Neue Gruppe anlegen</h2>
	<section>
		<form method="POST">
			<p>
				<input name="name" placeholder="Name der Gruppe" required />
				<textarea name="description" placeholder="Kurze Beschreibung"></textarea>
			</p>

			<button type="submit">Speichern</button>
			<a class="button" href={resolve('/group')}>Zurück</a>
		</form>
	</section>
</article>
