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

type MovementType = 'BUY' | 'SELL';

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
  quantity: string | number;
  averagePrice: string | number;
  currentPrice: string | number | null;

  portfolio: Portfolio;
};

type Movement = {
  id: string;
  portfolioId: string;
  assetId: string;
  type: MovementType;
  quantity: string | number;
  price: string | number;
  operationDate: string;
  createdAt: string;

  asset: {
    id: string;
    name: string;
    symbol: string | null;
    type: string;
  };

  portfolio: {
    id: string;
    name: string;
    isDefault: boolean;
  };
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

function formatQuantity(
  value: string | number,
) {
  return Number(value).toLocaleString(
    'pt-BR',
    {
      maximumFractionDigits: 8,
    },
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(
    'pt-BR',
  ).format(new Date(value));
}

export default function MovimentacoesPage() {
  const router = useRouter();

  const [movements, setMovements] =
    useState<Movement[]>([]);

  const [assets, setAssets] =
    useState<Asset[]>([]);

  const [portfolios, setPortfolios] =
    useState<Portfolio[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSaving, setIsSaving] =
    useState(false);

  const [showForm, setShowForm] =
    useState(false);

  const [error, setError] =
    useState('');

  const [portfolioId, setPortfolioId] =
    useState('');

  const [assetId, setAssetId] =
    useState('');

  const [type, setType] =
    useState<MovementType>('BUY');

  const [quantity, setQuantity] =
    useState('');

  const [price, setPrice] =
    useState('');

  const [operationDate, setOperationDate] =
    useState('');

  useEffect(() => {
    void loadData();
  }, []);

  async function loadData() {
    try {
      const [
        movementsResponse,
        assetsResponse,
        portfoliosResponse,
      ] = await Promise.all([
        authenticatedApiRequest<Movement[]>(
          '/movements',
        ),

        authenticatedApiRequest<Asset[]>(
          '/assets',
        ),

        authenticatedApiRequest<Portfolio[]>(
          '/portfolios',
        ),
      ]);

      setMovements(
        movementsResponse,
      );

      setAssets(
        assetsResponse,
      );

      setPortfolios(
        portfoliosResponse,
      );
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Não foi possível carregar as movimentações.';

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

  const filteredAssets =
    useMemo(() => {
      return assets.filter(
        (asset) =>
          asset.portfolioId ===
          portfolioId,
      );
    }, [
      assets,
      portfolioId,
    ]);

  const selectedAsset =
    useMemo(() => {
      return assets.find(
        (asset) =>
          asset.id === assetId,
      );
    }, [
      assets,
      assetId,
    ]);

  const totals = useMemo(() => {
    let purchases = 0;
    let sales = 0;

    for (const movement of movements) {
      const total =
        numberValue(
          movement.quantity,
        ) *
        numberValue(
          movement.price,
        );

      if (movement.type === 'BUY') {
        purchases += total;
      } else {
        sales += total;
      }
    }

    return {
      purchases,
      sales,
    };
  }, [movements]);

  function today() {
    const now = new Date();

    const year =
      now.getFullYear();

    const month =
      String(
        now.getMonth() + 1,
      ).padStart(2, '0');

    const day =
      String(
        now.getDate(),
      ).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  function openCreate() {
    const defaultPortfolio =
      portfolios.find(
        (portfolio) =>
          portfolio.isDefault,
      ) ??
      portfolios[0];

    const initialPortfolioId =
      defaultPortfolio?.id ?? '';

    const firstAsset =
      assets.find(
        (asset) =>
          asset.portfolioId ===
          initialPortfolioId,
      );

    setPortfolioId(
      initialPortfolioId,
    );

    setAssetId(
      firstAsset?.id ?? '',
    );

    setType('BUY');
    setQuantity('');
    setPrice('');
    setOperationDate(
      today(),
    );

    setError('');
    setShowForm(true);
  }

  function handlePortfolioChange(
    newPortfolioId: string,
  ) {
    setPortfolioId(
      newPortfolioId,
    );

    const firstAsset =
      assets.find(
        (asset) =>
          asset.portfolioId ===
          newPortfolioId,
      );

    setAssetId(
      firstAsset?.id ?? '',
    );
  }

  function closeForm() {
    setShowForm(false);
    setError('');
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!portfolioId || !assetId) {
      setError(
        'Selecione uma carteira e um ativo.',
      );

      return;
    }

    setIsSaving(true);
    setError('');

    try {
      await authenticatedApiRequest<Movement>(
        '/movements',
        {
          method: 'POST',

          body: JSON.stringify({
            portfolioId,
            assetId,
            type,
            quantity:
              Number(quantity),
            price:
              Number(price),
            operationDate,
          }),
        },
      );

      setShowForm(false);

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível registrar a movimentação.',
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="dashboard-shell">
      <AppSidebar />

      <section className="min-w-0 px-6 py-8 lg:px-10 lg:py-9">
        <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="eyebrow dark">
              Operações
            </span>

            <h1 className="text-3xl font-bold tracking-[-1px]">
              Movimentações
            </h1>

            <p className="mt-2 text-sm text-[#667085]">
              Registre compras e vendas dos seus investimentos.
            </p>
          </div>

          <button
            onClick={openCreate}
            disabled={
              assets.length === 0
            }
            className="rounded-xl bg-[#0b6b57] px-5 py-3 text-sm font-bold text-white hover:bg-[#074d40] disabled:cursor-not-allowed disabled:opacity-50"
          >
            + Nova movimentação
          </button>
        </header>

        {error && !showForm && (
          <div className="mb-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="mb-6 grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-[#e4e7ec] bg-white p-5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#667085]">
              Movimentações
            </span>

            <strong className="mt-4 block text-3xl">
              {movements.length}
            </strong>
          </article>

          <article className="rounded-2xl border border-[#e4e7ec] bg-white p-5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#667085]">
              Compras
            </span>

            <strong className="mt-4 block text-xl">
              {currency(
                totals.purchases,
              )}
            </strong>
          </article>

          <article className="rounded-2xl border border-[#e4e7ec] bg-white p-5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#667085]">
              Vendas
            </span>

            <strong className="mt-4 block text-xl text-[#0b6b57]">
              {currency(
                totals.sales,
              )}
            </strong>
          </article>
        </section>

        <section className="overflow-hidden rounded-2xl border border-[#e4e7ec] bg-white">
          <div className="border-b border-[#e4e7ec] px-6 py-5">
            <h2 className="font-bold">
              Histórico de movimentações
            </h2>

            <p className="mt-1 text-sm text-[#667085]">
              Compras e vendas registradas no sistema.
            </p>
          </div>

          {isLoading ? (
            <div className="flex min-h-64 items-center justify-center text-sm text-[#667085]">
              Carregando movimentações...
            </div>
          ) : movements.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
              <strong>
                Nenhuma movimentação registrada
              </strong>

              <p className="mt-2 text-sm text-[#667085]">
                Registre sua primeira compra ou venda.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px]">
                <thead className="bg-[#f9fafb] text-left text-xs uppercase tracking-wider text-[#667085]">
                  <tr>
                    <th className="px-6 py-4">
                      Data
                    </th>

                    <th className="px-4 py-4">
                      Operação
                    </th>

                    <th className="px-4 py-4">
                      Ativo
                    </th>

                    <th className="px-4 py-4">
                      Carteira
                    </th>

                    <th className="px-4 py-4">
                      Quantidade
                    </th>

                    <th className="px-4 py-4">
                      Preço
                    </th>

                    <th className="px-6 py-4">
                      Total
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#e4e7ec]">
                  {movements.map(
                    (movement) => {
                      const movementQuantity =
                        numberValue(
                          movement.quantity,
                        );

                      const movementPrice =
                        numberValue(
                          movement.price,
                        );

                      return (
                        <tr
                          key={
                            movement.id
                          }
                        >
                          <td className="px-6 py-4 text-sm">
                            {formatDate(
                              movement.operationDate,
                            )}
                          </td>

                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                                movement.type ===
                                'BUY'
                                  ? 'bg-[#e7f6f1] text-[#0b6b57]'
                                  : 'bg-red-50 text-red-600'
                              }`}
                            >
                              {movement.type ===
                              'BUY'
                                ? 'Compra'
                                : 'Venda'}
                            </span>
                          </td>

                          <td className="px-4 py-4">
                            <strong>
                              {movement.asset
                                .symbol ??
                                movement.asset
                                  .name}
                            </strong>

                            <span className="mt-1 block text-xs text-[#667085]">
                              {
                                movement.asset
                                  .name
                              }
                            </span>
                          </td>

                          <td className="px-4 py-4 text-sm">
                            {
                              movement
                                .portfolio.name
                            }
                          </td>

                          <td className="px-4 py-4 text-sm">
                            {formatQuantity(
                              movement.quantity,
                            )}
                          </td>

                          <td className="px-4 py-4 text-sm">
                            {currency(
                              movementPrice,
                            )}
                          </td>

                          <td className="px-6 py-4 font-bold">
                            {currency(
                              movementQuantity *
                                movementPrice,
                            )}
                          </td>
                        </tr>
                      );
                    },
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/35 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
            <span className="eyebrow dark">
              Nova operação
            </span>

            <h2 className="text-2xl font-bold">
              Registrar movimentação
            </h2>

            <p className="mt-2 text-sm text-[#667085]">
              Compras aumentam sua posição e recalculam o preço médio.
              Vendas reduzem a quantidade disponível.
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
              <label className="text-sm font-bold">
                Operação

                <select
                  value={type}
                  onChange={(event) =>
                    setType(
                      event.target
                        .value as MovementType,
                    )
                  }
                  className="mt-2 h-12 w-full rounded-xl border border-[#d0d5dd] bg-white px-4 font-normal"
                >
                  <option value="BUY">
                    Compra
                  </option>

                  <option value="SELL">
                    Venda
                  </option>
                </select>
              </label>

              <label className="text-sm font-bold">
                Data

                <input
                  required
                  type="date"
                  value={operationDate}
                  onChange={(event) =>
                    setOperationDate(
                      event.target.value,
                    )
                  }
                  className="mt-2 h-12 w-full rounded-xl border border-[#d0d5dd] px-4 font-normal"
                />
              </label>

              <label className="text-sm font-bold sm:col-span-2">
                Carteira

                <select
                  required
                  value={portfolioId}
                  onChange={(event) =>
                    handlePortfolioChange(
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

              <label className="text-sm font-bold sm:col-span-2">
                Ativo

                <select
                  required
                  value={assetId}
                  onChange={(event) =>
                    setAssetId(
                      event.target.value,
                    )
                  }
                  className="mt-2 h-12 w-full rounded-xl border border-[#d0d5dd] bg-white px-4 font-normal"
                >
                  {filteredAssets.length ===
                  0 ? (
                    <option value="">
                      Nenhum ativo nesta carteira
                    </option>
                  ) : (
                    filteredAssets.map(
                      (asset) => (
                        <option
                          key={asset.id}
                          value={asset.id}
                        >
                          {asset.symbol
                            ? `${asset.symbol} - ${asset.name}`
                            : asset.name}
                        </option>
                      ),
                    )
                  )}
                </select>
              </label>

              {selectedAsset && (
                <div className="rounded-xl bg-[#f8fafb] p-4 text-sm sm:col-span-2">
                  <span className="text-[#667085]">
                    Posição atual:
                  </span>

                  <strong className="ml-2">
                    {formatQuantity(
                      selectedAsset.quantity,
                    )}{' '}
                    unidade(s)
                  </strong>

                  <span className="ml-4 text-[#667085]">
                    Preço médio:
                  </span>

                  <strong className="ml-2">
                    {currency(
                      Number(
                        selectedAsset.averagePrice,
                      ),
                    )}
                  </strong>
                </div>
              )}

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
                  placeholder="5"
                  className="mt-2 h-12 w-full rounded-xl border border-[#d0d5dd] px-4 font-normal"
                />
              </label>

              <label className="text-sm font-bold">
                Preço da operação

                <input
                  required
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={price}
                  onChange={(event) =>
                    setPrice(
                      event.target.value,
                    )
                  }
                  placeholder="30.00"
                  className="mt-2 h-12 w-full rounded-xl border border-[#d0d5dd] px-4 font-normal"
                />
              </label>

              {quantity &&
                price && (
                  <div className="rounded-xl bg-[#f8fafb] p-4 sm:col-span-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#667085]">
                      Valor da operação
                    </span>

                    <strong className="mt-2 block text-xl">
                      {currency(
                        Number(quantity) *
                          Number(price),
                      )}
                    </strong>
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
                  disabled={
                    isSaving ||
                    !assetId
                  }
                  className="rounded-xl bg-[#0b6b57] px-5 py-3 text-sm font-bold text-white hover:bg-[#074d40] disabled:opacity-60"
                >
                  {isSaving
                    ? 'Salvando...'
                    : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
