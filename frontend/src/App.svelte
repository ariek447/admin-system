<script>
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { cubicIn } from 'svelte/easing';
  import Scene from './components/scene/Scene.svelte';
  import Login from './components/login/Login.svelte';
  import DashboardLayout from './components/layout/DashboardLayout.svelte';
  import Toaster from './components/ui/Toaster.svelte';
  import { auth, init } from './lib/auth.svelte.js';
  import { startPointer } from './lib/pointer.js';

  onMount(() => {
    init();
    return startPointer();
  });

  // Salida del login: la tarjeta se acerca a la cámara, se desenfoca y se desvanece.
  function warp(node, { duration = 650 } = {}) {
    return {
      duration,
      easing: cubicIn,
      css: (t, u) => `opacity: ${t}; transform: scale(${1 + u * 0.25}); filter: blur(${u * 10}px);`,
    };
  }
</script>

<!-- La escena vive siempre: solo cambia la capa de interfaz que hay encima.
     Con la sesión iniciada se atenúa para no competir con el contenido del panel. -->
<Scene subtle={auth.status === 'authenticated'} />

{#if auth.status === 'anonymous'}
  <div class="layer" out:warp>
    <Login />
  </div>
{:else if auth.status === 'authenticated'}
  <div class="layer" in:fade={{ duration: 800, delay: 450 }}>
    <DashboardLayout />
  </div>
{/if}

<Toaster />

<style>
  .layer {
    position: absolute;
    inset: 0;
    z-index: var(--z-ui);
    pointer-events: auto;
  }
</style>
