/**
 * Reine Validierungslogik für hochgeladene Profilbilder.
 *
 * Der Client sendet das Bild als Data-URI (`data:<mime>;base64,<payload>`) und prüft
 * Größe/Typ nur clientseitig (AvatarUpload.svelte). Diese Logik ist das serverseitige
 * Gegenstück und wird im `POST /user-image`-Endpoint erzwungen.
 */

/** Maximal erlaubte Bildgröße in Byte (1 MB) – deckt sich mit der Client-Prüfung. */
export const MAX_IMAGE_BYTES = 1_048_576;

/** Erlaubte MIME-Typen (der File-Input akzeptiert nur .png/.jpg). */
export const ALLOWED_IMAGE_MIME_TYPES = ['image/png', 'image/jpeg', 'image/jpg'] as const;

/** Maschinenlesbarer Fehlergrund – der Endpoint mappt ihn auf einen HTTP-Status. */
export type ImageValidationError = 'malformed' | 'type' | 'size' | 'empty';

export type ImageValidationResult =
	| { valid: true; mime: string }
	| { valid: false; error: ImageValidationError; reason: string };

/**
 * Ermittelt die dekodierte Byte-Länge eines Base64-Strings ohne ihn tatsächlich zu dekodieren.
 */
function base64ByteLength(base64: string): number {
	const len = base64.length;
	if (len === 0) {
		return 0;
	}
	const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
	return Math.floor((len * 3) / 4) - padding;
}

/**
 * Validiert eine als Data-URI übergebene Bilddatei gegen erlaubten Typ und maximale Größe.
 *
 * @param dataUri - z. B. `data:image/png;base64,iVBORw0K...`
 */
export function validateImageDataUri(dataUri: string): ImageValidationResult {
	const match = /^data:([^;,]+);base64,(.*)$/s.exec(dataUri.trim());
	if (!match) {
		return { valid: false, error: 'malformed', reason: 'Ungültiges Bildformat (Base64-Data-URI erwartet).' };
	}

	const mime = match[1].toLowerCase();
	const payload = match[2];

	if (!(ALLOWED_IMAGE_MIME_TYPES as readonly string[]).includes(mime)) {
		return { valid: false, error: 'type', reason: `Nicht erlaubter Bildtyp: ${mime}. Erlaubt sind PNG und JPG.` };
	}

	const sizeInBytes = base64ByteLength(payload);
	if (sizeInBytes === 0) {
		return { valid: false, error: 'empty', reason: 'Leeres Bild.' };
	}
	if (sizeInBytes > MAX_IMAGE_BYTES) {
		return { valid: false, error: 'size', reason: 'Bild zu groß (max. 1 MB).' };
	}

	return { valid: true, mime };
}
