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
    path: '/metas',
  },
];

export function AppSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  function logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');

    router.replace('/login');
  }

  return (
    <aside
      className="sidebar"
      style={{
        background:
          'linear-gradient(180deg, #172554 0%, #1E3A8A 100%)',
      }}
    >
      <div className="brand">
        <div
          className="brand-mark"
          style={{
            background:
              'linear-gradient(135deg, #3B82F6, #1D4ED8)',
            color: '#FFFFFF',
          }}
        >
          R
        </div>

        <span
          style={{
            color: '#FFFFFF',
          }}
        >
          Financeira Rakisan
        </span>
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
              onClick={() =>
                router.push(item.path)
              }
              style={
                active
                  ? {
                      background:
                        'rgba(59, 130, 246, 0.22)',
                      color: '#FFFFFF',
                    }
                  : {
                      color: '#DBEAFE',
                    }
              }
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      <button
        className="logout-button"
        onClick={logout}
        style={{
          color: '#DBEAFE',
          borderColor:
            'rgba(191, 219, 254, 0.25)',
        }}
      >
        Sair da conta
      </button>
    </aside>
  );
}
