<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<article>
	<h2>Datenschutzerklärung</h2>

	<section>
		<h3>Verantwortlicher</h3>
		<p>
			Verantwortlich für die Verarbeitung personenbezogener Daten auf dieser Seite ist Dominik Hellweg. Anschrift und
			Kontaktmöglichkeit stehen im <a href={resolve('/impressum')}>Impressum</a>.
		</p>
		<p>
			Dies ist eine private, nicht kommerzielle Anwendung zur Planung von Festivals und Feiern im Bekanntenkreis. Es
			findet weder Werbung noch Tracking oder eine Weitergabe von Daten zu Werbezwecken statt.
		</p>
	</section>

	<section>
		<h3>Welche Daten verarbeitet werden</h3>
		<p>Die Nutzung setzt ein Benutzerkonto voraus. Gespeichert werden dabei:</p>
		<ul>
			<li>
				<strong>Kontodaten:</strong> Nickname (Pflichtangabe, dient der Anmeldung) sowie – jeweils freiwillig – Vorname, Nachname
				und E-Mail-Adresse. Das Passwort wird ausschließlich als bcrypt-Hash gespeichert, nie im Klartext.
			</li>
			<li>
				<strong>Profilbild:</strong> ein optional hochgeladenes Bild, gespeichert in der Datenbank.
			</li>
			<li>
				<strong>Festivals:</strong> Name, Beschreibung, Ort, Datum und Angaben zur Verpflegung der von Nutzenden angelegten
				Veranstaltungen.
			</li>
			<li>
				<strong>Zu- und Absagen:</strong> Teilnahmestatus, Anzahl mitgebrachter Gäste, mitgebrachte Speisen und Getränke sowie
				ein freier Kommentar.
			</li>
			<li>
				<strong>Kommentare:</strong> Text, Verfasser und Bezug (Festival oder Profil) samt Zeitpunkt.
			</li>
			<li>
				<strong>Soziale Verknüpfungen:</strong> Gruppen samt Mitgliedschaften sowie Freundschaften und offene Freundschaftsanfragen.
			</li>
			<li>
				<strong>Sitzungsdaten:</strong> ein zufälliger Sitzungstoken, der die Anmeldung aufrechterhält.
			</li>
		</ul>
		<p>
			Zu allen genannten Datensätzen werden technisch bedingt Erstellungs- und Änderungszeitpunkt gespeichert. Eine
			automatisierte Entscheidungsfindung oder ein Profiling findet nicht statt.
		</p>
	</section>

	<section>
		<h3>Zweck und Rechtsgrundlage</h3>
		<p>
			Sämtliche Daten dienen allein dem Betrieb der Anwendung: der Anmeldung, der Darstellung von Festivals und Profilen
			gegenüber anderen angemeldeten Nutzenden und der Planung von Veranstaltungen. Rechtsgrundlage ist Art. 6 Abs. 1
			lit. b DSGVO (Erfüllung des Nutzungsverhältnisses) für Konto- und Veranstaltungsdaten sowie Art. 6 Abs. 1 lit. f
			DSGVO (berechtigtes Interesse an einem funktionsfähigen und missbrauchssicheren Betrieb) für Sitzungsdaten und
			Server-Protokolle. Freiwillige Angaben wie Vorname, Nachname, E-Mail-Adresse und Profilbild beruhen auf Art. 6
			Abs. 1 lit. a DSGVO (Einwilligung) und können jederzeit in den
			<a href={resolve('/settings')}>Einstellungen</a> geändert oder entfernt werden.
		</p>
	</section>

	<section>
		<h3>Sichtbarkeit für andere Nutzende</h3>
		<p>
			Diese Anwendung ist ein geschlossener Bereich: Ohne Anmeldung sind keine Inhalte zugänglich. Angemeldete Nutzende
			können jedoch Profile, Festivals, Zu- und Absagen sowie Kommentare anderer sehen. Angaben, die nicht geteilt
			werden sollen, sollten deshalb nicht hinterlegt werden – insbesondere die freiwilligen Profilfelder.
		</p>
	</section>

	<section>
		<h3>Cookies</h3>
		<p>
			Es wird ein einziges technisch notwendiges Cookie gesetzt (<code>session</code>). Es enthält keinen Namen und
			keine Profildaten, sondern nur einen zufälligen Token, über den die Sitzung serverseitig zugeordnet wird. Das
			Cookie läuft spätestens nach 30 Tagen ab und wird beim Logout gelöscht. Es gibt keine Analyse-, Werbe- oder
			Drittanbieter-Cookies; eine Einwilligung ist dafür nach § 25 Abs. 2 TDDDG nicht erforderlich.
		</p>
	</section>

	<section>
		<h3>Server-Protokolle und Missbrauchsschutz</h3>
		<p>
			Beim Aufruf der Seite fallen beim Hoster technische Protokolldaten an (unter anderem IP-Adresse, Zeitpunkt,
			aufgerufene Adresse, Browsertyp). Sie dienen dem sicheren Betrieb und der Fehlersuche.
		</p>
		<p>
			Zum Schutz vor dem automatisierten Durchprobieren von Passwörtern wird bei fehlgeschlagenen Anmeldeversuchen die
			IP-Adresse zusammen mit dem verwendeten Nickname für 15 Minuten im Arbeitsspeicher des Servers vorgehalten. Diese
			Angaben werden nicht in der Datenbank gespeichert und verfallen automatisch.
		</p>
	</section>

	<section>
		<h3>Hosting</h3>
		<p>
			Die Anwendung wird bei der uberspace.de GmbH (Sonnenberger Straße 16, 65193 Wiesbaden) betrieben. Der Hoster
			verarbeitet die Daten ausschließlich weisungsgebunden als Auftragsverarbeiter nach Art. 28 DSGVO. Die Server
			stehen in Deutschland; eine Übermittlung in Drittländer findet nicht statt.
		</p>
	</section>

	<section>
		<h3>Speicherdauer</h3>
		<p>
			Konto- und Inhaltsdaten werden gespeichert, solange das Benutzerkonto besteht. Wird das Konto gelöscht, werden die
			damit verknüpften Daten – Profilbild, eigene Festivals, Zu- und Absagen, Kommentare, Gruppenmitgliedschaften,
			Freundschaften und Anfragen – mitgelöscht. Sitzungstoken verfallen spätestens nach 30 Tagen. Zur Löschdauer der
			Server-Protokolle gelten die Fristen des Hosters.
		</p>
	</section>

	<section>
		<h3>Rechte der betroffenen Personen</h3>
		<p>
			Es besteht das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung der
			Verarbeitung (Art. 18), Datenübertragbarkeit (Art. 20) sowie Widerspruch gegen Verarbeitungen auf Grundlage
			berechtigter Interessen (Art. 21). Erteilte Einwilligungen können jederzeit mit Wirkung für die Zukunft widerrufen
			werden; die Rechtmäßigkeit der bis dahin erfolgten Verarbeitung bleibt unberührt.
		</p>
		<p>
			Viele dieser Rechte lassen sich unmittelbar in der Anwendung ausüben: Profilangaben und Passwort sind in den
			<a href={resolve('/settings')}>Einstellungen</a> änderbar, eigene Festivals und Kommentare dort löschbar, wo sie
			angezeigt werden. Für alles Weitere – insbesondere Auskunft und vollständige Kontolöschung – genügt eine Nachricht
			an die im <a href={resolve('/impressum')}>Impressum</a> genannte Adresse.
		</p>
		<p>
			Zudem besteht ein Beschwerderecht bei einer Datenschutz-Aufsichtsbehörde, für den Verantwortlichen zuständig ist
			die Landesbeauftragte für Datenschutz und Informationsfreiheit Nordrhein-Westfalen.
		</p>
	</section>

	<section>
		<h3>Datensicherheit</h3>
		<p>
			Die Übertragung erfolgt verschlüsselt über HTTPS. Passwörter werden ausschließlich als Hash gespeichert. Ein
			lückenloser Schutz von Daten bei der Übertragung im Internet ist gleichwohl nicht möglich.
		</p>
	</section>
</article>
