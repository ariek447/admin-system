<script>
  import { onMount, onDestroy } from 'svelte';
  import UsersTable from './UsersTable.svelte';
  import Pagination from './Pagination.svelte';
  import UserFormModal from './UserFormModal.svelte';
  import DeleteUserModal from './DeleteUserModal.svelte';
  import Icon from '../ui/Icon.svelte';
  import { auth } from '../../lib/auth.svelte.js';
  import {
    users,
    fetchUsers,
    setSearch,
    nextPage,
    prevPage,
    pageInfo,
    resetUsers,
  } from '../../lib/users.svelte.js';

  // Modal abierto: null | { type: 'create' } | { type: 'edit', user } | { type: 'delete', user }
  let modal = $state(null);
  let text = $state('');

  const info = $derived(pageInfo());

  onMount(fetchUsers);
  onDestroy(resetUsers);

  const onSearch = (event) => {
    text = event.currentTarget.value;
    setSearch(text);
  };

  const clearSearch = () => {
    text = '';
    setSearch('');
  };
</script>

<section class="view">
  <header>
    <div class="title">
      <h1>Usuarios</h1>
      <p>{users.total} {users.total === 1 ? 'usuario' : 'usuarios'}{users.search.trim() ? ' encontrados' : ' en total'}</p>
    </div>

    <div class="tools">
      <div class="search">
        <Icon name="search" size={16} />
        <input
          type="search"
          placeholder="Buscar por nombre o email"
          aria-label="Buscar usuarios"
          autocomplete="off"
          value={text}
          oninput={onSearch}
        />
        {#if text}
          <button type="button" class="icon-btn clear" aria-label="Limpiar búsqueda" onclick={clearSearch}>
            <Icon name="x" size={14} />
          </button>
        {/if}
      </div>

      <button type="button" class="btn btn-primary" onclick={() => (modal = { type: 'create' })}>
        <Icon name="plus" size={16} />
        Nuevo usuario
      </button>
    </div>
  </header>

  <UsersTable
    items={users.items}
    loading={users.loading}
    error={users.error}
    search={users.search}
    selfId={auth.user?.id}
    onedit={(user) => (modal = { type: 'edit', user })}
    ondelete={(user) => (modal = { type: 'delete', user })}
    onretry={fetchUsers}
  />

  <Pagination
    page={info.page}
    pageCount={info.pageCount}
    from={info.from}
    to={info.to}
    total={users.total}
    disabled={users.loading}
    onprev={prevPage}
    onnext={nextPage}
  />
</section>

{#if modal?.type === 'create'}
  <UserFormModal mode="create" onclose={() => (modal = null)} />
{:else if modal?.type === 'edit'}
  <UserFormModal mode="edit" user={modal.user} onclose={() => (modal = null)} />
{:else if modal?.type === 'delete'}
  <DeleteUserModal user={modal.user} onclose={() => (modal = null)} />
{/if}

<style>
  .view {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 1rem;
  }

  h1 {
    margin: 0;
    font-size: 1.7rem;
    font-weight: 650;
    letter-spacing: -0.02em;
  }

  .title p {
    margin: 0.25rem 0 0;
    color: var(--muted);
    font-size: 0.92rem;
  }

  .tools {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .search {
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 280px;
    max-width: 100%;
    padding: 0 0.5rem 0 0.85rem;
    border-radius: var(--radius-md);
    border: 1px solid var(--border);
    background: rgb(255 255 255 / 0.04);
    color: var(--muted);
    transition:
      border-color 0.25s,
      box-shadow 0.35s var(--ease),
      background 0.25s;
  }

  .search:focus-within {
    border-color: rgb(139 92 246 / 0.7);
    background: rgb(255 255 255 / 0.07);
    box-shadow: 0 0 0 4px rgb(139 92 246 / 0.15);
    color: var(--accent-2);
  }

  input {
    flex: 1;
    min-width: 0;
    padding: 0.7rem 0;
    border: 0;
    outline: 0;
    background: none;
    color: var(--text);
  }

  input::placeholder {
    color: var(--muted);
  }

  /* Oculta la "x" nativa de type=search: hay un botón propio */
  input::-webkit-search-cancel-button {
    display: none;
  }

  .clear {
    width: 26px;
    height: 26px;
  }

  @media (max-width: 600px) {
    .tools,
    .search {
      width: 100%;
    }
  }
</style>
