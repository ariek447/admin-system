<script>
  import { onMount } from 'svelte';
  import { fly, fade } from 'svelte/transition';
  import Sidebar from './Sidebar.svelte';
  import ProfileView from '../profile/ProfileView.svelte';
  import { auth } from '../../lib/auth.svelte.js';
  import { view, resetView, setView } from '../../lib/view.svelte.js';

  const isAdmin = $derived(auth.user?.role === 'admin');

  // Al entrar: Usuarios para admins, Perfil para el resto.
  onMount(resetView);

  // Si el rol cambia mientras se usa el panel (te degradan), se abandona la vista de admin.
  $effect(() => {
    if (view.current === 'users' && !isAdmin) setView('profile');
  });

  // La vista de usuarios se descarga bajo demanda: un usuario normal nunca carga ese código.
  const loadUsersView = () => import('../users/UsersView.svelte');
</script>

<div class="shell">
  <Sidebar />

  <main>
    <div class="stack">
      {#key view.current}
        <div class="view" in:fly={{ y: 14, duration: 380, delay: 140 }} out:fade={{ duration: 140 }}>
          {#if view.current === 'users' && isAdmin}
            {#await loadUsersView() then module}
              <module.default />
            {/await}
          {:else}
            <ProfileView />
          {/if}
        </div>
      {/key}
    </div>
  </main>
</div>

<style>
  .shell {
    position: absolute;
    inset: 0;
    z-index: var(--z-ui);
    display: grid;
    grid-template-columns: 250px minmax(0, 1fr);
  }

  main {
    min-width: 0;
    overflow-y: auto;
    padding: 2rem clamp(1rem, 3vw, 2.5rem) 3rem;
  }

  /* Las dos vistas comparten celda durante la transición para que no salten */
  .stack {
    display: grid;
    max-width: 1100px;
    margin: 0 auto;
  }

  .view {
    grid-area: 1 / 1;
    min-width: 0;
  }

  @media (max-width: 820px) {
    .shell {
      grid-template-columns: minmax(0, 1fr);
      grid-template-rows: auto minmax(0, 1fr);
    }

    main {
      padding-top: 1.25rem;
    }
  }
</style>
