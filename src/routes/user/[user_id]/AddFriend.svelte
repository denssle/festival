<script lang="ts">
	import { error } from '@sveltejs/kit';

	export let friends = false; // TODO
	export let friendId: string;

	async function addFriend(): Promise<void> {
		fetch(friendId + `/add-friend`, { method: 'POST' })
			.then((value: Response) => {
				if (value.ok) {
					console.log('value ok');
				} else {
					console.log('value not ok');
				}
			})
			.catch((reason) => error(reason));
	}

	function removeFriend(): void {
		console.log('remove friend');
	}
</script>

<div>
	{#if friends}
		<button on:click={() => removeFriend()}> Freund entfernen</button>
	{:else}
		<button on:click={() => addFriend()}> Anfreunden</button>
	{/if}
</div>
