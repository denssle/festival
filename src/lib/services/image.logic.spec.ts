import { describe, it, expect } from 'vitest';
import { validateImageDataUri, MAX_IMAGE_BYTES } from './image.logic';

/** Erzeugt eine Data-URI mit einem Base64-Payload gegebener dekodierter Byte-Länge. */
function dataUriOfSize(mime: string, bytes: number): string {
	// 'A' wiederholt ergibt gültiges Base64; ceil(bytes*4/3) Zeichen ~ bytes Byte.
	const chars = Math.ceil((bytes * 4) / 3);
	return `data:${mime};base64,${'A'.repeat(chars)}`;
}

describe('validateImageDataUri', () => {
	it('akzeptiert ein kleines PNG', () => {
		const result = validateImageDataUri(
			'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
		);
		expect(result.valid).toBe(true);
	});

	it('akzeptiert JPEG', () => {
		expect(validateImageDataUri(dataUriOfSize('image/jpeg', 1024)).valid).toBe(true);
	});

	it('lehnt einen nicht erlaubten Typ ab', () => {
		const result = validateImageDataUri(dataUriOfSize('image/gif', 100));
		expect(result).toMatchObject({ valid: false, error: 'type' });
	});

	it('lehnt SVG (XSS-Risiko) ab', () => {
		const result = validateImageDataUri(dataUriOfSize('image/svg+xml', 100));
		expect(result).toMatchObject({ valid: false, error: 'type' });
	});

	it('lehnt einen String ohne Data-URI-Präfix ab', () => {
		const result = validateImageDataUri('iVBORw0KGgoAAAANSUhEUg');
		expect(result).toMatchObject({ valid: false, error: 'malformed' });
	});

	it('lehnt ein leeres Bild ab', () => {
		const result = validateImageDataUri('data:image/png;base64,');
		expect(result).toMatchObject({ valid: false, error: 'empty' });
	});

	it('lehnt ein Bild über 1 MB ab', () => {
		const result = validateImageDataUri(dataUriOfSize('image/png', MAX_IMAGE_BYTES + 1024));
		expect(result).toMatchObject({ valid: false, error: 'size' });
	});

	it('akzeptiert ein Bild exakt an der Größengrenze', () => {
		expect(validateImageDataUri(dataUriOfSize('image/png', MAX_IMAGE_BYTES)).valid).toBe(true);
	});
});
