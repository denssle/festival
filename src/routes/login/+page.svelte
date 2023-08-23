<script>
  import EmailPasswordForm from "$lib/components/EmailPasswordForm.svelte";

  export let data;
  console.log("login data", data);
</script>

<EmailPasswordForm {data} headline={'Login'} />
