<script lang="ts">
	import { tr } from '$lib/i18n/tr';
	import type { TranslationKey } from '$lib/i18n';
	import { resolve } from '$app/paths';
	import { getGuestsWithAnswer } from '$lib/utils/festivalEvent.util';
	import type { FestivalTransferData } from '$lib/models/transferData/FestivalTransferData';
	import type { CommentAnswer } from '$lib/models/Answer';

	/** Gäste, die mit Kommentar geantwortet haben: Absagen oder „Vielleicht“. */
	let { data, answer }: { data: FestivalTransferData; answer: CommentAnswer } = $props();

	const TEXTS: Record<CommentAnswer, { heading: TranslationKey; empty: TranslationKey; testId: string }> = {
		no: { heading: 'festival.notComing.heading', empty: 'festival.notComing.empty', testId: 'festival-notcoming' },
		maybe: { heading: 'festival.maybe.heading', empty: 'festival.maybe.empty', testId: 'festival-maybe' }
	};

	let texts = $derived(TEXTS[answer]);
	let guests = $derived(getGuestsWithAnswer(data.festival, answer));
</script>

<section data-testid="{texts.testId}-section">
	<h5 data-testid="{texts.testId}-heading">{tr(texts.heading)}</h5>
	{#if guests.length}
		<table style="width: 100%">
			<thead>
				<tr>
					<th>{tr('table.name')}</th>
					<th>{tr('festival.notComing.comment')}</th>
				</tr>
			</thead>
			<tbody>
				{#each guests as guest (guest.user?.id)}
					<tr>
						<td>
							<a href={resolve('/user/[user_id]', { user_id: guest.user?.id ?? '' })}>{guest.user?.nickname}</a>
						</td>
						<td>
							{guest.comment}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{:else}
		<p>{tr(texts.empty)}</p>
	{/if}
</section>
