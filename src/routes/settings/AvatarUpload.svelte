<script lang="ts">
	let fileInput: HTMLElement;
	let files: FileList;
	let avatar: string;

	function getBase64(image: File): void {
		const reader = new FileReader();
		reader.readAsDataURL(image);
		reader.onload = (e: ProgressEvent<FileReader>) => {
			if (e.target && e.target.result && typeof e.target.result === 'string') {
				avatar = e.target.result;
				uploadFunction(e.target.result);
			}
		};
	}

	async function uploadFunction(imgBase64: string): Promise<void> {
		console.log(imgBase64.length);
		await fetch(`/upload`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json'
			},
			body: imgBase64
		});
	}

	async function load() {
		await fetch('/upload', {
			method: 'GET'
		}).then((response) => {
			response.blob().then((data) => {
				data.text().then((text) => {
					console.log(text);
					avatar = text;
				});
			});
		});
	}
</script>

<div>
	{#if avatar}
		<img id="avatar" src={avatar} alt="alt avatar" />
	{:else}
		<!-- <img id="avatar" src="avatar.png" alt="avatar" /> -->
		<p>No avatar</p>
	{/if}

	<input
		style="display: none"
		type="file"
		accept=".png,.jpg"
		bind:files
		bind:this={fileInput}
		on:change={() => getBase64(files[0])}
	/>
	<button on:click={() => fileInput.click()}>Upload</button>
	<button on:click={() => load()}>Load</button>
</div>
