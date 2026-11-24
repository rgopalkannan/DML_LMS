import clsx from 'clsx';
import { useState, type ReactElement } from 'react';
import { NavLink, Outlet } from 'react-router';
import { Button } from '@/components/ui/Button';
import { ROLE_LABEL } from '@/constants/labels';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/features/auth/auth-context';
import { NAV_ITEMS } from './navigation';

export function AppLayout(): ReactElement {
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const items = NAV_ITEMS.filter(item => user && item.roles.includes(user.role));

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-surface-raised focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <aside className="border-b border-line bg-surface-raised lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-5 py-4">
          <NavLink to={ROUTES.home} className="flex items-center gap-3">
            <img src="/dml-mark.png" alt="" className="h-9 w-9" />
            <span className="leading-tight">
              <span className="block font-bold">Data Mine Labs</span>
              <span className="block text-xs font-semibold tracking-[0.2em] text-brand">LMS</span>
            </span>
          </NavLink>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            aria-expanded={menuOpen}
            aria-controls="main-nav"
            onClick={() => setMenuOpen(open => !open)}
          >
            Menu
          </Button>
        </div>
        <nav id="main-nav" aria-label="Main" className={clsx('px-3 pb-4 lg:block', menuOpen ? 'block' : 'hidden')}>
          <ul className="space-y-1">
            {items.map(item => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === ROUTES.home}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    clsx(
                      'block rounded-lg px-3 py-2 text-sm font-semibold',
                      isActive ? 'bg-brand text-ink-inverse' : 'text-ink hover:bg-surface-muted'
                    )
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
          {user && (
            <div className="mt-6 rounded-lg bg-brand-soft p-3 text-sm">
              <p className="font-semibold">{user.name}</p>
              <p className="text-ink-muted">{ROLE_LABEL[user.role]}</p>
              <Button variant="secondary" size="sm" className="mt-3 w-full" onClick={signOut}>
                Sign out
              </Button>
            </div>
          )}
        </nav>
      </aside>
      <main id="main" className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-8">
        <Outlet />
      </main>
    </div>
  );
}
