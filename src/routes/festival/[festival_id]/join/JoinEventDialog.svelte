<script lang='ts'>
	import type { JoinEventDialogData } from '$lib/models/dialogData/JoinEventDialogData';
	import BaseDialog from '$lib/sharedComponents/BaseDialog.svelte';

	export let joinDialogData: JoinEventDialogData;
</script>

<BaseDialog bind:dialogData={joinDialogData} buttonLabels={{ yes: 'Beitreten', no: 'Zurück' }}>
	<h4>Bei dem Event bin ich dabei!</h4>

	<section>
		<label>
			Ich bringe weitere Gäste mit (die hier nicht angemeldet sind):
			<input bind:value={joinDialogData.numberOfOtherGuests} id='otherGuests' type='number' />
		</label>
	</section>

	<section>
		<label>
			Ich bringe etwas zu essen mit:
			<input bind:value={joinDialogData.food} id='food' type='text' />
		</label>

		{#if joinDialogData.bringYourOwnFood}
			<span>Hinweis: Das ist eine Mitbringparty.</span>
		{:else}
			<span>Hinweis: Das ist <mark>keine</mark> Mitbringparty.</span>
		{/if}
	</section>

	<section>
		<label>
			Ich bringe etwas zu trinken mit:
			<input bind:value={joinDialogData.drink} id='drink' type='text' />
		</label>

		{#if joinDialogData.bringYourOwnBottle}
			<span>Hinweis: Das ist eine Mitbringparty.</span>
		{:else}
			<span>Hinweis: Das ist <mark>keine</mark> Mitbringparty.</span>
		{/if}
	</section>
</BaseDialog>
