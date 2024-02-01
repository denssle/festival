<script lang="ts">
	import type { JoinEventDialogData } from '$lib/models/dialogData/JoinEventDialogData';

	export let joinDialogData: JoinEventDialogData;

	$: if (joinDialogData.dialog && joinDialogData.showDialog) joinDialogData.dialog.showModal();
</script>

<dialog bind:this={joinDialogData.dialog} on:close={() => (joinDialogData.showDialog = false)}>
	<h4>Bei dem Event bin ich dabei!</h4>

	<section>
		<label>
			Ich bringe weitere Gäste mit (die hier nicht angemeldet sind):
			<input type="number" id="otherGuests" bind:value={joinDialogData.numberOfOtherGuests} />
		</label>
	</section>

	<section>
		<label>
			Ich bringe etwas zu essen mit:
			<input type="text" id="food" bind:value={joinDialogData.food} />
		</label>

		{#if joinDialogData.bringYourOwnFood}
			<span>Hinweis: Das ist eine Mitbringparty.</span>
		{:else}
			<span>Hinweis: Das ist <strong>keine</strong> Mitbringparty.</span>
		{/if}
	</section>

	<section>
		<label>
			Ich bringe etwas zu trinken mit:
			<input type="text" id="drink" bind:value={joinDialogData.drink} />
		</label>

		{#if joinDialogData.bringYourOwnBottle}
			<span>Hinweis: Das ist eine Mitbringparty.</span>
		{:else}
			<span>Hinweis: Das ist <strong>keine</strong> Mitbringparty.</span>
		{/if}
	</section>

	<button on:click={() => joinDialogData.dialog?.close()}> Beitreten </button>
</dialog>
