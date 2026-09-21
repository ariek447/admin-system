<script>
  import Avatar from '../ui/Avatar.svelte';
  import RoleBadge from '../ui/RoleBadge.svelte';
  import { auth } from '../../lib/auth.svelte.js';
  import { formatDateTime } from '../../lib/format.js';

  const user = $derived(auth.user);
</script>

{#if user}
  <section class="view">
    <h1>Perfil</h1>

    <div class="card glass">
      <div class="head">
        <Avatar name={user.name} email={user.email} size={84} />
        <div class="ident">
          <h2>{user.name}</h2>
          <p>{user.email}</p>
          <RoleBadge role={user.role} />
        </div>
      </div>

      <dl>
        <div>
          <dt>Nombre</dt>
          <dd>{user.name}</dd>
        </div>
        <div>
          <dt>Email</dt>
          <dd>{user.email}</dd>
        </div>
        <div>
          <dt>Rol</dt>
          <dd><RoleBadge role={user.role} /></dd>
        </div>
        <div>
          <dt>Miembro desde</dt>
          <dd>{formatDateTime(user.created_at)}</dd>
        </div>
      </dl>
    </div>
  </section>
{/if}

<style>
  .view {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    max-width: 640px;
  }

  h1 {
    margin: 0;
    font-size: 1.7rem;
    font-weight: 650;
    letter-spacing: -0.02em;
  }

  .card {
    padding: 1.75rem;
    border-radius: var(--radius);
  }

  .head {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    padding-bottom: 1.5rem;
    margin-bottom: 0.5rem;
    border-bottom: 1px solid var(--border);
  }

  .ident {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.35rem;
    min-width: 0;
  }

  h2 {
    margin: 0;
    font-size: 1.4rem;
    letter-spacing: -0.01em;
  }

  .ident p {
    margin: 0;
    color: var(--muted);
    overflow-wrap: anywhere;
  }

  dl {
    margin: 0;
  }

  dl > div {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.85rem 0;
    border-bottom: 1px solid rgb(255 255 255 / 0.05);
  }

  dl > div:last-child {
    border-bottom: 0;
  }

  dt {
    color: var(--muted);
    font-size: 0.9rem;
  }

  dd {
    margin: 0;
    text-align: right;
    overflow-wrap: anywhere;
  }

  @media (max-width: 480px) {
    .head {
      flex-direction: column;
      text-align: center;
    }

    .ident {
      align-items: center;
    }
  }
</style>
