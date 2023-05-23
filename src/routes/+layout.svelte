<script>
  import { authorized } from "$lib/stores/authorized-store.ts";

  async function logout() {
    await fetch("/logout", {
      method: "POST"
    });
  }

  export let data;
  authorized.set(data.currentUser?.isAuthenticated);
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

<style global>
    :global(:root) {
        --red: #D81E30;
        --green: #439E8F;
        --white: #FDF8E1;
        --orange: #FD904D;
    }

    :global(body) {
        color: var(--white);
        background-color: black;
    }

    :global(button) {
        width: 5vw;
        padding: 1%;
    }

    button.valid {
        background-color: var(--green);
    }

    nav {
        display: flex;
        justify-content: center;
        gap: 3vw;
    }
</style>