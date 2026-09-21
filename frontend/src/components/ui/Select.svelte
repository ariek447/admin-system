<script>
  // <select> nativo con el estilo de Input3D: mantiene teclado, lectores de pantalla y móvil.
  let { label, value = $bindable(), options, disabled = false, hint = '' } = $props();

  const uid = $props.id();
</script>

<div class="field" class:disabled>
  <select id={uid} bind:value {disabled} aria-describedby={hint ? `${uid}-hint` : undefined}>
    {#each options as option}
      <option value={option.value}>{option.label}</option>
    {/each}
  </select>
  <label for={uid}>{label}</label>
  <svg class="chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="m6 9 6 6 6-6" />
  </svg>
  {#if hint}
    <p id="{uid}-hint" class="hint">{hint}</p>
  {/if}
</div>

<style>
  .field {
    position: relative;
  }

  select {
    width: 100%;
    appearance: none;
    -webkit-appearance: none;
    padding: 1.35rem 2.5rem 0.55rem 1rem;
    background: rgb(255 255 255 / 0.04);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    outline: none;
    cursor: pointer;
    transition:
      border-color 0.25s,
      background 0.25s,
      box-shadow 0.35s var(--ease);
  }

  select:hover:not(:disabled) {
    background: rgb(255 255 255 / 0.06);
  }

  select:focus {
    border-color: rgb(139 92 246 / 0.7);
    background: rgb(255 255 255 / 0.07);
    box-shadow:
      0 0 0 4px rgb(139 92 246 / 0.15),
      0 8px 30px -8px rgb(139 92 246 / 0.5);
  }

  /* Los desplegables nativos no heredan el fondo translúcido */
  option {
    background: #12142a;
    color: var(--text);
  }

  /* El select siempre tiene valor: la etiqueta va siempre arriba */
  label {
    position: absolute;
    left: 1rem;
    top: 0.95rem;
    color: var(--muted);
    font-size: 0.95rem;
    pointer-events: none;
    transform-origin: left top;
    transform: translateY(-0.6rem) scale(0.75);
  }

  select:focus + label {
    color: var(--accent-2);
  }

  .chevron {
    position: absolute;
    right: 1rem;
    top: 50%;
    translate: 0 -50%;
    color: var(--muted);
    pointer-events: none;
  }

  .disabled select {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .hint {
    margin: 0.4rem 0.25rem 0;
    font-size: 0.8rem;
    color: var(--muted);
  }
</style>
