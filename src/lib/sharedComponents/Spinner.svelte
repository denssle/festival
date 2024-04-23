<script lang='ts'>
	export let size: number = 15;
</script>

<div class='loader' style='--size:{size};'></div>

<style>
    .loader {
        border: 1em solid var(--green);
        border-top: 1em solid var(--dark-green);
        border-radius: 50%;
        width: 15em;
        height: 15em;
        animation: spin 2s linear infinite;
    }

    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }
</style>
