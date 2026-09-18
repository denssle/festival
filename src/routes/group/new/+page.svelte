<script lang="ts">
	import { tr } from '$lib/i18n/tr';
	import { resolve } from '$app/paths';
</script>

<article>
	<h2>{tr('group.new.create')}</h2>
	<section>
		<form method="POST">
			<p>
				<input name="name" placeholder={tr('group.form.name')} required />
				<textarea name="description" placeholder={tr('group.form.description')}></textarea>
			</p>

			<button type="submit" data-testid="group-save">{tr('form.save')}</button>
			<a class="button" href={resolve('/group')}>{tr('form.back')}</a>
		</form>
	</section>
</article>
