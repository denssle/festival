<script lang="ts">
	import InfoDialog from '$lib/sharedComponents/InfoDialog.svelte';
	import { error } from '@sveltejs/kit';
	import type { InfoDialogData } from '$lib/models/dialogData/InfoDialogData';

	export let isOwnProfil: boolean;
	let fileInput: HTMLElement;
	let files: FileList;

	function onUpload() {
		if (isOwnProfil) {
			fileInput.click();
		} else {
			openDialog('Leider kannst du nur dein eigenes Profil ändern. ');
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
			openDialog('Bild zu groß. ');
		}
	}

	async function uploadFunction(imgBase64: string): Promise<void> {
		await fetch(`/user-image`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json'
			},
			body: imgBase64
		})
			.then((value: Response) => {
				if (value.ok) {
					openDialog('Bild erfolgreich hochgeladen und gespeichert. ');
				} else {
					openDialog('Bildupload gescheitert. ');
				}
			})
			.catch((reason) => error(reason));
	}

	function openDialog(msg: string) {
		infoDialogData.infoDialogText = msg;
		infoDialogData.showDialog = true;
	}

	let infoDialogData: InfoDialogData = {
		showDialog: false,
		infoDialogText: '',
		dialog: undefined,
		answerYes: false
	};
</script>

<div>
	<InfoDialog bind:infoDialogData />
	<input
		accept=".png,.jpg"
		bind:files
		bind:this={fileInput}
		on:change={() => getBase64(files[0])}
		style="display: none"
		type="file"
	/>
	<button on:click={() => onUpload()}>Bild hochladen</button>
</div>
