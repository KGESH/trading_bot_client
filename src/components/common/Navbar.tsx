/**
 * This code was generated by v0 by Vercel.
 * @see https://v0.dev/t/n8PxBcPbryx
 */
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import SettingsGroup from '@/components/settings/SettingsGroup';
import { useExchangeStore } from '@/store/exchangeStore';

export type NavbarRouteProps = {
  url: string;
  name: string;
  exchange: string;
};

type NavbarProps = {
  className?: string;
  routes: NavbarRouteProps[];
};

export default function Navbar({ routes, className }: NavbarProps) {
  const { exchange } = useExchangeStore();

  return (
    <header className={cn('flex h-16 w-full items-center justify-between border-b', className)}>
      <nav className="w-full flex justify-between">
        <ul className="flex space-x-12">
          {routes.map((route) => (
            <li key={route.exchange} className="whitespace-nowrap items-center w-full flex">
              <NavLink
                to={{
                  pathname: route.url,
                  search: `?exchange=${route.exchange}`,
                }}
                className={({ isActive, isPending }) =>
                  isPending
                    ? 'font-bold text-purple-500'
                    : isActive && exchange === route.exchange
                      ? 'font-bold text-red-500'
                      : 'font-bold text-bg-primary'
                }
              >
                {route.name}
              </NavLink>
            </li>
          ))}
        </ul>
        <SettingsGroup className="grid grid-cols-2 items-center space-x-2 p-4" />
      </nav>
    </header>
  );
}
