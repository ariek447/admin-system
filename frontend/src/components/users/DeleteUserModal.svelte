<script>
  import Modal from '../ui/Modal.svelte';
  import ErrorBanner from '../ui/ErrorBanner.svelte';
  import Avatar from '../ui/Avatar.svelte';
  import { deleteUser, fetchUsers } from '../../lib/users.svelte.js';
  import { toast } from '../../lib/toast.svelte.js';

  let { user, onclose } = $props();

  let busy = $state(false);
  let serverError = $state(null);
  let errorSeq = 0;

  async function confirmDelete() {
    if (busy) return;
    busy = true;
    serverError = null;

    try {
      await deleteUser(user);
      toast.success(`Usuario ${user.name} eliminado`);
      onclose();
    } catch (err) {
      if (err.status === 401) return; // sesión caducada: el manejador global se encarga
      if (err.status === 404) {
        // Otro admin ya lo eliminó: se sincroniza la lista y se cierra.
        fetchUsers();
        toast.warning(`${user.name} ya no existe`);
        onclose();
        return;
      }
      // Incluye el 409 de "último administrador": el modal sigue abierto mostrando el motivo.
      serverError = { id: ++errorSeq, message: err.message };
    } finally {
      busy = false;
    }
  }
</script>

<Modal title="Eliminar usuario" {onclose} {busy}>
  <div class="body">
    <ErrorBanner error={serverError} />

    <div class="target">
      <Avatar name={user.name} email={user.email} size={44} />
      <div>
        <strong>{user.name}</strong>
        <span>{user.email}</span>
      </div>
    </div>

    <p>
      Vas a eliminar a <strong>{user.name}</strong>. Esta acción no se puede deshacer.
    </p>

    <footer>
      <button type="button" class="btn" data-autofocus disabled={busy} onclick={onclose}>
        Cancelar
      </button>
      <button type="button" class="btn btn-danger" disabled={busy} onclick={confirmDelete}>
        {#if busy}
          <span class="spinner" aria-hidden="true"></span>
          Eliminando…
        {:else}
          Eliminar
        {/if}
      </button>
    </footer>
  </div>
</Modal>

<style>
  .body {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .target {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    padding: 0.8rem 0.9rem;
    border-radius: var(--radius-md);
    border: 1px solid var(--border);
    background: rgb(255 255 255 / 0.04);
  }

  .target div {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .target span {
    color: var(--muted);
    font-size: 0.88rem;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  p {
    margin: 0;
    color: var(--muted);
    line-height: 1.5;
  }

  p strong {
    color: var(--text);
  }

  footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.6rem;
  }
</style>
