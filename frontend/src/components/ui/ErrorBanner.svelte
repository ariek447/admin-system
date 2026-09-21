<script>
  import { slide, fade } from 'svelte/transition';

  // `id` cambia en cada fallo: así la sacudida se repite aunque el mensaje sea el mismo.
  let { error = null } = $props();
</script>

{#if error}
  {#key error.id}
    <div class="banner" role="alert" transition:slide={{ duration: 250 }}>
      <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
        <path
          fill="currentColor"
          d="M10 1.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17Zm-.9 4.5h1.8v5.2H9.1V6Zm0 6.8h1.8v1.8H9.1v-1.8Z"
        />
      </svg>
      <span in:fade={{ duration: 300 }}>{error.message}</span>
    </div>
  {/key}
{/if}

<style>
  .banner {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.75rem 1rem;
    border-radius: 12px;
    border: 1px solid rgb(255 93 115 / 0.4);
    background: rgb(255 93 115 / 0.12);
    color: #ffb3bf;
    font-size: 0.9rem;
    animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
  }

  svg {
    flex: none;
    color: var(--danger);
  }

  @keyframes shake {
    10%,
    90% {
      transform: translateX(-1px);
    }
    20%,
    80% {
      transform: translateX(3px);
    }
    30%,
    50%,
    70% {
      transform: translateX(-6px);
    }
    40%,
    60% {
      transform: translateX(6px);
    }
  }
</style>
