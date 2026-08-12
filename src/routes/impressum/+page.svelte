<script lang="ts">
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';

	// Die E-Mail-Adresse steht bewusst nicht als zusammenhängende Zeichenkette im
	// Markup, damit sie nicht direkt aus dem ausgelieferten HTML abgegriffen werden
	// kann. Sie wird erst im Browser zusammengesetzt; ohne JavaScript bleibt die
	// umschriebene Form stehen, die für Menschen und Screenreader lesbar ist.
	// Bewusst `onMount` statt `$derived`: Letzteres würde beim SSR mitlaufen und die
	// fertige Adresse doch wieder ins ausgelieferte HTML schreiben.
	const mailUser: string = 'dominik.hellweg';
	const mailHost: string = 'protonmail.com';

	let mailAddress: string | undefined = $state(undefined);

	onMount(() => {
		mailAddress = `${mailUser}@${mailHost}`;
	});
</script>

<article>
	<h2>Impressum</h2>

	<section>
		<h3>Angaben gemäß § 5 DDG</h3>
		<address>
			Dominik Hellweg<br />
			Preinstraße 116<br />
			44265 Dortmund<br />
			E-Mail:
			{#if mailAddress}
				<a href="mailto:{mailAddress}">{mailAddress}</a>
			{:else}
				<span>{mailUser} (at) {mailHost}</span>
			{/if}
		</address>
		<p>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV: Dominik Hellweg (Anschrift wie oben).</p>
	</section>

	<section>
		<h3>Haftung für Inhalte</h3>
		<p>
			Die Inhalte dieser Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und
			Aktualität der Inhalte kann ich jedoch keine Gewähr übernehmen. Als Diensteanbieter bin ich gemäß § 7 Abs. 1 DDG
			für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 DDG bin ich
			als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen
			oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen. Bei Bekanntwerden entsprechender
			Rechtsverletzungen entferne ich diese Inhalte umgehend.
		</p>
	</section>

	<section>
		<h3>Nutzerinhalte</h3>
		<p>
			Festivals, Kommentare, Gruppen- und Profilangaben stammen von den angemeldeten Nutzerinnen und Nutzern. Für diese
			fremden Inhalte bin ich als Betreiber erst ab Kenntnis einer konkreten Rechtsverletzung verantwortlich. Hinweise
			auf rechtswidrige Inhalte nehme ich über die oben genannte E-Mail-Adresse entgegen.
		</p>
	</section>

	<section>
		<p>
			Informationen zur Verarbeitung personenbezogener Daten finden sich in der
			<a href={resolve('/datenschutz')}>Datenschutzerklärung</a>.
		</p>
	</section>
</article>
