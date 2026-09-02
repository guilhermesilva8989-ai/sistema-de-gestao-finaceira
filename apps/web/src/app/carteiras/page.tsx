'use client';

import {
  FormEvent,
  useEffect,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import { AppSidebar } from '../../components/app-sidebar';
import { authenticatedApiRequest } from '../../lib/api';

type Portfolio = {
  id: string;
  name: string;

  description:
    | string
    | null;

  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export default function CarteirasPage() {
  const router = useRouter();

  const [portfolios, setPortfolios] =
    useState<Portfolio[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSaving, setIsSaving] =
    useState(false);

  const [error, setError] =
    useState('');

  const [showForm, setShowForm] =
    useState(false);

  const [editing, setEditing] =
    useState<Portfolio | null>(
      null,
    );

  const [name, setName] =
    useState('');

  const [description, setDescription] =
    useState('');

  useEffect(() => {
    void loadPortfolios();
  }, []);

  async function loadPortfolios() {
    try {
      const response =
        await authenticatedApiRequest<Portfolio[]>(
          '/portfolios',
        );

      setPortfolios(response);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Não foi possível carregar as carteiras.';

      if (
        message.includes('Sessão') ||
        message.includes('Token')
      ) {
        localStorage.removeItem(
          'accessToken',
        );

        router.replace('/login');

        return;
      }

      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setName('');
    setDescription('');
    setError('');
    setShowForm(true);
  }

  function openEdit(
    portfolio: Portfolio,
  ) {
    setEditing(portfolio);
    setName(portfolio.name);
    setDescription(
      portfolio.description ?? '',
    );
    setError('');
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
    setName('');
    setDescription('');
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError('');
    setIsSaving(true);

    try {
      if (editing) {
        await authenticatedApiRequest<Portfolio>(
          `/portfolios/${editing.id}`,
          {
            method: 'PATCH',

            body: JSON.stringify({
              name,
              description,
            }),
          },
        );
      } else {
        await authenticatedApiRequest<Portfolio>(
          '/portfolios',
          {
            method: 'POST',

            body: JSON.stringify({
              name,
              description,
            }),
          },
        );
      }

      closeForm();

      await loadPortfolios();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível salvar a carteira.',
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function setDefault(
    portfolio: Portfolio,
  ) {
    if (portfolio.isDefault) {
      return;
    }

    setError('');

    try {
      await authenticatedApiRequest<Portfolio>(
        `/portfolios/${portfolio.id}/default`,
        {
          method: 'PATCH',
        },
      );

      await loadPortfolios();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível alterar a carteira principal.',
      );
    }
  }

  async function removePortfolio(
    portfolio: Portfolio,
  ) {
    if (portfolio.isDefault) {
      setError(
        'A carteira principal não pode ser excluída.',
      );

      return;
    }

    const confirmed =
      window.confirm(
        `Deseja realmente excluir "${portfolio.name}"?`,
      );

    if (!confirmed) {
      return;
    }

    setError('');

    try {
      await authenticatedApiRequest<void>(
        `/portfolios/${portfolio.id}`,
        {
          method: 'DELETE',
        },
      );

      await loadPortfolios();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível excluir a carteira.',
      );
    }
  }

  return (
    <main className="dashboard-shell">
      <AppSidebar />

      <section className="min-w-0 px-6 py-8 lg:px-10 lg:py-9">
        <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="eyebrow dark">
              Gestão
            </span>

            <h1 className="text-3xl font-bold tracking-[-1px] text-[#101828]">
              Minhas carteiras
            </h1>

            <p className="mt-2 text-sm text-[#667085]">
              Organize seus investimentos em
              diferentes objetivos e estratégias.
            </p>
          </div>

          <button
            onClick={openCreate}
            className="rounded-xl bg-[#1D4ED8] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#1E40AF]"
          >
            + Nova carteira
          </button>
        </header>

        {error && (
          <div className="mb-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="mb-6 grid gap-4 sm:grid-cols-3">
          <article className="rounded-2xl border border-[#e4e7ec] bg-white p-5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#667085]">
              Total de carteiras
            </span>

            <strong className="mt-4 block text-3xl text-[#101828]">
              {portfolios.length}
            </strong>
          </article>

          <article className="rounded-2xl border border-[#e4e7ec] bg-white p-5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#667085]">
              Principal
            </span>

            <strong className="mt-4 block truncate text-lg text-[#101828]">
              {portfolios.find(
                (portfolio) =>
                  portfolio.isDefault,
              )?.name ?? '—'}
            </strong>
          </article>

          <article className="rounded-2xl border border-[#e4e7ec] bg-white p-5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#667085]">
              Patrimônio
            </span>

            <strong className="mt-4 block text-2xl text-[#1D4ED8]">
              R$ 0,00
            </strong>

            <small className="mt-1 block text-[#98a2b3]">
              Ativos serão adicionados no próximo módulo
            </small>
          </article>
        </section>

        <section className="overflow-hidden rounded-2xl border border-[#e4e7ec] bg-white">
          <div className="border-b border-[#e4e7ec] px-6 py-5">
            <h2 className="font-bold text-[#101828]">
              Carteiras cadastradas
            </h2>

            <p className="mt-1 text-sm text-[#667085]">
              Escolha onde seus investimentos serão organizados.
            </p>
          </div>

          {isLoading ? (
            <div className="flex min-h-60 items-center justify-center text-sm text-[#667085]">
              Carregando carteiras...
            </div>
          ) : portfolios.length === 0 ? (
            <div className="flex min-h-60 flex-col items-center justify-center px-6 text-center">
              <strong className="text-[#101828]">
                Nenhuma carteira cadastrada
              </strong>

              <p className="mt-2 text-sm text-[#667085]">
                Crie sua primeira carteira para começar.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#e4e7ec]">
              {portfolios.map(
                (portfolio) => (
                  <article
                    key={portfolio.id}
                    className="flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#DBEAFE] font-bold text-[#1D4ED8]">
                        C
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <strong className="truncate text-[#101828]">
                            {portfolio.name}
                          </strong>

                          {portfolio.isDefault && (
                            <span className="rounded-full bg-[#DBEAFE] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#1D4ED8]">
                              Principal
                            </span>
                          )}
                        </div>

                        <p className="mt-1 max-w-xl truncate text-sm text-[#667085]">
                          {portfolio.description ??
                            'Sem descrição'}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {!portfolio.isDefault && (
                        <button
                          onClick={() =>
                            void setDefault(
                              portfolio,
                            )
                          }
                          className="rounded-lg border border-[#d0d5dd] px-3 py-2 text-xs font-bold text-[#344054] hover:bg-[#f9fafb]"
                        >
                          Tornar principal
                        </button>
                      )}

                      <button
                        onClick={() =>
                          openEdit(
                            portfolio,
                          )
                        }
                        className="rounded-lg border border-[#d0d5dd] px-3 py-2 text-xs font-bold text-[#344054] hover:bg-[#f9fafb]"
                      >
                        Editar
                      </button>

                      <button
                        disabled={
                          portfolio.isDefault
                        }
                        onClick={() =>
                          void removePortfolio(
                            portfolio,
                          )
                        }
                        className="rounded-lg border border-red-100 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-35"
                      >
                        Excluir
                      </button>
                    </div>
                  </article>
                ),
              )}
            </div>
          )}
        </section>
      </section>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-6">
              <span className="eyebrow dark">
                {editing
                  ? 'Editar'
                  : 'Nova carteira'}
              </span>

              <h2 className="text-2xl font-bold tracking-[-0.7px] text-[#101828]">
                {editing
                  ? 'Editar carteira'
                  : 'Criar carteira'}
              </h2>

              <p className="mt-2 text-sm text-[#667085]">
                Use carteiras para separar objetivos ou estratégias.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <label className="block text-sm font-bold text-[#344054]">
                Nome

                <input
                  required
                  minLength={2}
                  maxLength={80}
                  value={name}
                  onChange={(event) =>
                    setName(
                      event.target.value,
                    )
                  }
                  placeholder="Ex.: Aposentadoria"
                  className="mt-2 h-12 w-full rounded-xl border border-[#d0d5dd] px-4 font-normal outline-none transition focus:border-[#1D4ED8] focus:ring-4 focus:ring-[#1D4ED8]/10"
                />
              </label>

              <label className="block text-sm font-bold text-[#344054]">
                Descrição

                <textarea
                  maxLength={240}
                  value={description}
                  onChange={(event) =>
                    setDescription(
                      event.target.value,
                    )
                  }
                  placeholder="Ex.: Investimentos de longo prazo para aposentadoria."
                  className="mt-2 min-h-28 w-full resize-none rounded-xl border border-[#d0d5dd] p-4 font-normal outline-none transition focus:border-[#1D4ED8] focus:ring-4 focus:ring-[#1D4ED8]/10"
                />
              </label>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-xl border border-[#d0d5dd] px-5 py-3 text-sm font-bold text-[#344054]"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-xl bg-[#1D4ED8] px-5 py-3 text-sm font-bold text-white hover:bg-[#1E40AF] disabled:opacity-60"
                >
                  {isSaving
                    ? 'Salvando...'
                    : editing
                      ? 'Salvar alterações'
                      : 'Criar carteira'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
