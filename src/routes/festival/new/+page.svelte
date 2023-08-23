<script>
  export let data;
</script>

{#if data?.error}
  <p class="error">Festival invalid</p>
{/if}

<h1>Neu anlegen</h1>
<form method="POST">
  <label>
    Name
    <input name="name" autocomplete="off" required value={data?.name ?? ''} />
  </label>

  <div>
    <label>
      Beschreibung
      <textarea name="description" />
    </label>
  </div>

  <button type="submit">Ok</button>
</form>
