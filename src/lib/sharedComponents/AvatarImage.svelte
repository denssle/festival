<script lang="ts">
	import { afterUpdate, onMount } from 'svelte';
	import Spinner from '$lib/sharedComponents/Spinner.svelte';
	import { FALLBACK_PICTURE } from '$lib/constants';

	export let userId: string = '';
	let prevUserId: string;
	let avatar: string;

	async function load() {
		await fetch('/user-image/' + userId, {
			method: 'GET'
		})
			.then((response) => {
				if (response.ok) {
					response
						.blob()
						.then((data) => {
							data.text().then((text: string) => {
								avatar = text;
							});
						})
						.catch((reason) => {
							console.log('read blob failed', reason);
						});
				} else {
					avatar = FALLBACK_PICTURE;
				}
			})
			.catch((reason) => {
				console.error('loading picture error', reason);
				avatar = FALLBACK_PICTURE;
			});
	}

	onMount(() => {
		prevUserId = userId;
		load();
	});

	afterUpdate(() => {
		if (prevUserId !== userId) {
			prevUserId = userId;
			load();
		}
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
