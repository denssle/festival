<script lang="ts">
	import { request } from '$lib/utils/request';
	import { tr } from '$lib/i18n/tr';
	import InfoDialog from '$lib/sharedComponents/InfoDialog.svelte';
	import type { InfoDialogData } from '$lib/models/dialogData/InfoDialogData';
	import { loadUserImage } from '$lib/stores/userImage.store';
	import { resolve } from '$app/paths';

	let { isOwnProfil, userId = '' }: { isOwnProfil: boolean; userId?: string } = $props();

	let fileInput: HTMLElement;
	let files: FileList = $state() as FileList;

	function onUpload() {
		if (isOwnProfil) {
			fileInput.click();
		} else {
			openDialog(tr('profile.avatar.onlyOwn'));
		}
	}

	function getBase64(image: File): void {
		if (image.size < 1048576) {
			const reader = new FileReader();
			reader.readAsDataURL(image);
			reader.onload = (e: ProgressEvent<FileReader>) => {
				if (e.target && e.target.result && typeof e.target.result === 'string') {
					uploadFunction(e.target.result);
				}
			};
		} else {
			openDialog(tr('profile.avatar.tooLarge'));
		}
	}

	async function uploadFunction(imgBase64: string): Promise<void> {
		const result = await request(resolve('/user-image'), {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json'
			},
			body: imgBase64
		});
		if (result.ok) {
			openDialog(tr('profile.avatar.uploaded'));
			// forceReload: das gerade ersetzte Bild liegt noch frisch im Browser-Cache
			loadUserImage(userId, true);
		} else {
			openDialog(tr('profile.avatar.failed') + ' ' + result.message);
		}
	}

	function openDialog(msg: string) {
		infoDialogData.infoDialogText = msg;
		infoDialogData.showDialog = true;
	}

	let infoDialogData: InfoDialogData = $state({
		showDialog: false,
		infoDialogText: '',
		dialog: undefined,
		answerYes: false
	});
</script>

<div>
	<InfoDialog bind:infoDialogData />
	<input
		accept=".png,.jpg"
		bind:files
		bind:this={fileInput}
		onchange={() => getBase64(files[0])}
		style="display: none"
		type="file"
	/>
	<button onclick={() => onUpload()}>{tr('profile.avatar.upload')}</button>
</div>
