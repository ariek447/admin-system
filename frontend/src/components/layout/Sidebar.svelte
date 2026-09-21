<script>
  import Icon from '../ui/Icon.svelte';
  import Avatar from '../ui/Avatar.svelte';
  import { auth, logout } from '../../lib/auth.svelte.js';
  import { view, setView } from '../../lib/view.svelte.js';

  const isAdmin = $derived(auth.user?.role === 'admin');
</script>

<aside class="sidebar glass">
  <div class="brand">
    <span class="mark" aria-hidden="true"></span>
    <span class="brand-name">Admin System</span>
  </div>

  <nav aria-label="Navegación principal">
    {#if isAdmin}
      <button
        type="button"
        class="nav"
        class:active={view.current === 'users'}
        aria-current={view.current === 'users' ? 'page' : undefined}
        onclick={() => setView('users')}
      >
        <Icon name="users" />
        <span class="label">Usuarios</span>
      </button>
    {/if}
    <button
      type="button"
      class="nav"
      class:active={view.current === 'profile'}
      aria-current={view.current === 'profile' ? 'page' : undefined}
      onclick={() => setView('profile')}
    >
      <Icon name="user" />
      <span class="label">Perfil</span>
    </button>
  </nav>

  <div class="bottom">
    {#if auth.user}
      <div class="me">
        <Avatar name={auth.user.name} email={auth.user.email} size={34} />
        <div class="me-text">
          <span class="me-name">{auth.user.name}</span>
          <span class="me-email">{auth.user.email}</span>
        </div>
      </div>
    {/if}
    <button type="button" class="nav logout" onclick={logout}>
      <Icon name="logout" />
      <span class="label">Cerrar sesión</span>
    </button>
  </div>
</aside>

<style>
  .sidebar {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding: 1.25rem 0.9rem;
    border-radius: 0;
    border-width: 0 1px 0 0;
    box-shadow: none;
    background: rgb(10 11 22 / 0.6);
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    padding: 0 0.5rem;
  }

  .mark {
    width: 30px;
    height: 30px;
    border-radius: 10px;
    background: conic-gradient(from 210deg, var(--accent), var(--accent-2), var(--accent));
    box-shadow: 0 6px 20px -6px rgb(139 92 246 / 0.7);
  }

  .brand-name {
    font-weight: 650;
    letter-spacing: -0.01em;
  }

  nav {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  .nav {
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    padding: 0.7rem 0.8rem;
    border: 0;
    border-radius: var(--radius-md);
    background: none;
    color: var(--muted);
    text-align: left;
    cursor: pointer;
    transition:
      background 0.2s,
      color 0.2s;
  }

  .nav:hover {
    background: rgb(255 255 255 / 0.06);
    color: var(--text);
  }

  .nav:focus-visible {
    outline: 2px solid var(--accent-2);
    outline-offset: 2px;
  }

  .nav.active {
    color: var(--text);
    background: rgb(139 92 246 / 0.16);
  }

  /* Indicador de la vista activa */
  .nav.active::before {
    content: '';
    position: absolute;
    left: 0;
    top: 22%;
    bottom: 22%;
    width: 3px;
    border-radius: 3px;
    background: var(--accent-gradient);
    animation: indicator 0.35s var(--ease);
  }

  @keyframes indicator {
    from {
      transform: scaleY(0);
    }
  }

  .bottom {
    margin-top: auto;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .me {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    padding: 0.6rem 0.5rem;
    margin-bottom: 0.25rem;
    border-top: 1px solid var(--border);
    padding-top: 1rem;
  }

  .me-text {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .me-name {
    font-size: 0.9rem;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .me-email {
    font-size: 0.78rem;
    color: var(--muted);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .logout:hover {
    background: rgb(255 93 115 / 0.12);
    color: #ff8fa0;
  }

  /* En pantallas estrechas el sidebar se convierte en una barra superior */
  @media (max-width: 820px) {
    .sidebar {
      flex-direction: row;
      align-items: center;
      gap: 0.75rem;
      padding: 0.6rem 0.9rem;
      border-width: 0 0 1px 0;
    }

    .brand-name,
    .me,
    .label {
      display: none;
    }

    nav {
      flex-direction: row;
      margin-left: 0.25rem;
    }

    .nav {
      width: auto;
      padding: 0.6rem;
    }

    .nav.active::before {
      top: auto;
      left: 22%;
      right: 22%;
      bottom: 0;
      width: auto;
      height: 3px;
    }

    .bottom {
      margin: 0 0 0 auto;
      flex-direction: row;
    }
  }
</style>
