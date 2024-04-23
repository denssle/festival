<script lang='ts'>
	import { afterUpdate, onMount } from 'svelte';
	import Spinner from '$lib/sharedComponents/Spinner.svelte';
	import { FALLBACK_PICTURE } from '$lib/constants';
	import { goto } from '$app/navigation';

	export let userId: string = '';
	export let size: number = 15;

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

	function onImageClick() {
		goto('/user/' + userId);
	}
</script>

<div style='--size:{size+"em"};' on:click={()=> onImageClick()}>
	{#if avatar}
		<img src={avatar} alt='alt avatar' class='avatar' />
	{:else}
		<Spinner />
	{/if}
</div>


<style>
    .avatar {
        vertical-align: middle;
        object-fit: cover;
        border-radius: 50%;
        width: var(--size);
        height: var(--size);
        border: solid var(--green);
        cursor: pointer;
    }
</style>
