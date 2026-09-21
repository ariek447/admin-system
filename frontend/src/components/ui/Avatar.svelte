<script>
  import { initials, avatarColors } from '../../lib/format.js';

  let { name = '', email = '', size = 40 } = $props();

  const colors = $derived(avatarColors(email));
</script>

<span
  class="avatar"
  aria-hidden="true"
  style="--size: {size}px; --c1: {colors[0]}; --c2: {colors[1]}"
>
  {initials(name)}
</span>

<style>
  .avatar {
    flex: none;
    display: inline-grid;
    place-items: center;
    width: var(--size);
    height: var(--size);
    border-radius: 50%;
    background: linear-gradient(135deg, var(--c1), var(--c2));
    box-shadow:
      0 0 0 1px rgb(255 255 255 / 0.14) inset,
      0 6px 18px -6px var(--c1);
    color: #fff;
    font-weight: 600;
    font-size: calc(var(--size) * 0.38);
    letter-spacing: 0.02em;
    user-select: none;
  }
</style>
