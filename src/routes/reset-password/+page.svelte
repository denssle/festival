<script lang="ts">
	import { tr } from '$lib/i18n/tr';
	import { resolve } from '$app/paths';
	import { MIN_PASSWORD_LENGTH } from '$lib/constants';
	import type { PageData } from './$types';
	import type { StandardResponse } from '$lib/models/transferData/StandardResponse';

	let { data, form }: { data: PageData; form: StandardResponse | null } = $props();
</script>

<article>
	<h2>{tr('resetPassword.heading')}</h2>

	{#if form?.message}
		<p class={form.success ? 'success' : 'error'} data-testid="reset-password-message">{form.message}</p>
	{/if}

	{#if form?.success}
		<p><a href={resolve('/login')} data-testid="reset-password-login">{tr('resetPassword.toLogin')}</a></p>
	{:else if data.valid}
		<form method="POST">
			<input type="hidden" name="token" value={data.token} />
			<p>
				<label for="password">{tr('resetPassword.newLabel')} </label>
				<input
					id="password"
					name="password"
					type="password"
					autocomplete="new-password"
					minlength={MIN_PASSWORD_LENGTH}
					required
				/>
			</p>
			<p>
				<label for="passwordRepeat">{tr('resetPassword.repeatLabel')} </label>
				<input
					id="passwordRepeat"
					name="passwordRepeat"
					type="password"
					autocomplete="new-password"
					minlength={MIN_PASSWORD_LENGTH}
					required
				/>
			</p>
			<p>
				<button type="submit" data-testid="reset-password-submit">{tr('resetPassword.submit')}</button>
			</p>
		</form>
	{:else}
		{#if !form?.message}
			<p class="error" data-testid="reset-password-message">{tr('resetPassword.invalid')}</p>
		{/if}
		<p><a href={resolve('/forgot-password')}>{tr('resetPassword.requestNew')}</a></p>
	{/if}
</article>

<style>
	.success {
		color: var(--accent);
	}

	.error {
		color: var(--error);
	}
</style>
