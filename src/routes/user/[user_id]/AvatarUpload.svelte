<script lang="ts">
	import InfoDialog from '$lib/sharedComponents/InfoDialog.svelte';
	import { error } from '@sveltejs/kit';

	export let isOwnProfil: boolean;
	let fileInput: HTMLElement;
	let files: FileList;

	function onUpload() {
		if (isOwnProfil) {
			fileInput.click();
		} else {
			infoDialogText = 'Leider kannst du nur dein eigenes Profil ändern. ';
			showInfoDialog = true;
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
					infoDialogText = 'Bild erfolgreich hochgeladen und gespeichert. ';
					showInfoDialog = true;
				}
			})
			.catch((reason) => error(reason));
	}

	let infoDialogText = '';
	let showInfoDialog = false;
</script>

<div>
	<InfoDialog bind:showInfoDialog bind:infoDialogText></InfoDialog>
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
