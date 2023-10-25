<script lang="ts">
	import type { EmailPasswordFormData } from "$lib/sharedComponents/EmailPasswordFormData";

	export let data: EmailPasswordFormData;
	export let headline: string;
</script>

<article>
	<h3>{headline}</h3>

	<form method="POST">
		<section>
			<p>
				<input name="email" required value={data?.email ?? ''} type="email" placeholder="Email" />
			</p>

			<p>
				<input name="password" required value={data?.password ?? ''} type="password" placeholder="Passwort" />
			</p>

			<p>
				<button type="submit">Los gehts!</button>
			</p>
		</section>

		<section>
			<p>
				<slot />
			</p>
		</section>
	</form>
</article>

<style>
</style>
