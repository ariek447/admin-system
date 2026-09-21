<script>
  import { onMount, untrack } from 'svelte';
  import Icon from './Icon.svelte';
  import { dismissToast } from '../../lib/toast.svelte.js';

  let { toast } = $props();

  const ICONS = { success: 'check', error: 'alert', warning: 'alert', info: 'info' };

  // Temporizador con pausa: al pasar el ratón se detiene y conserva el tiempo restante.
  let remaining = untrack(() => toast.duration);
  let startedAt = 0;
  let timer;
  let paused = $state(false);

  const start = () => {
    startedAt = Date.now();
    timer = setTimeout(() => dismissToast(toast.id), remaining);
  };
  const pause = () => {
    clearTimeout(timer);
    remaining -= Date.now() - startedAt;
    paused = true;
  };
  const resume = () => {
    paused = false;
    start();
  };

  onMount(() => {
    start();
    return () => clearTimeout(timer);
  });
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
  class="toast {toast.type}"
  role={toast.type === 'error' ? 'alert' : 'status'}
  onmouseenter={pause}
  onmouseleave={resume}
  onfocusin={pause}
  onfocusout={resume}
>
  <span class="icon"><Icon name={ICONS[toast.type]} size={20} /></span>
  <p>{toast.message}</p>
  <button type="button" class="icon-btn" aria-label="Cerrar notificación" onclick={() => dismissToast(toast.id)}>
    <Icon name="x" size={16} />
  </button>
  <span
    class="bar"
    class:paused
    style="--duration: {toast.duration}ms"
    aria-hidden="true"
  ></span>
</div>

<style>
  .toast {
    --tone: var(--accent);
    position: relative;
    display: flex;
    align-items: flex-start;
    gap: 0.7rem;
    width: min(380px, calc(100vw - 2rem));
    padding: 0.85rem 0.7rem 0.95rem 1rem;
    overflow: hidden;
    border-radius: var(--radius-md);
    border: 1px solid color-mix(in srgb, var(--tone) 40%, transparent);
    background: color-mix(in srgb, var(--tone) 12%, rgb(14 16 30 / 0.92));
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    box-shadow:
      0 18px 40px -14px rgb(0 0 0 / 0.7),
      0 0 30px -14px var(--tone);
  }

  .success {
    --tone: var(--accent-2);
  }
  .info {
    --tone: var(--accent);
  }
  .warning {
    --tone: var(--warning);
  }
  .error {
    --tone: var(--danger);
  }

  .icon {
    margin-top: 1px;
    color: var(--tone);
  }

  p {
    flex: 1;
    margin: 0.1rem 0 0;
    font-size: 0.92rem;
    line-height: 1.4;
  }

  .icon-btn {
    width: 28px;
    height: 28px;
  }

  /* Barra de tiempo restante; se detiene con el temporizador */
  .bar {
    position: absolute;
    left: 0;
    bottom: 0;
    height: 3px;
    width: 100%;
    background: var(--tone);
    opacity: 0.8;
    transform-origin: left;
    animation: drain var(--duration) linear forwards;
  }

  .bar.paused {
    animation-play-state: paused;
  }

  @keyframes drain {
    to {
      transform: scaleX(0);
    }
  }
</style>
