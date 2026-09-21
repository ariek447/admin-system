<script>
  import { ROLE_LABELS } from '../../lib/format.js';

  let { role } = $props();
</script>

<span class="badge {role}">{ROLE_LABELS[role] ?? role}</span>

<style>
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.2rem 0.65rem;
    border-radius: 999px;
    border: 1px solid;
    font-size: 0.78rem;
    font-weight: 500;
    white-space: nowrap;
  }

  .badge::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
    box-shadow: 0 0 8px currentColor;
  }

  .admin {
    color: #c4b5fd;
    background: rgb(139 92 246 / 0.16);
    border-color: rgb(139 92 246 / 0.4);
  }

  .user {
    color: #67e8f9;
    background: rgb(34 211 238 / 0.1);
    border-color: rgb(34 211 238 / 0.32);
  }
</style>
