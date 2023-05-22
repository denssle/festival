// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
  namespace App {
    interface Locals {
      currentUser: {
        isAuthenticated: boolean;
        email: string
      };
    }

    // interface Error {}
    // interface PageData {}
    // interface Platform {}
  }
}

export {};
