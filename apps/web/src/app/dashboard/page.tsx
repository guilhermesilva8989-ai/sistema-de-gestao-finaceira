'use client';

import {
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import { AppSidebar } from '../../components/app-sidebar';
import { authenticatedApiRequest } from '../../lib/api';

type UserResponse = {
  id: string;
  email: string;

  profile: {
    name: string;
  } | null;

  portfolios: {
    id: string;
    name: string;
    isDefault: boolean;
  }[];
};

type Asset = {
  id: string;
  portfolioId: string;
  name: string;
  symbol: string | null;
  quantity: string | number;
  averagePrice: string | number;
  currentPrice: string | number | null;
};

function numberValue(
  value: string | number | null,
) {
  if (value === null) {
    return 0;
  }

  return Number(value);
}

function currency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] =
    useState<UserResponse | null>(null);

  const [assets, setAssets] =
    useState<Asset[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [
          userResponse,
          assetsResponse,
        ] = await Promise.all([
          authenticatedApiRequest<UserResponse>(
            '/auth/me',
          ),
          authenticatedApiRequest<Asset[]>(
            '/assets',
          ),
        ]);

        setUser(userResponse);
        setAssets(assetsResponse);
      } catch {
        localStorage.removeItem(
          'accessToken',
        );

        localStorage.removeItem(
          'user',
        );

        router.replace('/login');
      } finally {
        setIsLoading(false);
      }
    }

    void loadData();
  }, [router]);

  const values = useMemo(() => {
    let invested = 0;
    let current = 0;

    for (const asset of assets) {
      const quantity =
        numberValue(asset.quantity);

      const average =
        numberValue(
          asset.averagePrice,
        );

      const price =
        asset.currentPrice === null
          ? average
          : numberValue(
              asset.currentPrice,
            );

      invested += quantity * average;
      current += quantity * price;
    }

    const result =
      current - invested;

    const profitability =
      invested > 0
        ? (result / invested) * 100
        : 0;

    return {
      invested,
      current,
      result,
      profitability,
    };
  }, [assets]);

  if (isLoading) {
    return (
      <main className="dashboard-loading">
        <div className="loader" />

        <p>
          Preparando seu dashboard...
        </p>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  const name =
    user.profile?.name ??
    user.email;

  return (
    <main className="dashboard-shell">
      <AppSidebar />

      <section className="dashboard-content">
        <header className="dashboard-header">
          <div>
            <span className="eyebrow dark">
              Visão geral
            </span>

            <h1>Olá, {name}</h1>

            <p>
              Acompanhe a evolução dos seus
              investimentos.
            </p>
          </div>

          <div className="avatar">
            {name
              .slice(0, 1)
              .toUpperCase()}
          </div>
        </header>

        <section className="summary-grid">
          <article className="summary-card primary">
            <span>
              Patrimônio total
            </span>

            <strong>
              {currency(
                values.current,
              )}
            </strong>

            <small>
              Valor atual dos seus investimentos.
            </small>
          </article>

          <article className="summary-card">
            <span>
              Rentabilidade
            </span>

            <strong>
              {values.profitability.toFixed(
                2,
              )}
              %
            </strong>

            <small>
              Resultado sobre o valor investido.
            </small>
          </article>

          <article className="summary-card">
            <span>Resultado</span>

            <strong>
              {currency(
                values.result,
              )}
            </strong>

            <small>
              Lucro ou prejuízo atual.
            </small>
          </article>

          <article className="summary-card">
            <span>Ativos</span>

            <strong>
              {assets.length}
            </strong>

            <small>
              Investimentos cadastrados.
            </small>
          </article>
        </section>

        <section className="dashboard-grid">
          <article className="dashboard-card chart-card">
            <div className="card-heading">
              <div>
                <h2>
                  Resumo financeiro
                </h2>

                <p>
                  Posição atual dos seus investimentos
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-[#f8fafb] p-5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#667085]">
                  Total investido
                </span>

                <strong className="mt-3 block text-2xl">
                  {currency(
                    values.invested,
                  )}
                </strong>
              </div>

              <div className="rounded-xl bg-[#f8fafb] p-5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#667085]">
                  Valor atual
                </span>

                <strong className="mt-3 block text-2xl text-[#1D4ED8]">
                  {currency(
                    values.current,
                  )}
                </strong>
              </div>

              <div className="rounded-xl bg-[#f8fafb] p-5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#667085]">
                  Resultado
                </span>

                <strong className="mt-3 block text-2xl text-[#1D4ED8]">
                  {currency(
                    values.result,
                  )}
                </strong>
              </div>

              <div className="rounded-xl bg-[#f8fafb] p-5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#667085]">
                  Rentabilidade
                </span>

                <strong className="mt-3 block text-2xl text-[#1D4ED8]">
                  {values.profitability.toFixed(
                    2,
                  )}
                  %
                </strong>
              </div>
            </div>
          </article>

          <article className="dashboard-card">
            <div className="card-heading">
              <div>
                <h2>Carteiras</h2>

                <p>
                  Patrimônio por carteira
                </p>
              </div>
            </div>

            <div className="portfolio-list">
              {user.portfolios.map(
                (portfolio) => {
                  const total =
                    assets
                      .filter(
                        (asset) =>
                          asset.portfolioId ===
                          portfolio.id,
                      )
                      .reduce(
                        (
                          sum,
                          asset,
                        ) => {
                          const quantity =
                            numberValue(
                              asset.quantity,
                            );

                          const average =
                            numberValue(
                              asset.averagePrice,
                            );

                          const price =
                            asset.currentPrice ===
                            null
                              ? average
                              : numberValue(
                                  asset.currentPrice,
                                );

                          return (
                            sum +
                            quantity * price
                          );
                        },
                        0,
                      );

                  return (
                    <div
                      className="portfolio-item"
                      key={portfolio.id}
                    >
                      <div className="portfolio-icon">
                        C
                      </div>

                      <div>
                        <strong>
                          {portfolio.name}
                        </strong>

                        <span>
                          {portfolio.isDefault
                            ? 'Carteira principal'
                            : 'Carteira'}
                        </span>
                      </div>

                      <strong>
                        {currency(total)}
                      </strong>
                    </div>
                  );
                },
              )}
            </div>
          </article>
        </section>
      </section>
    </main>
  );
}
