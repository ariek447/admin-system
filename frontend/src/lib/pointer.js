// Posición del ratón normalizada (-1 a 1, y positivo hacia arriba) y suavizada.
// La leen la cámara 3D (cada frame) y el CSS de la tarjeta (variables --px / --py).
export const pointer = { x: 0, y: 0 };

export const reducedMotion =
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

const SMOOTHING = 0.06;

export function startPointer() {
  if (reducedMotion) return () => {};

  const root = document.documentElement;
  let targetX = 0;
  let targetY = 0;
  let frame;

  const onMove = (e) => {
    targetX = (e.clientX / window.innerWidth) * 2 - 1;
    targetY = -((e.clientY / window.innerHeight) * 2 - 1);
  };
  const onLeave = () => {
    targetX = 0;
    targetY = 0;
  };

  const tick = () => {
    pointer.x += (targetX - pointer.x) * SMOOTHING;
    pointer.y += (targetY - pointer.y) * SMOOTHING;
    root.style.setProperty('--px', pointer.x.toFixed(4));
    root.style.setProperty('--py', pointer.y.toFixed(4));
    frame = requestAnimationFrame(tick);
  };

  window.addEventListener('pointermove', onMove);
  document.addEventListener('pointerleave', onLeave);
  frame = requestAnimationFrame(tick);

  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener('pointermove', onMove);
    document.removeEventListener('pointerleave', onLeave);
  };
}
