<script lang="ts">
	import { error } from '@sveltejs/kit';

	fetch(friendId + `/add-friend`, { method: 'POST' })
		.then((value: Response) => {
			if (value.ok) {
				console.log('value ok');
				openDialog('Freundschaftsanfrage wurde geschickt.');
			} else {
				openDialog('Fehler bei Anfrage.');
			}
		})
		.catch((reason) => error(reason));
</script>