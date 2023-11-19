<script lang="ts">
	import type { NicknamePasswordFormData } from '$lib/models/NicknamePasswordFormData';

	export let data: NicknamePasswordFormData;
	export let headline: string;
</script>

<article>
	<h3>{headline}</h3>

	<form method="POST">
		<section>
			<p>
				<input name="nickname" required value={data?.nickname ?? ''} type="text" placeholder="Nickname" />
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
