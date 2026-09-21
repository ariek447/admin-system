<script>
  import { flip } from 'svelte/animate';
  import { fly, fade } from 'svelte/transition';
  import Toast from './Toast.svelte';
  import { toasts } from '../../lib/toast.svelte.js';
</script>

<div class="toaster">
  {#each toasts as t (t.id)}
    <div
      class="slot"
      animate:flip={{ duration: 250 }}
      in:fly={{ x: 60, duration: 350 }}
      out:fade={{ duration: 180 }}
    >
      <Toast toast={t} />
    </div>
  {/each}
</div>

<style>
  .toaster {
    position: fixed;
    right: 1rem;
    bottom: 1rem;
    z-index: var(--z-toast);
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.6rem;
    pointer-events: none;
  }

  /* El contenedor deja pasar los clics; cada notificación los recibe */
  .slot {
    pointer-events: auto;
  }

  @media (max-width: 600px) {
    .toaster {
      left: 1rem;
      align-items: stretch;
    }
  }
</style>
