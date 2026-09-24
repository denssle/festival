<script lang="ts">
	import { tr } from '$lib/i18n/tr';
	import { MAX_LONG_TEXT_LENGTH, MAX_SHORT_TEXT_LENGTH } from '$lib/services/text-length.logic';
	import { resolve } from '$app/paths';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<article>
	<h2>{tr('festival.new.heading')}</h2>
	<section>
		<form method="POST">
			<p>
				<input name="name" maxlength={MAX_SHORT_TEXT_LENGTH} placeholder={tr('festival.form.name')} required />
				<textarea name="description" maxlength={MAX_LONG_TEXT_LENGTH} placeholder={tr('festival.form.description')}
				></textarea>
			</p>

			<p>
				<input name="startDate" placeholder="date" type="date" />
				<input name="startTime" placeholder="time" type="time" />
			</p>

			<p>
				<textarea name="location" maxlength={MAX_SHORT_TEXT_LENGTH} placeholder={tr('festival.form.location')}
				></textarea>
			</p>

			<p>
				<label>
					<input name="bringYourOwnFood" type="checkbox" />
					{tr('festival.bringFood')}
				</label>
				<label>
					<input name="bringYourOwnBottle" type="checkbox" />
					{tr('festival.bringDrink')}
				</label>
			</p>

			{#if form?.message}
				<p class="error">{form.message}</p>
			{/if}

			<button type="submit" data-testid="festival-save">{tr('form.save')}</button>
			<a class="button" href={resolve('/')}>{tr('form.back')}</a>
		</form>
	</section>
</article>

<style>
	.error {
		color: red;
	}
</style>
