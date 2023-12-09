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
			infoDialogData.infoDialogText = 'Leider kannst du nur dein eigenes Profil ändern. ';
			infoDialogData.showDialog = true;
		}
	}

	function getBase64(image: File): void {
		const reader = new FileReader();
		reader.readAsDataURL(image);
		reader.onload = (e: ProgressEvent<FileReader>) => {
			if (e.target && e.target.result && typeof e.target.result === 'string') {
				uploadFunction(e.target.result);
			}
		};
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
					infoDialogData.infoDialogText = 'Bild erfolgreich hochgeladen und gespeichert. ';
					infoDialogData.showDialog = true;
				}
			})
			.catch((reason) => error(reason));
	}

	let infoDialogData: InfoDialogData = {
		showDialog: false,
		infoDialogText: '',
		dialog: undefined
	};
</script>

<div>
	<InfoDialog bind:infoDialogData />
	<input
		style="display: none"
		type="file"
		accept=".png,.jpg"
		bind:files
		bind:this={fileInput}
		on:change={() => getBase64(files[0])}
	/>
	<button on:click={() => onUpload()}>Upload</button>
</div>
