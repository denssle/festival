<script>
  export let data;
  export let headline;
</script>

<div id="form-container">
  <span>{headline}</span>

  <form method="POST">
    <label>
      Email
      <input name="email" required value={data?.email ?? ''} type="email" />
    </label>

    <label>
      Passwort
      <input name="password" required value={data?.password ?? ''} type="password" />
    </label>

    <button type="submit">Ok</button>
  </form>
</div>

<style>
    span {
        font-size: larger;
        text-decoration: underline var(--orange);
    }

    #form-container {
        border: solid thin var(--orange);
        padding: 2%;
        margin-top: 2%;
        margin-left: 25vw;
        margin-right: 25vw;
    }

    label {
        display: block;
        padding: 2%;
    }
</style>