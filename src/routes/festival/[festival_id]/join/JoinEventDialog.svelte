<script lang="ts">
	import { tr } from '$lib/i18n/tr';
	import type { JoinEventDialogData } from '$lib/models/dialogData/JoinEventDialogData';
	import BaseDialog from '$lib/sharedComponents/BaseDialog.svelte';
	import RichText from '$lib/sharedComponents/RichText.svelte';

	let { joinDialogData = $bindable() }: { joinDialogData: JoinEventDialogData } = $props();
</script>

<BaseDialog
	bind:dialogData={joinDialogData}
	buttonLabels={{ yes: tr('festival.joinDialog.confirm'), no: tr('form.back') }}
	testId="join-dialog"
>
	<h4>{tr('festival.joinDialog.heading')}</h4>

	<section>
		<label>
			{tr('festival.joinDialog.otherGuests')}
			<input bind:value={joinDialogData.numberOfOtherGuests} id="otherGuests" type="number" />
		</label>
	</section>

	<section>
		<label>
			{tr('festival.joinDialog.food')}
			<input bind:value={joinDialogData.food} id="food" type="text" />
		</label>

		{#if joinDialogData.bringYourOwnFood}
			<span>{tr('festival.joinDialog.byo')}</span>
		{:else}
			<span>
				<RichText text={tr('festival.joinDialog.notByo')}>
					{#snippet mark(inner: string)}<mark>{inner}</mark>{/snippet}
				</RichText>
			</span>
		{/if}
	</section>

	<section>
		<label>
			{tr('festival.joinDialog.drink')}
			<input bind:value={joinDialogData.drink} id="drink" type="text" />
		</label>

		{#if joinDialogData.bringYourOwnBottle}
			<span>{tr('festival.joinDialog.byo')}</span>
		{:else}
			<span>
				<RichText text={tr('festival.joinDialog.notByo')}>
					{#snippet mark(inner: string)}<mark>{inner}</mark>{/snippet}
				</RichText>
			</span>
		{/if}
	</section>
</BaseDialog>
