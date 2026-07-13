<script lang="ts">
	import { resolve } from '$app/paths';
	import Spinner from '$lib/sharedComponents/Spinner.svelte';
	import { goto } from '$app/navigation';
	import { getUserImageWritable, loadUserImage } from '$lib/stores/userImage.store';

	let { userId = '', size = 15 } = $props();

	let avatar: string = $state('');
	let unsubscribe: () => void | undefined;

	$effect(() => {
		if (userId) {
			loadAndSubscribe();
		}
		return () => {
			if (unsubscribe) {
				unsubscribe();
			}
		};
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
		goto(resolve('/user/[user_id]', { user_id: userId }));
	}
</script>

<div
	style="--size:{size + 'em'};"
	onclick={() => onImageClick()}
	role="button"
	tabindex="0"
	onkeypress={() => onImageClick()}
>
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
