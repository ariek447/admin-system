<script>
  import { T, useTask } from '@threlte/core';
  import { Float } from '@threlte/extras';
  import { reducedMotion } from '../../lib/pointer.js';

  // Aros y poliedros a distintas profundidades: es lo que hace visible el parallax.
  const items = [
    { kind: 'ring', pos: [-4.2, 1.6, -3], r: 1.4, color: '#8b5cf6', spin: [0.25, 0.12] },
    { kind: 'ring', pos: [4.6, -1.4, -5], r: 2.1, color: '#22d3ee', spin: [-0.18, 0.2] },
    { kind: 'ring', pos: [0.6, 2.8, -8], r: 3, color: '#8b5cf6', spin: [0.1, -0.15] },
    { kind: 'poly', pos: [3.6, 2.2, -2], r: 0.55, color: '#22d3ee', spin: [0.3, 0.4] },
    { kind: 'poly', pos: [-3.4, -2.2, -1.5], r: 0.4, color: '#8b5cf6', spin: [-0.35, 0.25] },
  ];

  let group = $state();
  let meshes = $state([]);
  let elapsed = 0;

  const INTRO_SECONDS = 1.6;
  const easeOutBack = (t) => 1 + 2.70158 * Math.pow(t - 1, 3) + 1.70158 * Math.pow(t - 1, 2);

  useTask((delta) => {
    if (!group) return;
    elapsed += delta;

    group.scale.setScalar(Math.max(easeOutBack(Math.min(elapsed / INTRO_SECONDS, 1)), 0));

    if (reducedMotion) return;
    meshes.forEach((mesh, i) => {
      if (!mesh) return;
      mesh.rotation.x += delta * items[i].spin[0];
      mesh.rotation.y += delta * items[i].spin[1];
    });
  });
</script>

<T.Group bind:ref={group} scale={0}>
  {#each items as item, i}
    <Float
      floatIntensity={reducedMotion ? 0 : 1.2}
      rotationIntensity={0}
      speed={1 + i * 0.15}
      position={item.pos}
    >
      <T.Mesh bind:ref={meshes[i]}>
        {#if item.kind === 'ring'}
          <T.TorusGeometry args={[item.r, 0.012, 12, 120]} />
          <T.MeshBasicMaterial color={item.color} transparent opacity={0.55} />
        {:else}
          <T.IcosahedronGeometry args={[item.r, 0]} />
          <T.MeshBasicMaterial color={item.color} wireframe transparent opacity={0.6} />
        {/if}
      </T.Mesh>
    </Float>
  {/each}
</T.Group>
