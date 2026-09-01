'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '../../lib/api';

type LoginResponse = {
  accessToken: string;

  user: {
    id: string;
    email: string;
  };
};

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] =
    useState('');

  const [password, setPassword] =
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
    setIsLoading(true);

    try {
      const response =
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
        response.accessToken,
      );

      localStorage.setItem(
        'user',
        JSON.stringify(response.user),
      );

      router.push('/dashboard');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível entrar.',
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

          <span>Finora</span>
        </div>

        <div className="showcase-content">
          <span className="eyebrow">
            Gestão inteligente
          </span>

          <h1>
            Transforme seus investimentos
            em decisões mais claras.
          </h1>

          <p>
            Organize sua carteira, acompanhe
            patrimônio e rentabilidade e
            simule seus próximos objetivos
            financeiros.
          </p>

          <div className="showcase-metrics">
            <div>
              <strong>360°</strong>
              <span>
                Visão da sua carteira
              </span>
            </div>

            <div>
              <strong>100%</strong>
              <span>
                Controle financeiro
              </span>
            </div>

            <div>
              <strong>24/7</strong>
              <span>
                Dados organizados
              </span>
            </div>
          </div>
        </div>

        <div className="showcase-card">
          <div>
            <span>
              Patrimônio projetado
            </span>

            <strong>
              R$ 287.420,80
            </strong>
          </div>

          <span className="positive">
            +12,8%
          </span>
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-form-wrapper">
          <div className="mobile-brand">
            <div className="brand-mark">
              F
            </div>

            <span>Finora</span>
          </div>

          <span className="eyebrow dark">
            Bem-vindo de volta
          </span>

          <h2>
            Entre na sua conta
          </h2>

          <p className="auth-description">
            Continue acompanhando seus
            investimentos e objetivos.
          </p>

          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >
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
                placeholder="Sua senha"
                autoComplete="current-password"
                required
              />
            </label>

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
                ? 'Entrando...'
                : 'Entrar'}
            </button>
          </form>

          <p className="auth-switch">
            Ainda não possui uma conta?{' '}
            <Link href="/cadastro">
              Criar conta
            </Link>
          </p>

          <p className="auth-footer">
            Projeto desenvolvido para
            gerenciamento e simulação de
            investimentos.
          </p>
        </div>
      </section>
    </main>
  );
}
