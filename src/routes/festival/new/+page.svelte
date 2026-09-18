<script lang="ts">
	import { tr } from '$lib/i18n/tr';
	import { resolve } from '$app/paths';
</script>

<article>
	<h2>{tr('festival.new.heading')}</h2>
	<section>
		<form method="POST">
			<p>
				<input name="name" placeholder={tr('festival.form.name')} required />
				<textarea name="description" placeholder={tr('festival.form.description')}></textarea>
			</p>

			<p>
				<input name="startDate" placeholder="date" type="date" />
				<input name="startTime" placeholder="time" type="time" />
			</p>

			<p>
				<textarea name="location" placeholder={tr('festival.form.location')}></textarea>
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

			<button type="submit" data-testid="festival-save">{tr('form.save')}</button>
			<a class="button" href={resolve('/')}>{tr('form.back')}</a>
		</form>
	</section>
</article>
