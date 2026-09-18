<script lang="ts">
	import { tr } from '$lib/i18n/tr';
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
				<input id="name" name="name" placeholder={tr('group.form.name')} value={data.group.name} required />
			</p>
			<p>
				<label for="description">{tr('group.form.descriptionLabel')}</label>
				<textarea
					id="description"
					name="description"
					placeholder={tr('group.form.description')}
					value={data.group.description}
				></textarea>
			</p>

			{#if form?.message}
				<p class="error">{form.message}</p>
			{/if}

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
	.error {
		color: red;
	}
	.secondary {
		background-color: #666;
	}
</style>
