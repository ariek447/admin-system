<script>
  import { T, useTask } from '@threlte/core';
  import { pointer } from '../../lib/pointer.js';

  const RANGE_X = 0.8;
  const RANGE_Y = 0.5;
  const SUBTLE_FACTOR = 0.35;

  // subtle: parallax más leve cuando la escena queda de fondo del panel.
  let { subtle = false } = $props();

  let camera = $state();
  let factor = 1;

  useTask((delta) => {
    if (!camera) return;
    // El factor se acerca poco a poco al objetivo: el cambio no da un tirón.
    factor += ((subtle ? SUBTLE_FACTOR : 1) - factor) * Math.min(1, delta * 2.5);

    // El ratón ya llega suavizado desde pointer.js, así que se asigna directamente.
    camera.position.x = pointer.x * RANGE_X * factor;
    camera.position.y = pointer.y * RANGE_Y * factor;
    camera.lookAt(0, 0, 0);
  });
</script>

<T.PerspectiveCamera makeDefault fov={55} near={0.1} far={60} position={[0, 0, 7]} bind:ref={camera} />
