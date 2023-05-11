<script>
  import { authorized } from "$lib/stores/authorized-store.ts";

  async function logout() {
    await fetch("/logout", {
      method: "POST"
    });
    authorized.set(false);
  }
</script>

<nav>
  {#if $authorized}
    <a href="/">Home</a>
    <a href="/settings">Settings</a>
    <a href="/about">About</a>
    <button on:click|trusted={logout}>Logout</button>
  {:else}
    <a href="/login">Login</a>
    <a href="/registration">Registration</a>
  {/if}
</nav>

<slot />
