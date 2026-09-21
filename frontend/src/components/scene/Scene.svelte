<script>
  import { Canvas, T } from '@threlte/core';
  import CameraRig from './CameraRig.svelte';
  import Particles from './Particles.svelte';
  import FloatingRig from './FloatingRig.svelte';

  // subtle: con la sesión iniciada la escena se atenúa y el parallax se suaviza.
  let { subtle = false } = $props();

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
</script>

<div class="scene" class:subtle aria-hidden="true">
  <Canvas {dpr}>
    <T.Color args={['#05060c']} attach="background" />
    <T.FogExp2 args={['#05060c', 0.045]} attach="fog" />

    <CameraRig {subtle} />

    <!-- Dos capas de partículas a distinta escala y velocidad dan sensación de profundidad -->
    <Particles count={1600} radius={9} size={0.07} color="#8b5cf6" speed={0.018} />
    <Particles count={900} radius={6} size={0.055} color="#22d3ee" speed={-0.028} />

    <FloatingRig />
  </Canvas>
  <div class="vignette"></div>
</div>

<style>
  .scene {
    position: fixed;
    inset: 0;
    z-index: var(--z-scene);
    /* El fondo es decorativo: nunca debe capturar clics (el ratón se lee desde window) */
    pointer-events: none;
  }

  .scene :global(canvas) {
    transition: opacity 1.4s ease;
  }

  .scene.subtle :global(canvas) {
    opacity: 0.38;
  }

  .vignette {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background:
      radial-gradient(ellipse 60% 50% at 50% 45%, rgb(139 92 246 / 0.14), transparent 70%),
      radial-gradient(ellipse at center, transparent 45%, rgb(5 6 12 / 0.85) 100%);
    transition: opacity 1.4s ease;
  }

  .scene.subtle .vignette {
    opacity: 0.6;
  }
</style>
