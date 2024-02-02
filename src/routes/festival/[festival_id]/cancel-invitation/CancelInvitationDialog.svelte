<script lang="ts">
	import type { CancelInvitationDialogData } from '$lib/models/dialogData/CancelInvitationDialogData';
	import BaseDialog from '$lib/sharedComponents/BaseDialog.svelte';

	export let cancelInvitationDialogData: CancelInvitationDialogData;
</script>

<BaseDialog bind:dialogData={cancelInvitationDialogData}>
	<h4>Leider bin ich / sind wir bei dem Event nicht dabei.</h4>

	<section>
		<label>
			Kommentar:
			<input type="text" id="comment" bind:value={cancelInvitationDialogData.comment} />
		</label>
	</section>
</BaseDialog>
