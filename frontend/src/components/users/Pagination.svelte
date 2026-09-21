<script>
  import Icon from '../ui/Icon.svelte';

  let { page, pageCount, from, to, total, disabled = false, onprev, onnext } = $props();
</script>

{#if total > 0}
  <nav class="pager" aria-label="Paginación">
    <span class="summary">{from}–{to} de {total}</span>
    <div class="buttons">
      <button
        type="button"
        class="icon-btn"
        aria-label="Página anterior"
        disabled={disabled || page <= 1}
        onclick={onprev}
      >
        <Icon name="chevron-left" />
      </button>
      <span class="page" aria-current="page">{page} / {pageCount}</span>
      <button
        type="button"
        class="icon-btn"
        aria-label="Página siguiente"
        disabled={disabled || page >= pageCount}
        onclick={onnext}
      >
        <Icon name="chevron-right" />
      </button>
    </div>
  </nav>
{/if}

<style>
  .pager {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.9rem 0.25rem 0;
    color: var(--muted);
    font-size: 0.88rem;
  }

  .buttons {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .page {
    min-width: 3.5rem;
    text-align: center;
    color: var(--text);
    font-variant-numeric: tabular-nums;
  }
</style>
