<script lang="ts">
	import { afterUpdate, onMount } from 'svelte';
	import Spinner from '$lib/sharedComponents/Spinner.svelte';
	import { goto } from '$app/navigation';
	import { getUserImageWritable, loadUserImage } from '$lib/stores/user-image';

	export let userId: string = '';
	export let size: number = 15;

	let avatar: string;
	let prevUserId: string;
	let unsubscribe: () => void | undefined;

	onMount(() => {
		prevUserId = userId;
		loadAndSubscribe();
	});

	afterUpdate(() => {
		if (prevUserId !== userId) {
			prevUserId = userId;
			loadAndSubscribe();
		}
	});

	function loadAndSubscribe(): void {
		if (unsubscribe) {
			unsubscribe();
		}
		unsubscribe = getUserImageWritable(userId).subscribe((value: string) => {
			avatar = value;
		});
		loadUserImage(userId);
	}

	function onImageClick() {
		goto('/user/' + userId);
	}
</script>

<div style="--size:{size + 'em'};" on:click={() => onImageClick()}>
	{#if avatar}
		<img src={avatar} alt="alt avatar" class="avatar" />
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
