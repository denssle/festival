import { render, screen } from '@testing-library/svelte';
import { expect, test } from 'vitest';
import Component from './+page.svelte';

test('Component', async () => {
	render(Component, { data: {}, form: { success: false, message: '' } });
	let nickname = screen.getByPlaceholderText('Nickname');
	let password = screen.getByPlaceholderText('Passwort');
	let submit = screen.getByRole('button', { name: 'Los gehts!' });
	expect(submit).toBeDefined();
});
