<script>
  import { T, useTask } from '@threlte/core';
  import { AdditiveBlending, CanvasTexture } from 'three';
  import { reducedMotion } from '../../lib/pointer.js';

  // Sprite circular con borde suave; sin él, los puntos de WebGL se ven como cuadrados.
  const sprite = (() => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.4, 'rgba(255,255,255,0.6)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
    return new CanvasTexture(canvas);
  })();

  let {
    count = 1200,
    radius = 8,
    size = 0.03,
    color = '#8b5cf6',
    speed = 0.02, // radianes/segundo; el signo define el sentido de giro
  } = $props();

  // Distribución esférica hueca: evita que haya partículas pegadas a la cámara.
  const positions = (() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = radius * (0.35 + 0.65 * Math.cbrt(Math.random()));
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.7;
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  })();

  let points = $state();
  let material = $state();
  let elapsed = 0;

  const INTRO_SECONDS = 2.2;
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);

  useTask((delta) => {
    if (!points || !material) return;
    elapsed += delta;

    // Entrada: la nube crece desde 0 y aparece con fade.
    const intro = easeOut(Math.min(elapsed / INTRO_SECONDS, 1));
    points.scale.setScalar(intro);
    material.opacity = 0.85 * intro;

    if (!reducedMotion) {
      points.rotation.y += delta * speed;
      points.rotation.x = Math.sin(elapsed * 0.15) * 0.08;
    }
  });
</script>

<T.Points bind:ref={points}>
  <T.BufferGeometry>
    <T.BufferAttribute args={[positions, 3]} attach="attributes.position" />
  </T.BufferGeometry>
  <T.PointsMaterial
    bind:ref={material}
    {size}
    {color}
    map={sprite}
    alphaTest={0.01}
    transparent
    opacity={0}
    sizeAttenuation
    depthWrite={false}
    blending={AdditiveBlending}
  />
</T.Points>
