<script lang="ts">
	import FormMessage from '$lib/sharedComponents/FormMessage.svelte';
	import { tr } from '$lib/i18n/tr';
	import { MAX_LONG_TEXT_LENGTH, MAX_SHORT_TEXT_LENGTH } from '$lib/services/text-length.logic';
	import { resolve } from '$app/paths';
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<article>
	<h2 data-testid="group-edit-heading">{tr('group.edit.heading')}</h2>
	<section>
		<form method="POST" use:enhance>
			<p>
				<label for="name">{tr('group.form.nameLabel')}</label>
				<input
					id="name"
					name="name"
					maxlength={MAX_SHORT_TEXT_LENGTH}
					placeholder={tr('group.form.name')}
					value={data.group.name}
					required
				/>
			</p>
			<p>
				<label for="description">{tr('group.form.descriptionLabel')}</label>
				<textarea
					id="description"
					name="description"
					maxlength={MAX_LONG_TEXT_LENGTH}
					placeholder={tr('group.form.description')}
					value={data.group.description}
				></textarea>
			</p>

			<FormMessage message={form?.message} success={form?.success} />

			<button type="submit" data-testid="group-save">{tr('form.save')}</button>
			<a class="button secondary" href={resolve('/group/[group_id]', { group_id: data.group.id })}
				>{tr('form.cancel')}</a
			>
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
	.secondary {
		background-color: #666;
	}
</style>
