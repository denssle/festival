<script lang="ts">
	import { onMount } from 'svelte';
	import Spinner from '$lib/sharedComponents/Spinner.svelte';

	export let userId: string = '';
	let avatar: string;

	async function load() {
		await fetch('/user-image/' + userId, {
			method: 'GET'
		}).then((response) => {
			response.blob().then((data) => {
				data.text().then((text) => {
					avatar = text;
				});
			});
		});
	}

	onMount(() => {
		load();
	});
</script>

{#if avatar}
	<img src={avatar} alt="alt avatar" class="avatar" />
{:else}
	<Spinner />
{/if}

<style>
	.avatar {
		vertical-align: middle;
		object-fit: cover;
		border-radius: 50%;
		width: 15em;
		height: 15em;
		border: solid var(--green);
	}
</style>
