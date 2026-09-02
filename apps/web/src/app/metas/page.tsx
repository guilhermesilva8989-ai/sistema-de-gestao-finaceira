'use client';

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import { AppSidebar } from '../../components/app-sidebar';
import { authenticatedApiRequest } from '../../lib/api';

type Goal = {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  targetAmount: string | number;
  currentAmount: string | number;
  targetDate: string | null;
  createdAt: string;
  updatedAt: string;
};

type GoalForm = {
  name: string;
  description: string;
  targetAmount: string;
  currentAmount: string;
  targetDate: string;
};

const emptyForm: GoalForm = {
  name: '',
  description: '',
  targetAmount: '',
  currentAmount: '0',
  targetDate: '',
};

function numberValue(
  value: string | number,
) {
  return Number(value);
}

function currency(value: number) {
  return new Intl.NumberFormat(
    'pt-BR',
    {
      style: 'currency',
      currency: 'BRL',
    },
  ).format(value);
}

function formatDate(
  value: string | null,
) {
  if (!value) {
    return 'Sem prazo definido';
  }

  return new Intl.DateTimeFormat(
    'pt-BR',
  ).format(
    new Date(value),
  );
}

function inputDate(
  value: string | null,
) {
  if (!value) {
    return '';
  }

  const date =
    new Date(value);

  const year =
    date.getUTCFullYear();

  const month =
    String(
      date.getUTCMonth() + 1,
    ).padStart(2, '0');

  const day =
    String(
      date.getUTCDate(),
    ).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function goalProgress(
  currentAmount: number,
  targetAmount: number,
) {
  if (targetAmount <= 0) {
    return 0;
  }

  return Math.min(
    (currentAmount /
      targetAmount) *
      100,
    100,
  );
}

export default function MetasPage() {
  const router = useRouter();

  const [goals, setGoals] =
    useState<Goal[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSaving, setIsSaving] =
    useState(false);

  const [error, setError] =
    useState('');

  const [showForm, setShowForm] =
    useState(false);

  const [editingGoal, setEditingGoal] =
    useState<Goal | null>(null);

  const [form, setForm] =
    useState<GoalForm>(
      emptyForm,
    );

  useEffect(() => {
    void loadGoals();
  }, []);

  async function loadGoals() {
    try {
      setError('');

      const response =
        await authenticatedApiRequest<
          Goal[]
        >('/goals');

      setGoals(response);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Não foi possível carregar as metas.';

      setError(message);

      if (
        message.includes('Sessão') ||
        message.includes('Token')
      ) {
        localStorage.removeItem(
          'accessToken',
        );

        router.replace('/login');
      }
    } finally {
      setIsLoading(false);
    }
  }

  const summary =
    useMemo(() => {
      const totalTarget =
        goals.reduce(
          (
            total,
            goal,
          ) =>
            total +
            numberValue(
              goal.targetAmount,
            ),
          0,
        );

      const totalCurrent =
        goals.reduce(
          (
            total,
            goal,
          ) =>
            total +
            numberValue(
              goal.currentAmount,
            ),
          0,
        );

      const completed =
        goals.filter(
          (goal) =>
            numberValue(
              goal.currentAmount,
            ) >=
            numberValue(
              goal.targetAmount,
            ),
        ).length;

      const generalProgress =
        totalTarget > 0
          ? Math.min(
              (totalCurrent /
                totalTarget) *
                100,
              100,
            )
          : 0;

      return {
        totalTarget,
        totalCurrent,
        completed,
        generalProgress,
      };
    }, [goals]);

  function openCreate() {
    setEditingGoal(null);

    setForm({
      ...emptyForm,
    });

    setError('');
    setShowForm(true);
  }

  function openEdit(
    goal: Goal,
  ) {
    setEditingGoal(goal);

    setForm({
      name:
        goal.name,

      description:
        goal.description ?? '',

      targetAmount:
        String(
          goal.targetAmount,
        ),

      currentAmount:
        String(
          goal.currentAmount,
        ),

      targetDate:
        inputDate(
          goal.targetDate,
        ),
    });

    setError('');
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingGoal(null);

    setForm({
      ...emptyForm,
    });

    setError('');
  }

  function updateForm(
    field: keyof GoalForm,
    value: string,
  ) {
    setForm(
      (current) => ({
        ...current,
        [field]: value,
      }),
    );
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      Number(
        form.targetAmount,
      ) <= 0
    ) {
      setError(
        'O valor objetivo deve ser maior que zero.',
      );

      return;
    }

    if (
      Number(
        form.currentAmount,
      ) < 0
    ) {
      setError(
        'O valor atual não pode ser negativo.',
      );

      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const body = {
        name:
          form.name,

        description:
          form.description,

        targetAmount:
          Number(
            form.targetAmount,
          ),

        currentAmount:
          Number(
            form.currentAmount,
          ),

        targetDate:
          form.targetDate ||
          undefined,
      };

      if (editingGoal) {
        await authenticatedApiRequest(
          `/goals/${editingGoal.id}`,
          {
            method: 'PATCH',

            body:
              JSON.stringify(
                body,
              ),
          },
        );
      } else {
        await authenticatedApiRequest(
          '/goals',
          {
            method: 'POST',

            body:
              JSON.stringify(
                body,
              ),
          },
        );
      }

      closeForm();

      await loadGoals();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível salvar a meta.',
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function removeGoal(
    goal: Goal,
  ) {
    const confirmed =
      window.confirm(
        `Deseja realmente excluir a meta "${goal.name}"?`,
      );

    if (!confirmed) {
      return;
    }

    try {
      setError('');

      await authenticatedApiRequest(
        `/goals/${goal.id}`,
        {
          method: 'DELETE',
        },
      );

      await loadGoals();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível excluir a meta.',
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
              Planejamento
            </span>

            <h1 className="text-3xl font-bold tracking-[-1px]">
              Metas financeiras
            </h1>

            <p className="mt-2 text-sm text-[#667085]">
              Organize seus objetivos
              financeiros e acompanhe o
              progresso de cada meta.
            </p>
          </div>

          <button
            onClick={openCreate}
            className="rounded-xl bg-[#1D4ED8] px-5 py-3 text-sm font-bold text-white hover:bg-[#1E40AF]"
          >
            + Nova meta
          </button>
        </header>

        {error &&
          !showForm && (
            <div className="mb-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

        <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-[#e4e7ec] bg-white p-5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#667085]">
              Metas
            </span>

            <strong className="mt-4 block text-3xl">
              {goals.length}
            </strong>

            <p className="mt-2 text-xs text-[#98a2b3]">
              Objetivos cadastrados
            </p>
          </article>

          <article className="rounded-2xl border border-[#e4e7ec] bg-white p-5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#667085]">
              Valor acumulado
            </span>

            <strong className="mt-4 block text-xl text-[#1D4ED8]">
              {currency(
                summary.totalCurrent,
              )}
            </strong>

            <p className="mt-2 text-xs text-[#98a2b3]">
              Total já conquistado
            </p>
          </article>

          <article className="rounded-2xl border border-[#e4e7ec] bg-white p-5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#667085]">
              Objetivo total
            </span>

            <strong className="mt-4 block text-xl">
              {currency(
                summary.totalTarget,
              )}
            </strong>

            <p className="mt-2 text-xs text-[#98a2b3]">
              Soma de todas as metas
            </p>
          </article>

          <article className="rounded-2xl border border-[#e4e7ec] bg-white p-5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#667085]">
              Concluídas
            </span>

            <strong className="mt-4 block text-3xl text-[#1D4ED8]">
              {summary.completed}
            </strong>

            <p className="mt-2 text-xs text-[#98a2b3]">
              Metas alcançadas
            </p>
          </article>
        </section>

        <section className="mb-6 rounded-2xl border border-[#e4e7ec] bg-white p-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-bold">
                Progresso geral
              </h2>

              <p className="mt-1 text-sm text-[#667085]">
                Evolução considerando
                todas as suas metas.
              </p>
            </div>

            <strong className="text-2xl text-[#1D4ED8]">
              {summary.generalProgress.toFixed(
                1,
              )}
              %
            </strong>
          </div>

          <div className="mt-5 h-3 overflow-hidden rounded-full bg-[#edf2f0]">
            <div
              className="h-full rounded-full bg-[#1D4ED8] transition-all"
              style={{
                width: `${summary.generalProgress}%`,
              }}
            />
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-[#e4e7ec] bg-white">
          <div className="border-b border-[#e4e7ec] px-6 py-5">
            <h2 className="font-bold">
              Minhas metas
            </h2>

            <p className="mt-1 text-sm text-[#667085]">
              Acompanhe o avanço dos
              seus objetivos financeiros.
            </p>
          </div>

          {isLoading ? (
            <div className="flex min-h-64 items-center justify-center text-sm text-[#667085]">
              Carregando metas...
            </div>
          ) : goals.length ===
            0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#DBEAFE] text-xl font-bold text-[#1D4ED8]">
                $
              </div>

              <strong className="text-lg">
                Nenhuma meta cadastrada
              </strong>

              <p className="mt-2 max-w-md text-sm leading-6 text-[#667085]">
                Crie sua primeira meta
                financeira para acompanhar
                seu progresso.
              </p>

              <button
                onClick={openCreate}
                className="mt-5 rounded-xl bg-[#1D4ED8] px-5 py-3 text-sm font-bold text-white"
              >
                Criar primeira meta
              </button>
            </div>
          ) : (
            <div className="grid gap-0 divide-y divide-[#e4e7ec]">
              {goals.map(
                (goal) => {
                  const target =
                    numberValue(
                      goal.targetAmount,
                    );

                  const current =
                    numberValue(
                      goal.currentAmount,
                    );

                  const progress =
                    goalProgress(
                      current,
                      target,
                    );

                  const missing =
                    Math.max(
                      target -
                        current,
                      0,
                    );

                  const completed =
                    current >=
                    target;

                  return (
                    <article
                      key={goal.id}
                      className="p-6"
                    >
                      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-3">
                            <h3 className="text-lg font-bold">
                              {goal.name}
                            </h3>

                            {completed && (
                              <span className="rounded-full bg-[#DBEAFE] px-3 py-1 text-xs font-bold text-[#1D4ED8]">
                                Concluída
                              </span>
                            )}
                          </div>

                          <p className="mt-1 text-sm text-[#667085]">
                            {goal.description ||
                              'Sem descrição'}
                          </p>

                          <div className="mt-5">
                            <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                              <span className="text-[#667085]">
                                Progresso
                              </span>

                              <strong>
                                {progress.toFixed(
                                  1,
                                )}
                                %
                              </strong>
                            </div>

                            <div className="h-2.5 overflow-hidden rounded-full bg-[#edf2f0]">
                              <div
                                className="h-full rounded-full bg-[#1D4ED8]"
                                style={{
                                  width: `${progress}%`,
                                }}
                              />
                            </div>
                          </div>

                          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            <div>
                              <span className="block text-xs font-bold uppercase tracking-wider text-[#98a2b3]">
                                Atual
                              </span>

                              <strong className="mt-1 block text-[#1D4ED8]">
                                {currency(
                                  current,
                                )}
                              </strong>
                            </div>

                            <div>
                              <span className="block text-xs font-bold uppercase tracking-wider text-[#98a2b3]">
                                Objetivo
                              </span>

                              <strong className="mt-1 block">
                                {currency(
                                  target,
                                )}
                              </strong>
                            </div>

                            <div>
                              <span className="block text-xs font-bold uppercase tracking-wider text-[#98a2b3]">
                                Falta
                              </span>

                              <strong className="mt-1 block">
                                {currency(
                                  missing,
                                )}
                              </strong>
                            </div>

                            <div>
                              <span className="block text-xs font-bold uppercase tracking-wider text-[#98a2b3]">
                                Prazo
                              </span>

                              <strong className="mt-1 block">
                                {formatDate(
                                  goal.targetDate,
                                )}
                              </strong>
                            </div>
                          </div>
                        </div>

                        <div className="flex shrink-0 gap-3">
                          <button
                            onClick={() =>
                              openEdit(
                                goal,
                              )
                            }
                            className="rounded-xl border border-[#d0d5dd] px-4 py-2.5 text-sm font-bold hover:bg-[#f9fafb]"
                          >
                            Editar
                          </button>

                          <button
                            onClick={() =>
                              void removeGoal(
                                goal,
                              )
                            }
                            className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50"
                          >
                            Excluir
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                },
              )}
            </div>
          )}
        </section>
      </section>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/35 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
            <span className="eyebrow dark">
              {editingGoal
                ? 'Editar objetivo'
                : 'Novo objetivo'}
            </span>

            <h2 className="text-2xl font-bold">
              {editingGoal
                ? 'Editar meta'
                : 'Criar meta financeira'}
            </h2>

            <p className="mt-2 text-sm text-[#667085]">
              Defina o valor que deseja
              alcançar e acompanhe sua
              evolução.
            </p>

            {error && (
              <div className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="mt-6 grid gap-5 sm:grid-cols-2"
            >
              <label className="text-sm font-bold sm:col-span-2">
                Nome da meta

                <input
                  required
                  minLength={2}
                  maxLength={100}
                  value={form.name}
                  onChange={(event) =>
                    updateForm(
                      'name',
                      event.target.value,
                    )
                  }
                  placeholder="Ex.: Reserva de emergência"
                  className="mt-2 h-12 w-full rounded-xl border border-[#d0d5dd] px-4 font-normal outline-none focus:border-[#1D4ED8]"
                />
              </label>

              <label className="text-sm font-bold sm:col-span-2">
                Descrição

                <textarea
                  maxLength={500}
                  value={
                    form.description
                  }
                  onChange={(event) =>
                    updateForm(
                      'description',
                      event.target.value,
                    )
                  }
                  placeholder="Ex.: Guardar dinheiro para 6 meses de despesas."
                  className="mt-2 min-h-24 w-full resize-none rounded-xl border border-[#d0d5dd] p-4 font-normal outline-none focus:border-[#1D4ED8]"
                />
              </label>

              <label className="text-sm font-bold">
                Valor objetivo

                <div className="relative mt-2">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#667085]">
                    R$
                  </span>

                  <input
                    required
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={
                      form.targetAmount
                    }
                    onChange={(event) =>
                      updateForm(
                        'targetAmount',
                        event.target.value,
                      )
                    }
                    placeholder="30000"
                    className="h-12 w-full rounded-xl border border-[#d0d5dd] pl-11 pr-4 font-normal outline-none focus:border-[#1D4ED8]"
                  />
                </div>
              </label>

              <label className="text-sm font-bold">
                Valor atual

                <div className="relative mt-2">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#667085]">
                    R$
                  </span>

                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      form.currentAmount
                    }
                    onChange={(event) =>
                      updateForm(
                        'currentAmount',
                        event.target.value,
                      )
                    }
                    placeholder="0"
                    className="h-12 w-full rounded-xl border border-[#d0d5dd] pl-11 pr-4 font-normal outline-none focus:border-[#1D4ED8]"
                  />
                </div>
              </label>

              <label className="text-sm font-bold sm:col-span-2">
                Data limite

                <input
                  type="date"
                  value={
                    form.targetDate
                  }
                  onChange={(event) =>
                    updateForm(
                      'targetDate',
                      event.target.value,
                    )
                  }
                  className="mt-2 h-12 w-full rounded-xl border border-[#d0d5dd] px-4 font-normal outline-none focus:border-[#1D4ED8]"
                />
              </label>

              {Number(
                form.targetAmount,
              ) > 0 && (
                <div className="rounded-xl bg-[#f8fafb] p-4 sm:col-span-2">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-[#667085]">
                      Progresso atual
                    </span>

                    <strong className="text-[#1D4ED8]">
                      {goalProgress(
                        Number(
                          form.currentAmount,
                        ) || 0,
                        Number(
                          form.targetAmount,
                        ) || 0,
                      ).toFixed(1)}
                      %
                    </strong>
                  </div>

                  <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-[#e4e7ec]">
                    <div
                      className="h-full rounded-full bg-[#1D4ED8]"
                      style={{
                        width: `${goalProgress(
                          Number(
                            form.currentAmount,
                          ) || 0,
                          Number(
                            form.targetAmount,
                          ) || 0,
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 sm:col-span-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-xl border border-[#d0d5dd] px-5 py-3 text-sm font-bold"
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
                    : editingGoal
                      ? 'Salvar alterações'
                      : 'Criar meta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
