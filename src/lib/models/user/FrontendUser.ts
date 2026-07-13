import type { BaseUser } from '$lib/models/user/BaseUser';

// Seit dem Entfernen der E-Mail aus BaseUser (v0.7.12) trägt FrontendUser keine
// eigenen Felder mehr. Der Name bleibt als semantische Rolle erhalten (siehe CLAUDE.md:
// Trennung FrontendUser/BackendUser/CurrentUser), daher Alias statt leerem Interface.
export type FrontendUser = BaseUser;
