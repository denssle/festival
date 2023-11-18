<script lang="ts">
	export let showInfoDialog: boolean;
	export let infoDialogText: string;

	let dialog: HTMLDialogElement;
	$: if (dialog && showInfoDialog) dialog.showModal();
</script>

<dialog bind:this={dialog} on:close={() => (showInfoDialog = false)}>
	<article>
		<p>{infoDialogText}</p>
		<button on:click={() => dialog.close()}>Okay</button>
	</article>
</dialog>

<style>
	dialog {
		padding: 2%;
	}
</style>
