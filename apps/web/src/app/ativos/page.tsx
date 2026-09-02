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

type AssetType =
  | 'STOCK'
  | 'FII'
  | 'ETF'
  | 'FIXED_INCOME'
  | 'CRYPTO'
  | 'FUND'
  | 'OTHER';

type Portfolio = {
  id: string;
  name: string;
  isDefault: boolean;
};

type Asset = {
  id: string;
  portfolioId: string;
  name: string;
  symbol: string | null;
  type: AssetType;
  quantity: string | number;
  averagePrice: string | number;
  currentPrice: string | number | null;
  portfolio: Portfolio;
};

const assetTypeLabels: Record<
  AssetType,
  string
> = {
  STOCK: 'Ação',
  FII: 'FII',
  ETF: 'ETF',
  FIXED_INCOME: 'Renda fixa',
  CRYPTO: 'Criptomoeda',
  FUND: 'Fundo',
  OTHER: 'Outro',
};

function toNumber(
  value: string | number | null,
) {
  if (value === null) {
    return 0;
  }

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

export default function AtivosPage() {
  const router = useRouter();

  const [assets, setAssets] =
    useState<Asset[]>([]);

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
    useState<Asset | null>(null);

  const [portfolioId, setPortfolioId] =
    useState('');

  const [name, setName] =
    useState('');

  const [symbol, setSymbol] =
    useState('');

  const [type, setType] =
    useState<AssetType>('STOCK');

  const [quantity, setQuantity] =
    useState('');

  const [averagePrice, setAveragePrice] =
    useState('');

  const [currentPrice, setCurrentPrice] =
    useState('');

  useEffect(() => {
    void loadData();
  }, []);

  async function loadData() {
    try {
      const [
        assetsResponse,
        portfoliosResponse,
      ] = await Promise.all([
        authenticatedApiRequest<Asset[]>(
          '/assets',
        ),

        authenticatedApiRequest<Portfolio[]>(
          '/portfolios',
        ),
      ]);

      setAssets(assetsResponse);
      setPortfolios(portfoliosResponse);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Não foi possível carregar os dados.';

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

  const summary = useMemo(() => {
    let invested = 0;
    let current = 0;

    for (const asset of assets) {
      const assetQuantity =
        toNumber(asset.quantity);

      const average =
        toNumber(asset.averagePrice);

      const price =
        asset.currentPrice === null
          ? average
          : toNumber(
              asset.currentPrice,
            );

      invested +=
        assetQuantity * average;

      current +=
        assetQuantity * price;
    }

    return {
      invested,
      current,
      result: current - invested,
    };
  }, [assets]);

  function openCreate() {
    const defaultPortfolio =
      portfolios.find(
        (portfolio) =>
          portfolio.isDefault,
      );

    setEditing(null);

    setPortfolioId(
      defaultPortfolio?.id ??
        portfolios[0]?.id ??
        '',
    );

    setName('');
    setSymbol('');
    setType('STOCK');
    setQuantity('');
    setAveragePrice('');
    setCurrentPrice('');
    setError('');
    setShowForm(true);
  }

  function openEdit(asset: Asset) {
    setEditing(asset);
    setPortfolioId(asset.portfolioId);
    setName(asset.name);
    setSymbol(asset.symbol ?? '');
    setType(asset.type);

    setQuantity(
      String(asset.quantity),
    );

    setAveragePrice(
      String(asset.averagePrice),
    );

    setCurrentPrice(
      asset.currentPrice === null
        ? ''
        : String(asset.currentPrice),
    );

    setError('');
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError('');
    setIsSaving(true);

    const data = {
      portfolioId,
      name,
      symbol:
        symbol.trim() ||
        undefined,
      type,
      quantity:
        Number(quantity),
      averagePrice:
        Number(averagePrice),

      currentPrice:
        currentPrice
          ? Number(currentPrice)
          : undefined,
    };

    try {
      if (editing) {
        await authenticatedApiRequest<Asset>(
          `/assets/${editing.id}`,
          {
            method: 'PATCH',
            body: JSON.stringify(data),
          },
        );
      } else {
        await authenticatedApiRequest<Asset>(
          '/assets',
          {
            method: 'POST',
            body: JSON.stringify(data),
          },
        );
      }

      closeForm();

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível salvar o ativo.',
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function removeAsset(
    asset: Asset,
  ) {
    const confirmed =
      window.confirm(
        `Deseja realmente excluir "${asset.name}"?`,
      );

    if (!confirmed) {
      return;
    }

    try {
      await authenticatedApiRequest<void>(
        `/assets/${asset.id}`,
        {
          method: 'DELETE',
        },
      );

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível excluir o ativo.',
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
              Investimentos
            </span>

            <h1 className="text-3xl font-bold tracking-[-1px]">
              Meus ativos
            </h1>

            <p className="mt-2 text-sm text-[#667085]">
              Acompanhe os investimentos
              presentes nas suas carteiras.
            </p>
          </div>

          <button
            onClick={openCreate}
            disabled={
              portfolios.length === 0
            }
            className="rounded-xl bg-[#1D4ED8] px-5 py-3 text-sm font-bold text-white hover:bg-[#1E40AF] disabled:opacity-50"
          >
            + Novo ativo
          </button>
        </header>

        {error && (
          <div className="mb-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="mb-6 grid gap-4 md:grid-cols-4">
          <article className="rounded-2xl border border-[#e4e7ec] bg-white p-5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#667085]">
              Ativos
            </span>

            <strong className="mt-4 block text-3xl">
              {assets.length}
            </strong>
          </article>

          <article className="rounded-2xl border border-[#e4e7ec] bg-white p-5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#667085]">
              Investido
            </span>

            <strong className="mt-4 block text-xl">
              {currency(
                summary.invested,
              )}
            </strong>
          </article>

          <article className="rounded-2xl border border-[#e4e7ec] bg-white p-5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#667085]">
              Valor atual
            </span>

            <strong className="mt-4 block text-xl text-[#1D4ED8]">
              {currency(
                summary.current,
              )}
            </strong>
          </article>

          <article className="rounded-2xl border border-[#e4e7ec] bg-white p-5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#667085]">
              Resultado
            </span>

            <strong
              className={`mt-4 block text-xl ${
                summary.result >= 0
                  ? 'text-[#1D4ED8]'
                  : 'text-red-600'
              }`}
            >
              {currency(
                summary.result,
              )}
            </strong>
          </article>
        </section>

        <section className="overflow-hidden rounded-2xl border border-[#e4e7ec] bg-white">
          <div className="border-b border-[#e4e7ec] px-6 py-5">
            <h2 className="font-bold">
              Ativos cadastrados
            </h2>
          </div>

          {isLoading ? (
            <div className="flex min-h-60 items-center justify-center text-sm text-[#667085]">
              Carregando ativos...
            </div>
          ) : assets.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
              <strong>
                Nenhum ativo cadastrado
              </strong>

              <p className="mt-2 text-sm text-[#667085]">
                Adicione seu primeiro
                investimento.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="bg-[#f9fafb] text-left text-xs uppercase tracking-wider text-[#667085]">
                  <tr>
                    <th className="px-6 py-4">
                      Ativo
                    </th>

                    <th className="px-4 py-4">
                      Tipo
                    </th>

                    <th className="px-4 py-4">
                      Carteira
                    </th>

                    <th className="px-4 py-4">
                      Quantidade
                    </th>

                    <th className="px-4 py-4">
                      Preço médio
                    </th>

                    <th className="px-4 py-4">
                      Atual
                    </th>

                    <th className="px-4 py-4">
                      Total
                    </th>

                    <th className="px-6 py-4" />
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#e4e7ec]">
                  {assets.map((asset) => {
                    const assetQuantity =
                      toNumber(
                        asset.quantity,
                      );

                    const average =
                      toNumber(
                        asset.averagePrice,
                      );

                    const price =
                      asset.currentPrice ===
                      null
                        ? average
                        : toNumber(
                            asset.currentPrice,
                          );

                    return (
                      <tr key={asset.id}>
                        <td className="px-6 py-4">
                          <strong>
                            {asset.symbol ??
                              asset.name}
                          </strong>

                          <span className="mt-1 block text-xs text-[#667085]">
                            {asset.name}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-sm">
                          {
                            assetTypeLabels[
                              asset.type
                            ]
                          }
                        </td>

                        <td className="px-4 py-4 text-sm">
                          {
                            asset.portfolio
                              .name
                          }
                        </td>

                        <td className="px-4 py-4 text-sm">
                          {assetQuantity}
                        </td>

                        <td className="px-4 py-4 text-sm">
                          {currency(
                            average,
                          )}
                        </td>

                        <td className="px-4 py-4 text-sm">
                          {currency(
                            price,
                          )}
                        </td>

                        <td className="px-4 py-4 font-bold">
                          {currency(
                            assetQuantity *
                              price,
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() =>
                                openEdit(
                                  asset,
                                )
                              }
                              className="rounded-lg border border-[#d0d5dd] px-3 py-2 text-xs font-bold"
                            >
                              Editar
                            </button>

                            <button
                              onClick={() =>
                                void removeAsset(
                                  asset,
                                )
                              }
                              className="rounded-lg border border-red-100 px-3 py-2 text-xs font-bold text-red-600"
                            >
                              Excluir
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/35 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
            <span className="eyebrow dark">
              {editing
                ? 'Editar'
                : 'Novo investimento'}
            </span>

            <h2 className="text-2xl font-bold">
              {editing
                ? 'Editar ativo'
                : 'Cadastrar ativo'}
            </h2>

            <form
              onSubmit={handleSubmit}
              className="mt-6 grid gap-5 sm:grid-cols-2"
            >
              <label className="text-sm font-bold">
                Carteira

                <select
                  required
                  value={portfolioId}
                  onChange={(event) =>
                    setPortfolioId(
                      event.target.value,
                    )
                  }
                  className="mt-2 h-12 w-full rounded-xl border border-[#d0d5dd] bg-white px-4 font-normal"
                >
                  {portfolios.map(
                    (portfolio) => (
                      <option
                        key={portfolio.id}
                        value={portfolio.id}
                      >
                        {portfolio.name}
                      </option>
                    ),
                  )}
                </select>
              </label>

              <label className="text-sm font-bold">
                Tipo

                <select
                  value={type}
                  onChange={(event) =>
                    setType(
                      event.target
                        .value as AssetType,
                    )
                  }
                  className="mt-2 h-12 w-full rounded-xl border border-[#d0d5dd] bg-white px-4 font-normal"
                >
                  {Object.entries(
                    assetTypeLabels,
                  ).map(
                    ([value, label]) => (
                      <option
                        key={value}
                        value={value}
                      >
                        {label}
                      </option>
                    ),
                  )}
                </select>
              </label>

              <label className="text-sm font-bold">
                Nome

                <input
                  required
                  value={name}
                  onChange={(event) =>
                    setName(
                      event.target.value,
                    )
                  }
                  placeholder="Petrobras"
                  className="mt-2 h-12 w-full rounded-xl border border-[#d0d5dd] px-4 font-normal"
                />
              </label>

              <label className="text-sm font-bold">
                Código / Ticker

                <input
                  value={symbol}
                  onChange={(event) =>
                    setSymbol(
                      event.target.value,
                    )
                  }
                  placeholder="PETR4"
                  className="mt-2 h-12 w-full rounded-xl border border-[#d0d5dd] px-4 font-normal uppercase"
                />
              </label>

              <label className="text-sm font-bold">
                Quantidade

                <input
                  required
                  type="number"
                  min="0.00000001"
                  step="any"
                  value={quantity}
                  onChange={(event) =>
                    setQuantity(
                      event.target.value,
                    )
                  }
                  placeholder="10"
                  className="mt-2 h-12 w-full rounded-xl border border-[#d0d5dd] px-4 font-normal"
                />
              </label>

              <label className="text-sm font-bold">
                Preço médio

                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={averagePrice}
                  onChange={(event) =>
                    setAveragePrice(
                      event.target.value,
                    )
                  }
                  placeholder="30.00"
                  className="mt-2 h-12 w-full rounded-xl border border-[#d0d5dd] px-4 font-normal"
                />
              </label>

              <label className="text-sm font-bold sm:col-span-2">
                Preço atual

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={currentPrice}
                  onChange={(event) =>
                    setCurrentPrice(
                      event.target.value,
                    )
                  }
                  placeholder="35.00"
                  className="mt-2 h-12 w-full rounded-xl border border-[#d0d5dd] px-4 font-normal"
                />
              </label>

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
                    : 'Salvar ativo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
