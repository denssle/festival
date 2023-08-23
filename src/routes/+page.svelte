<script>
  export let data;
</script>

<h1>Home</h1>

<div>
  <p>Festivals:</p>
  {#each data.loadedEvents as loadedEvent}
    <div>
      <a href="/festival/{loadedEvent.id}">{loadedEvent.name}</a>
    </div>
  {/each}
</div>

<style></style>
