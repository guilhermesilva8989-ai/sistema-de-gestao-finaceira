'use client';

import {
  usePathname,
  useRouter,
} from 'next/navigation';

const navigation = [
  {
    label: 'Visão geral',
    path: '/dashboard',
  },
  {
    label: 'Carteiras',
    path: '/carteiras',
  },
  {
    label: 'Ativos',
    path: '/ativos',
  },
  {
    label: 'Movimentações',
    path: '/movimentacoes',
  },
  {
    label: 'Simulador',
    path: '/simulador',
  },
  {
    label: 'Metas',
    path: null,
  },
];

export function AppSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  function logout() {
    localStorage.removeItem(
      'accessToken',
    );

    localStorage.removeItem(
      'user',
    );

    router.replace('/login');
  }

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">
          F
        </div>

        <span>Finora</span>
      </div>

      <nav className="sidebar-nav">
        {navigation.map((item) => {
          const active =
            item.path === pathname;

          return (
            <button
              key={item.label}
              className={`nav-item ${
                active ? 'active' : ''
              }`}
              disabled={!item.path}
              onClick={() => {
                if (item.path) {
                  router.push(item.path);
                }
              }}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      <button
        className="logout-button"
        onClick={logout}
      >
        Sair da conta
      </button>
    </aside>
  );
}
