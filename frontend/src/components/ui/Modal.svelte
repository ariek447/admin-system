<script>
  import { onMount } from 'svelte';
  import { fade, scale } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import Icon from './Icon.svelte';

  // `busy` impide cerrar (ESC, clic fuera, botón X) mientras hay una petición en curso.
  let { title, onclose, busy = false, children } = $props();

  const uid = $props.id();
  const FOCUSABLE =
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  let panel;

  onMount(() => {
    const previous = document.activeElement;
    // Foco inicial: el elemento marcado con data-autofocus o, si no, el primer control del modal.
    const target = panel.querySelector('[data-autofocus]') ?? panel.querySelector(FOCUSABLE);
    (target ?? panel).focus();
    return () => previous?.focus?.();
  });

  function onkeydown(event) {
    if (event.key === 'Escape') {
      if (!busy) onclose();
      return;
    }
    if (event.key !== 'Tab') return;

    // Foco atrapado: Tab y Shift+Tab dan la vuelta dentro del modal.
    const items = [...panel.querySelectorAll(FOCUSABLE)];
    if (!items.length) {
      event.preventDefault();
      return;
    }
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  // mousedown (no click): así arrastrar para seleccionar texto y soltar fuera no cierra el modal.
  function onBackdrop(event) {
    if (event.target === event.currentTarget && !busy) onclose();
  }
</script>

<svelte:window {onkeydown} />

<div class="backdrop" role="presentation" onmousedown={onBackdrop} transition:fade|global={{ duration: 200 }}>
  <div
    class="panel glass"
    role="dialog"
    aria-modal="true"
    aria-labelledby="{uid}-title"
    tabindex="-1"
    bind:this={panel}
    transition:scale|global={{ start: 0.82, duration: 280, easing: cubicOut }}
  >
    <header>
      <h2 id="{uid}-title">{title}</h2>
      <button type="button" class="icon-btn" aria-label="Cerrar" disabled={busy} onclick={onclose}>
        <Icon name="x" />
      </button>
    </header>
    {@render children?.()}
  </div>
</div>

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    z-index: var(--z-modal);
    display: grid;
    place-items: center;
    padding: 1.25rem;
    overflow-y: auto;
    background: rgb(3 4 10 / 0.68);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
  }

  .panel {
    width: min(480px, 100%);
    padding: 1.5rem 1.6rem 1.4rem;
    border-radius: var(--radius);
    background: var(--surface-strong);
    outline: none;
  }

  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1.1rem;
  }

  h2 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 650;
    letter-spacing: -0.01em;
  }
</style>
