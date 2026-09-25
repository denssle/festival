<script lang="ts">
	import { tr } from '$lib/i18n/tr';
	import { MAX_LONG_TEXT_LENGTH } from '$lib/services/text-length.logic';
	import type { CancelInvitationDialogData } from '$lib/models/dialogData/CancelInvitationDialogData';
	import BaseDialog from '$lib/sharedComponents/BaseDialog.svelte';

	let { cancelInvitationDialogData = $bindable() }: { cancelInvitationDialogData: CancelInvitationDialogData } =
		$props();

	let isMaybe = $derived(cancelInvitationDialogData.answer === 'maybe');
</script>

<BaseDialog
	bind:dialogData={cancelInvitationDialogData}
	buttonLabels={{ yes: isMaybe ? tr('festival.maybe') : tr('festival.decline'), no: tr('form.back') }}
	testId={isMaybe ? 'maybe-dialog' : 'cancel-dialog'}
>
	<p>{isMaybe ? tr('festival.maybeDialog.text') : tr('festival.declineDialog.text')}</p>

	<section>
		<label for="comment">{tr('festival.declineDialog.comment')}</label>
		<input bind:value={cancelInvitationDialogData.comment} id="comment" maxlength={MAX_LONG_TEXT_LENGTH} type="text" />
	</section>
</BaseDialog>
