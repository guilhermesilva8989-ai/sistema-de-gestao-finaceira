'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '../../lib/api';

type CreateUserResponse = {
  id: string;
  email: string;
};

type LoginResponse = {
  accessToken: string;

  user: {
    id: string;
    email: string;
  };
};

export default function CadastroPage() {
  const router = useRouter();

  const [name, setName] =
    useState('');

  const [email, setEmail] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [confirmPassword, setConfirmPassword] =
    useState('');

  const [error, setError] =
    useState('');

  const [isLoading, setIsLoading] =
    useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError('');

    if (password !== confirmPassword) {
      setError(
        'As senhas informadas não são iguais.',
      );

      return;
    }

    setIsLoading(true);

    try {
      await apiRequest<CreateUserResponse>(
        '/users',
        {
          method: 'POST',

          body: JSON.stringify({
            name,
            email,
            password,
          }),
        },
      );

      const loginResponse =
        await apiRequest<LoginResponse>(
          '/auth/login',
          {
            method: 'POST',

            body: JSON.stringify({
              email,
              password,
            }),
          },
        );

      localStorage.setItem(
        'accessToken',
        loginResponse.accessToken,
      );

      localStorage.setItem(
        'user',
        JSON.stringify(
          loginResponse.user,
        ),
      );

      router.push('/dashboard');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível criar sua conta.',
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-showcase">
        <div className="brand">
          <div className="brand-mark">
            F
          </div>

          <span>Financeira Rakisan</span>
        </div>

        <div className="showcase-content">
          <span className="eyebrow">
            Comece agora
          </span>

          <h1>
            Seu patrimônio merece mais
            organização e estratégia.
          </h1>

          <p>
            Centralize investimentos,
            acompanhe sua evolução e
            transforme objetivos financeiros
            em planos mensuráveis.
          </p>

          <div className="feature-stack">
            <div>
              <span>01</span>
              Gestão de carteiras
            </div>

            <div>
              <span>02</span>
              Indicadores e rentabilidade
            </div>

            <div>
              <span>03</span>
              Simulações financeiras
            </div>
          </div>
        </div>

        <div className="showcase-card">
          <div>
            <span>
              Meta financeira
            </span>

            <strong>
              R$ 500.000
            </strong>
          </div>

          <span className="positive">
            57%
          </span>
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-form-wrapper">
          <div className="mobile-brand">
            <div className="brand-mark">
              F
            </div>

            <span>Financeira Rakisan</span>
          </div>

          <span className="eyebrow dark">
            Crie sua conta
          </span>

          <h2>
            Comece sua jornada
          </h2>

          <p className="auth-description">
            Em poucos segundos você terá
            sua carteira principal criada.
          </p>

          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >
            <label>
              Nome

              <input
                type="text"
                value={name}
                onChange={(event) =>
                  setName(
                    event.target.value,
                  )
                }
                placeholder="Seu nome"
                autoComplete="name"
                required
              />
            </label>

            <label>
              Email

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value,
                  )
                }
                placeholder="seu@email.com"
                autoComplete="email"
                required
              />
            </label>

            <div className="form-grid">
              <label>
                Senha

                <input
                  type="password"
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value,
                    )
                  }
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
                  required
                />
              </label>

              <label>
                Confirmar senha

                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(
                      event.target.value,
                    )
                  }
                  placeholder="Repita sua senha"
                  autoComplete="new-password"
                  required
                />
              </label>
            </div>

            {error && (
              <div className="form-error">
                {error}
              </div>
            )}

            <button
              className="primary-button"
              type="submit"
              disabled={isLoading}
            >
              {isLoading
                ? 'Criando conta...'
                : 'Criar conta'}
            </button>
          </form>

          <p className="auth-switch">
            Já possui uma conta?{' '}
            <Link href="/login">
              Fazer login
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
