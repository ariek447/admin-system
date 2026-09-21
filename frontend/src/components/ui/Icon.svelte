<script>
  let { name, size = 18 } = $props();

  // Iconos de trazo (24x24), con el estilo de Lucide/Feather.
  const ICONS = {
    plus: ['M12 5v14', 'M5 12h14'],
    search: ['M4 11a7 7 0 1 0 14 0a7 7 0 1 0-14 0', 'm21 21-4.3-4.3'],
    edit: ['M12 20h9', 'M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z'],
    trash: [
      'M3 6h18',
      'M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6',
      'M10 11v6',
      'M14 11v6',
      'M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2',
    ],
    users: [
      'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2',
      'M5 7a4 4 0 1 0 8 0a4 4 0 1 0-8 0',
      'M23 21v-2a4 4 0 0 0-3-3.87',
      'M16 3.13a4 4 0 0 1 0 7.75',
    ],
    user: ['M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2', 'M8 7a4 4 0 1 0 8 0a4 4 0 1 0-8 0'],
    logout: ['M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4', 'M16 17l5-5-5-5', 'M21 12H9'],
    x: ['M18 6 6 18', 'M6 6l12 12'],
    check: ['M20 6 9 17l-5-5'],
    alert: ['M2 12a10 10 0 1 0 20 0a10 10 0 1 0-20 0', 'M12 8v4', 'M12 16h.01'],
    info: ['M2 12a10 10 0 1 0 20 0a10 10 0 1 0-20 0', 'M12 16v-4', 'M12 8h.01'],
    'chevron-left': ['m15 18-6-6 6-6'],
    'chevron-right': ['m9 18 6-6-6-6'],
  };
</script>

<svg
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden="true"
>
  {#each ICONS[name] ?? [] as d}
    <path {d} />
  {/each}
</svg>

<style>
  svg {
    flex: none;
    display: block;
  }
</style>
