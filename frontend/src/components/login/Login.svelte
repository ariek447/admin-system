<script>
  import { slide } from 'svelte/transition';
  import Input3D from '../ui/Input3D.svelte';
  import ErrorBanner from '../ui/ErrorBanner.svelte';
  import { login, register } from '../../lib/auth.svelte.js';

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  let mode = $state('login'); // 'login' | 'register'
  let name = $state('');
  let email = $state('');
  let password = $state('');
  let touched = $state({ name: false, email: false, password: false });
  let submitting = $state(false);
  let serverError = $state(null);
  let errorSeq = 0;

  const isRegister = $derived(mode === 'register');

  const errors = $derived.by(() => {
    const e = {};
    if (isRegister && !name.trim()) e.name = 'Ingresa tu nombre';
    if (!email.trim()) e.email = 'El email es requerido';
    else if (!EMAIL_RE.test(email.trim())) e.email = 'Email inválido';
    if (!password) e.password = 'La contraseña es requerida';
    else if (password.length < 8) e.password = 'Mínimo 8 caracteres';
    return e;
  });

  const shown = (field) => (touched[field] ? errors[field] : '');

  const toggleMode = () => {
    mode = isRegister ? 'login' : 'register';
    serverError = null;
    touched = { name: false, email: false, password: false };
  };

  async function submit(event) {
    event.preventDefault();
    if (submitting) return;

    touched = { name: true, email: true, password: true };
    serverError = null;
    if (Object.keys(errors).length) return;

    submitting = true;
    try {
      if (isRegister) await register(name.trim(), email.trim(), password);
      else await login(email.trim(), password);
      // Al autenticarse, App.svelte hace la transición hacia el dashboard.
    } catch (err) {
      serverError = { id: ++errorSeq, message: err.message };
      submitting = false;
    }
  }
</script>

<main class="stage">
  <div class="tilt">
    <div class="entrance">
      <form class="card" novalidate onsubmit={submit}>
        <span class="sheen" aria-hidden="true"></span>

        <header class="reveal" style="--i: 0">
          <div class="mark" aria-hidden="true"></div>
          <h1>{isRegister ? 'Crear cuenta' : 'Bienvenido'}</h1>
          <p>{isRegister ? 'Regístrate para acceder al sistema' : 'Inicia sesión para continuar'}</p>
        </header>

        <ErrorBanner error={serverError} />

        {#if isRegister}
          <div class="row" transition:slide={{ duration: 300 }}>
            <Input3D
              label="Nombre"
              name="name"
              autocomplete="name"
              maxlength={100}
              bind:value={name}
              error={shown('name')}
              onblur={() => (touched.name = true)}
            />
          </div>
        {/if}

        <div class="reveal row" style="--i: 2">
          <Input3D
            label="Email"
            type="email"
            name="email"
            autocomplete="email"
            bind:value={email}
            error={shown('email')}
            onblur={() => (touched.email = true)}
          />
        </div>

        <div class="reveal row" style="--i: 3">
          <Input3D
            label="Contraseña"
            type="password"
            name="password"
            autocomplete={isRegister ? 'new-password' : 'current-password'}
            bind:value={password}
            error={shown('password')}
            onblur={() => (touched.password = true)}
          />
        </div>

        <button class="reveal submit" style="--i: 4" type="submit" disabled={submitting}>
          {#if submitting}
            <span class="spinner" aria-hidden="true"></span>
            {isRegister ? 'Creando cuenta…' : 'Entrando…'}
          {:else}
            {isRegister ? 'Crear cuenta' : 'Iniciar sesión'}
          {/if}
        </button>

        <p class="reveal switch" style="--i: 5">
          {isRegister ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}
          <button type="button" class="link" onclick={toggleMode}>
            {isRegister ? 'Inicia sesión' : 'Crear cuenta'}
          </button>
        </p>
      </form>
    </div>
  </div>
</main>

<style>
  .stage {
    position: absolute;
    inset: 0;
    z-index: 1;
    display: grid;
    place-items: center;
    padding: 1.5rem;
    overflow-y: auto;
    perspective: 1100px;
  }

  /* Inclinación según el ratón (--px / --py llegan desde lib/pointer.js) */
  .tilt {
    transform: translate3d(calc(var(--px) * 10px), calc(var(--py) * -10px), 0)
      rotateY(calc(var(--px) * 7deg)) rotateX(calc(var(--py) * -5deg));
    will-change: transform;
  }

  /* Entrada: la tarjeta escala desde 0 */
  .entrance {
    animation: scale-in 1s var(--ease) backwards;
    animation-delay: 0.15s;
  }

  .card {
    position: relative;
    width: min(400px, calc(100vw - 3rem));
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 2.25rem 2rem 1.75rem;
    border-radius: var(--radius);
    border: 1px solid var(--border);
    background: var(--surface);
    backdrop-filter: blur(22px) saturate(140%);
    -webkit-backdrop-filter: blur(22px) saturate(140%);
    box-shadow:
      0 30px 80px -20px rgb(0 0 0 / 0.7),
      0 0 60px -20px rgb(139 92 246 / 0.35),
      inset 0 1px 0 rgb(255 255 255 / 0.08);
    /* Animación de flotación suave, independiente del parallax */
    animation: float 7s ease-in-out infinite;
  }

  /* Brillo que se desplaza con el ratón */
  .sheen {
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    background: radial-gradient(
      circle at calc(50% + var(--px) * 40%) calc(50% - var(--py) * 40%),
      rgb(255 255 255 / 0.09),
      transparent 55%
    );
  }

  header {
    text-align: center;
    margin-bottom: 0.4rem;
  }

  .mark {
    width: 44px;
    height: 44px;
    margin: 0 auto 1rem;
    border-radius: 14px;
    background: conic-gradient(from 210deg, var(--accent), var(--accent-2), var(--accent));
    box-shadow: 0 8px 30px -6px rgb(139 92 246 / 0.7);
    animation: spin-slow 12s linear infinite;
  }

  h1 {
    margin: 0;
    font-size: 1.6rem;
    font-weight: 650;
    letter-spacing: -0.02em;
  }

  header p {
    margin: 0.35rem 0 0;
    color: var(--muted);
    font-size: 0.92rem;
  }

  .row {
    display: block;
  }

  /* Cada bloque escala desde 0 con un pequeño retraso escalonado */
  .reveal {
    animation: scale-in 0.8s var(--ease) backwards;
    animation-delay: calc(0.45s + var(--i) * 0.09s);
  }

  .submit {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.6rem;
    margin-top: 0.4rem;
    padding: 0.9rem 1rem;
    border: 0;
    border-radius: 14px;
    font-weight: 600;
    cursor: pointer;
    background: linear-gradient(135deg, var(--accent), #6366f1 55%, var(--accent-2));
    background-size: 160% 160%;
    box-shadow: 0 12px 30px -10px rgb(139 92 246 / 0.8);
    transition:
      transform 0.25s var(--ease),
      box-shadow 0.25s,
      background-position 0.5s;
  }

  .submit:hover:not(:disabled) {
    transform: translateY(-2px);
    background-position: 100% 0;
    box-shadow: 0 18px 36px -10px rgb(139 92 246 / 0.9);
  }

  .submit:active:not(:disabled) {
    transform: translateY(0) scale(0.98);
  }

  .submit:disabled {
    cursor: progress;
    opacity: 0.8;
  }

  .submit:focus-visible,
  .link:focus-visible {
    outline: 2px solid var(--accent-2);
    outline-offset: 3px;
  }

  .spinner {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 2px solid rgb(255 255 255 / 0.35);
    border-top-color: #fff;
    animation: spin 0.7s linear infinite;
  }

  .switch {
    margin: 0.2rem 0 0;
    text-align: center;
    font-size: 0.88rem;
    color: var(--muted);
  }

  .link {
    padding: 0;
    border: 0;
    background: none;
    color: var(--accent-2);
    cursor: pointer;
    font-weight: 500;
  }

  .link:hover {
    text-decoration: underline;
  }

  @keyframes scale-in {
    from {
      opacity: 0;
      transform: scale(0);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes float {
    0%,
    100% {
      translate: 0 0;
    }
    50% {
      translate: 0 -8px;
    }
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes spin-slow {
    to {
      transform: rotate(360deg);
    }
  }
</style>
