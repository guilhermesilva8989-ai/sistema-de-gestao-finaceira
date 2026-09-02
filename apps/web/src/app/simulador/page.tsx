'use client';

import {
  FormEvent,
  useState,
} from 'react';
import { AppSidebar } from '../../components/app-sidebar';

type SimulationResult = {
  totalContributed: number;
  finalBalance: number;
  totalInterest: number;
  profitability: number;
  months: number;
};

function currency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

function calculateSimulation(
  initialAmount: number,
  monthlyContribution: number,
  annualRate: number,
  years: number,
): SimulationResult {
  const months = years * 12;

  const monthlyRate =
    Math.pow(
      1 + annualRate / 100,
      1 / 12,
    ) - 1;

  let balance = initialAmount;

  for (
    let month = 0;
    month < months;
    month += 1
  ) {
    balance *= 1 + monthlyRate;
    balance += monthlyContribution;
  }

  const totalContributed =
    initialAmount +
    monthlyContribution * months;

  const totalInterest =
    balance - totalContributed;

  const profitability =
    totalContributed > 0
      ? (totalInterest /
          totalContributed) *
        100
      : 0;

  return {
    totalContributed,
    finalBalance: balance,
    totalInterest,
    profitability,
    months,
  };
}

export default function SimuladorPage() {
  const [initialAmount, setInitialAmount] =
    useState('10000');

  const [
    monthlyContribution,
    setMonthlyContribution,
  ] = useState('1000');

  const [annualRate, setAnnualRate] =
    useState('10');

  const [years, setYears] =
    useState('10');

  const [result, setResult] =
    useState<SimulationResult>(() =>
      calculateSimulation(
        10000,
        1000,
        10,
        10,
      ),
    );

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const initial =
      Number(initialAmount) || 0;

    const monthly =
      Number(monthlyContribution) || 0;

    const rate =
      Number(annualRate) || 0;

    const period =
      Number(years) || 0;

    setResult(
      calculateSimulation(
        initial,
        monthly,
        rate,
        period,
      ),
    );
  }

  function resetSimulation() {
    setInitialAmount('10000');
    setMonthlyContribution('1000');
    setAnnualRate('10');
    setYears('10');

    setResult(
      calculateSimulation(
        10000,
        1000,
        10,
        10,
      ),
    );
  }

  return (
    <main className="dashboard-shell">
      <AppSidebar />

      <section className="min-w-0 px-6 py-8 lg:px-10 lg:py-9">
        <header className="mb-8">
          <span className="eyebrow dark">
            Planejamento
          </span>

          <h1 className="text-3xl font-bold tracking-[-1px]">
            Simulador de investimentos
          </h1>

          <p className="mt-2 text-sm text-[#667085]">
            Projete o crescimento do seu
            patrimônio utilizando aportes
            mensais e juros compostos.
          </p>
        </header>

        <section className="grid gap-6 xl:grid-cols-[420px_1fr]">
          <article className="rounded-2xl border border-[#e4e7ec] bg-white p-6">
            <div className="mb-6">
              <h2 className="text-lg font-bold">
                Dados da simulação
              </h2>

              <p className="mt-1 text-sm text-[#667085]">
                Informe os valores da sua
                estratégia de investimento.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="grid gap-5"
            >
              <label className="text-sm font-bold">
                Valor inicial

                <div className="relative mt-2">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#667085]">
                    R$
                  </span>

                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={initialAmount}
                    onChange={(event) =>
                      setInitialAmount(
                        event.target.value,
                      )
                    }
                    className="h-12 w-full rounded-xl border border-[#d0d5dd] pl-11 pr-4 font-normal outline-none focus:border-[#1D4ED8]"
                  />
                </div>
              </label>

              <label className="text-sm font-bold">
                Aporte mensal

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
                      monthlyContribution
                    }
                    onChange={(event) =>
                      setMonthlyContribution(
                        event.target.value,
                      )
                    }
                    className="h-12 w-full rounded-xl border border-[#d0d5dd] pl-11 pr-4 font-normal outline-none focus:border-[#1D4ED8]"
                  />
                </div>
              </label>

              <label className="text-sm font-bold">
                Rentabilidade anual

                <div className="relative mt-2">
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={annualRate}
                    onChange={(event) =>
                      setAnnualRate(
                        event.target.value,
                      )
                    }
                    className="h-12 w-full rounded-xl border border-[#d0d5dd] px-4 pr-10 font-normal outline-none focus:border-[#1D4ED8]"
                  />

                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#667085]">
                    %
                  </span>
                </div>
              </label>

              <label className="text-sm font-bold">
                Prazo

                <div className="relative mt-2">
                  <input
                    required
                    type="number"
                    min="1"
                    max="60"
                    step="1"
                    value={years}
                    onChange={(event) =>
                      setYears(
                        event.target.value,
                      )
                    }
                    className="h-12 w-full rounded-xl border border-[#d0d5dd] px-4 pr-16 font-normal outline-none focus:border-[#1D4ED8]"
                  />

                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#667085]">
                    anos
                  </span>
                </div>
              </label>

              <button
                type="submit"
                className="mt-2 rounded-xl bg-[#1D4ED8] px-5 py-3 text-sm font-bold text-white hover:bg-[#1E40AF]"
              >
                Simular investimento
              </button>

              <button
                type="button"
                onClick={resetSimulation}
                className="rounded-xl border border-[#d0d5dd] px-5 py-3 text-sm font-bold hover:bg-[#f9fafb]"
              >
                Restaurar exemplo
              </button>
            </form>
          </article>

          <div className="grid content-start gap-6">
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <article className="rounded-2xl border border-[#e4e7ec] bg-white p-5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#667085]">
                  Total aportado
                </span>

                <strong className="mt-4 block text-xl">
                  {currency(
                    result.totalContributed,
                  )}
                </strong>

                <p className="mt-2 text-xs text-[#98a2b3]">
                  Capital colocado por você
                </p>
              </article>

              <article className="rounded-2xl border border-[#e4e7ec] bg-white p-5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#667085]">
                  Patrimônio projetado
                </span>

                <strong className="mt-4 block text-xl text-[#1D4ED8]">
                  {currency(
                    result.finalBalance,
                  )}
                </strong>

                <p className="mt-2 text-xs text-[#98a2b3]">
                  Valor estimado ao final
                </p>
              </article>

              <article className="rounded-2xl border border-[#e4e7ec] bg-white p-5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#667085]">
                  Rendimentos
                </span>

                <strong className="mt-4 block text-xl text-[#1D4ED8]">
                  {currency(
                    result.totalInterest,
                  )}
                </strong>

                <p className="mt-2 text-xs text-[#98a2b3]">
                  Ganho estimado com juros
                </p>
              </article>

              <article className="rounded-2xl border border-[#e4e7ec] bg-white p-5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#667085]">
                  Retorno
                </span>

                <strong className="mt-4 block text-xl text-[#1D4ED8]">
                  {result.profitability.toFixed(
                    2,
                  )}
                  %
                </strong>

                <p className="mt-2 text-xs text-[#98a2b3]">
                  Rendimento sobre aportes
                </p>
              </article>
            </section>

            <article className="rounded-2xl border border-[#e4e7ec] bg-white p-6">
              <div className="flex flex-col justify-between gap-4 border-b border-[#e4e7ec] pb-5 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-lg font-bold">
                    Resumo da projeção
                  </h2>

                  <p className="mt-1 text-sm text-[#667085]">
                    Resultado estimado com
                    capitalização mensal.
                  </p>
                </div>

                <span className="rounded-full bg-[#DBEAFE] px-4 py-2 text-xs font-bold text-[#1D4ED8]">
                  {result.months} meses
                </span>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-[#f8fafb] p-5">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#667085]">
                    Valor inicial
                  </span>

                  <strong className="mt-3 block text-xl">
                    {currency(
                      Number(
                        initialAmount,
                      ) || 0,
                    )}
                  </strong>
                </div>

                <div className="rounded-xl bg-[#f8fafb] p-5">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#667085]">
                    Aportes mensais
                  </span>

                  <strong className="mt-3 block text-xl">
                    {currency(
                      (Number(
                        monthlyContribution,
                      ) || 0) *
                        result.months,
                    )}
                  </strong>
                </div>

                <div className="rounded-xl bg-[#f8fafb] p-5">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#667085]">
                    Taxa utilizada
                  </span>

                  <strong className="mt-3 block text-xl">
                    {(
                      Number(
                        annualRate,
                      ) || 0
                    ).toFixed(2)}
                    % a.a.
                  </strong>
                </div>

                <div className="rounded-xl bg-[#f8fafb] p-5">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#667085]">
                    Prazo
                  </span>

                  <strong className="mt-3 block text-xl">
                    {Number(years) || 0}{' '}
                    ano(s)
                  </strong>
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] p-5">
                <p className="text-sm leading-6 text-[#475467]">
                  Esta simulação é apenas uma
                  projeção matemática. A
                  rentabilidade real de
                  investimentos pode variar e não
                  é garantida.
                </p>
              </div>
            </article>
          </div>
        </section>
      </section>
    </main>
  );
}
