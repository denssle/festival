<script lang="ts">
	import FormMessage from '$lib/sharedComponents/FormMessage.svelte';
	import { tr } from '$lib/i18n/tr';
	import { MAX_LONG_TEXT_LENGTH, MAX_SHORT_TEXT_LENGTH } from '$lib/services/text-length.logic';
	import { resolve } from '$app/paths';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<article>
	<h2>{tr('group.new.create')}</h2>
	<section>
		<form method="POST">
			<p>
				<input name="name" maxlength={MAX_SHORT_TEXT_LENGTH} placeholder={tr('group.form.name')} required />
				<textarea name="description" maxlength={MAX_LONG_TEXT_LENGTH} placeholder={tr('group.form.description')}
				></textarea>
			</p>

			<FormMessage message={form?.message} success={form?.success} />

			<button type="submit" data-testid="group-save">{tr('form.save')}</button>
			<a class="button" href={resolve('/group')}>{tr('form.back')}</a>
		</form>
	</section>
</article>
