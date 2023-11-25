<script lang="ts">
	let fileInput: HTMLElement;
	let files: FileList;

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
		console.log(imgBase64.length);
		await fetch(`/user-image`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json'
			},
			body: imgBase64
		});
	}
</script>

<div>
	<input
		style="display: none"
		type="file"
		accept=".png,.jpg"
		bind:files
		bind:this={fileInput}
		on:change={() => getBase64(files[0])}
	/>
	<button on:click={() => fileInput.click()}>Upload</button>
</div>
