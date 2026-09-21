<script>
  import Avatar from '../ui/Avatar.svelte';
  import RoleBadge from '../ui/RoleBadge.svelte';
  import Icon from '../ui/Icon.svelte';
  import { formatDate, formatDateTime } from '../../lib/format.js';

  let { items, loading, error, search, selfId, onedit, ondelete, onretry } = $props();

  const showSkeleton = $derived(loading && items.length === 0 && !error);
  const showEmpty = $derived(!loading && !error && items.length === 0);
</script>

<div class="wrap glass">
  {#if error}
    <div class="state" role="alert">
      <Icon name="alert" size={28} />
      <p>{error}</p>
      <button type="button" class="btn" onclick={onretry}>Reintentar</button>
    </div>
  {:else if showEmpty}
    <div class="state">
      <Icon name={search.trim() ? 'search' : 'users'} size={28} />
      {#if search.trim()}
        <p>Sin resultados para «{search.trim()}»</p>
        <span class="sub">Prueba con otro nombre o email.</span>
      {:else}
        <p>Todavía no hay usuarios</p>
      {/if}
    </div>
  {:else}
    <table class:dim={loading && items.length > 0} aria-busy={loading}>
      <thead>
        <tr>
          <th scope="col">Nombre</th>
          <th scope="col">Email</th>
          <th scope="col">Rol</th>
          <th scope="col">Creado</th>
          <th scope="col" class="actions-col"><span class="sr-only">Acciones</span></th>
        </tr>
      </thead>
      <tbody>
        {#if showSkeleton}
          {#each [0, 1, 2, 3, 4] as i (i)}
            <tr class="skeleton" style="--i: {i}" aria-hidden="true">
              <td colspan="5"><span class="bar"></span></td>
            </tr>
          {/each}
        {:else}
          {#each items as user, i (user.id)}
            {@const isSelf = user.id === selfId}
            <tr class="row" style="--i: {i}">
              <td data-label="Nombre">
                <div class="who">
                  <Avatar name={user.name} email={user.email} size={36} />
                  <span class="name">{user.name}</span>
                  {#if isSelf}<span class="you">tú</span>{/if}
                </div>
              </td>
              <td data-label="Email" class="email">{user.email}</td>
              <td data-label="Rol"><RoleBadge role={user.role} /></td>
              <td data-label="Creado" class="date" title={formatDateTime(user.created_at)}>
                {formatDate(user.created_at)}
              </td>
              <td class="actions">
                <button
                  type="button"
                  class="icon-btn"
                  aria-label="Editar a {user.name}"
                  title="Editar"
                  onclick={() => onedit(user)}
                >
                  <Icon name="edit" />
                </button>
                <button
                  type="button"
                  class="icon-btn danger"
                  aria-label="Eliminar a {user.name}"
                  title={isSelf ? 'No puedes eliminar tu propia cuenta' : 'Eliminar'}
                  disabled={isSelf}
                  onclick={() => ondelete(user)}
                >
                  <Icon name="trash" />
                </button>
              </td>
            </tr>
          {/each}
        {/if}
      </tbody>
    </table>
  {/if}
</div>

<style>
  .wrap {
    border-radius: var(--radius);
    overflow: hidden;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    transition: opacity 0.2s;
  }

  table.dim {
    opacity: 0.55;
  }

  th {
    padding: 0.85rem 1rem;
    text-align: left;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--muted);
    border-bottom: 1px solid var(--border);
  }

  td {
    padding: 0.7rem 1rem;
    border-bottom: 1px solid rgb(255 255 255 / 0.05);
    vertical-align: middle;
  }

  tbody tr:last-child td {
    border-bottom: 0;
  }

  /* Entrada escalonada de las filas */
  .row {
    animation: row-in 0.5s var(--ease) backwards;
    animation-delay: calc(var(--i) * 35ms);
    transition: background 0.2s;
  }

  .row:hover {
    background: rgb(255 255 255 / 0.04);
  }

  @keyframes row-in {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
  }

  .who {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    min-width: 0;
  }

  .name {
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .you {
    padding: 0.05rem 0.45rem;
    border-radius: 999px;
    font-size: 0.7rem;
    color: var(--accent-2);
    border: 1px solid rgb(34 211 238 / 0.35);
  }

  .email,
  .date {
    color: var(--muted);
    font-size: 0.92rem;
  }

  .actions-col {
    width: 1%;
  }

  .actions {
    white-space: nowrap;
    text-align: right;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  /* Esqueleto de carga */
  .skeleton td {
    padding: 0.9rem 1rem;
  }

  .bar {
    display: block;
    height: 36px;
    border-radius: 10px;
    background: linear-gradient(
      90deg,
      rgb(255 255 255 / 0.04),
      rgb(255 255 255 / 0.1),
      rgb(255 255 255 / 0.04)
    );
    background-size: 200% 100%;
    animation: shimmer 1.4s linear infinite;
    animation-delay: calc(var(--i) * 120ms);
  }

  @keyframes shimmer {
    to {
      background-position: -200% 0;
    }
  }

  /* Estados vacío y de error */
  .state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.6rem;
    padding: 3.5rem 1.5rem;
    text-align: center;
    color: var(--muted);
  }

  .state p {
    margin: 0;
    color: var(--text);
    font-weight: 500;
  }

  .sub {
    font-size: 0.9rem;
  }

  @media (max-width: 720px) {
    /* La tabla se apila en tarjetas */
    thead {
      display: none;
    }

    table,
    tbody,
    tr,
    td {
      display: block;
      width: 100%;
    }

    .row {
      padding: 0.8rem 1rem;
      border-bottom: 1px solid rgb(255 255 255 / 0.06);
    }

    td {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 0.3rem 0;
      border: 0;
    }

    td[data-label]::before {
      content: attr(data-label);
      font-size: 0.72rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--muted);
    }

    .actions {
      justify-content: flex-end;
    }
  }
</style>
