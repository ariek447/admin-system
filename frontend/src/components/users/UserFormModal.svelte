<script>
  import { untrack } from 'svelte';
  import Modal from '../ui/Modal.svelte';
  import Input3D from '../ui/Input3D.svelte';
  import Select from '../ui/Select.svelte';
  import ErrorBanner from '../ui/ErrorBanner.svelte';
  import { auth } from '../../lib/auth.svelte.js';
  import { createUser, updateUser } from '../../lib/users.svelte.js';
  import { toast } from '../../lib/toast.svelte.js';

  // Un solo formulario para crear (mode="create") y editar (mode="edit").
  let { mode = 'create', user = null, onclose } = $props();

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const ROLE_OPTIONS = [
    { value: 'user', label: 'Usuario' },
    { value: 'admin', label: 'Administrador' },
  ];

  // El modal se monta de nuevo cada vez que se abre: capturar los valores iniciales es lo buscado.
  const isEdit = untrack(() => mode === 'edit');
  const initial = untrack(() => user);
  const isSelf = isEdit && initial.id === auth.user?.id;

  let name = $state(initial?.name ?? '');
  let email = $state(initial?.email ?? '');
  let password = $state('');
  let role = $state(initial?.role ?? 'user');
  let touched = $state({ name: false, email: false, password: false });
  let busy = $state(false);
  let serverError = $state(null);
  let errorSeq = 0;

  const errors = $derived.by(() => {
    const e = {};
    if (!name.trim()) e.name = 'Ingresa el nombre';
    else if (name.trim().length > 100) e.name = 'Máximo 100 caracteres';
    if (!email.trim()) e.email = 'El email es requerido';
    else if (!EMAIL_RE.test(email.trim())) e.email = 'Email inválido';
    if (!isEdit) {
      if (!password) e.password = 'La contraseña es requerida';
      else if (password.length < 8) e.password = 'Mínimo 8 caracteres';
      else if (password.length > 72) e.password = 'Máximo 72 caracteres';
    }
    return e;
  });

  const shown = (field) => (touched[field] ? errors[field] : '');

  async function submit(event) {
    event.preventDefault();
    if (busy) return;

    touched = { name: true, email: true, password: true };
    serverError = null;
    if (Object.keys(errors).length) return;

    busy = true;
    try {
      if (isEdit) {
        await updateUser(initial, { name: name.trim(), email: email.trim(), role });
        toast.success('Cambios guardados');
      } else {
        await createUser({ name: name.trim(), email: email.trim(), password, role });
        toast.success(`Usuario ${name.trim()} creado`);
      }
      onclose();
    } catch (err) {
      // 401: el manejador global ya cerró la sesión y desmontó este modal.
      if (err.status === 401) return;
      serverError = { id: ++errorSeq, message: err.message };
    } finally {
      busy = false;
    }
  }
</script>

<Modal title={isEdit ? 'Editar usuario' : 'Nuevo usuario'} {onclose} {busy}>
  <form novalidate onsubmit={submit}>
    <ErrorBanner error={serverError} />

    <Input3D
      label="Nombre"
      name="name"
      autocomplete="off"
      maxlength={100}
      bind:value={name}
      error={shown('name')}
      onblur={() => (touched.name = true)}
    />
    <Input3D
      label="Email"
      type="email"
      name="email"
      autocomplete="off"
      bind:value={email}
      error={shown('email')}
      onblur={() => (touched.email = true)}
    />
    {#if !isEdit}
      <Input3D
        label="Contraseña"
        type="password"
        name="password"
        autocomplete="new-password"
        bind:value={password}
        error={shown('password')}
        onblur={() => (touched.password = true)}
      />
    {/if}
    <Select
      label="Rol"
      bind:value={role}
      options={ROLE_OPTIONS}
      disabled={isSelf}
      hint={isSelf ? 'No puedes cambiar tu propio rol.' : ''}
    />

    <footer>
      <button type="button" class="btn" disabled={busy} onclick={onclose}>Cancelar</button>
      <button type="submit" class="btn btn-primary" disabled={busy}>
        {#if busy}
          <span class="spinner" aria-hidden="true"></span>
          {isEdit ? 'Guardando…' : 'Creando…'}
        {:else}
          {isEdit ? 'Guardar cambios' : 'Crear usuario'}
        {/if}
      </button>
    </footer>
  </form>
</Modal>

<style>
  form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.6rem;
    margin-top: 0.4rem;
  }
</style>
