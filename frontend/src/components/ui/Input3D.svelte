<script>
  import { slide } from 'svelte/transition';

  let {
    label,
    type = 'text',
    value = $bindable(''),
    error = '',
    name,
    autocomplete,
    maxlength,
    onblur,
  } = $props();

  const uid = $props.id();
</script>

<div class="field" class:invalid={!!error}>
  <input
    id={uid}
    {type}
    {name}
    {autocomplete}
    {maxlength}
    bind:value
    placeholder=" "
    aria-invalid={!!error}
    aria-describedby={error ? `${uid}-error` : undefined}
    {onblur}
  />
  <label for={uid}>{label}</label>
  <span class="line"></span>

  {#if error}
    <p id="{uid}-error" class="error" transition:slide={{ duration: 200 }}>{error}</p>
  {/if}
</div>

<style>
  .field {
    position: relative;
  }

  input {
    width: 100%;
    padding: 1.35rem 1rem 0.55rem;
    background: rgb(255 255 255 / 0.04);
    border: 1px solid var(--border);
    border-radius: 14px;
    outline: none;
    transition:
      border-color 0.25s,
      background 0.25s,
      box-shadow 0.35s var(--ease);
  }

  input:hover {
    background: rgb(255 255 255 / 0.06);
  }

  input:focus {
    border-color: rgb(139 92 246 / 0.7);
    background: rgb(255 255 255 / 0.07);
    box-shadow:
      0 0 0 4px rgb(139 92 246 / 0.15),
      0 8px 30px -8px rgb(139 92 246 / 0.5);
  }

  label {
    position: absolute;
    left: 1rem;
    top: 0.95rem;
    color: var(--muted);
    font-size: 0.95rem;
    pointer-events: none;
    transform-origin: left top;
    transition:
      transform 0.3s var(--ease),
      color 0.25s;
  }

  /* La etiqueta sube cuando hay foco o contenido (el placeholder es un espacio) */
  input:focus + label,
  input:not(:placeholder-shown) + label {
    transform: translateY(-0.6rem) scale(0.75);
  }

  input:focus + label {
    color: var(--accent-2);
  }

  /* Línea de acento que se expande desde el centro al enfocar */
  .line {
    position: absolute;
    left: 14px;
    right: 14px;
    bottom: 0;
    height: 2px;
    border-radius: 2px;
    background: linear-gradient(90deg, var(--accent), var(--accent-2));
    transform: scaleX(0);
    transition: transform 0.45s var(--ease);
  }

  input:focus ~ .line {
    transform: scaleX(1);
  }

  .invalid input {
    border-color: rgb(255 93 115 / 0.7);
  }

  .invalid input:focus {
    box-shadow:
      0 0 0 4px rgb(255 93 115 / 0.15),
      0 8px 30px -8px rgb(255 93 115 / 0.5);
  }

  .invalid input:focus + label {
    color: var(--danger);
  }

  .error {
    margin: 0.4rem 0.25rem 0;
    font-size: 0.8rem;
    color: var(--danger);
  }
</style>
