<script lang="ts">
	export let showJoinDialog: boolean;

	let dialog: HTMLDialogElement;
	let otherGuests: boolean = false;
	let numberOfOtherGuests: boolean;

	$: if (dialog && showJoinDialog) dialog.showModal();
</script>

<dialog bind:this={dialog} on:close={() => (showJoinDialog = false)}>
	<h4>Bei dem Event bin ich dabei!</h4>

	<section>
		<label>
			<input type="checkbox" bind:checked={otherGuests} />
			Ich bringe weitere Gäste mit (die hier nicht angemeldet sind):
		</label>
		<label>
			Und zwar:
			<input type="number" id="otherGuests" bind:value={numberOfOtherGuests} disabled={!otherGuests} />
		</label>
	</section>

	<button on:click={() => dialog.close()}> Beitreten </button>
</dialog>
