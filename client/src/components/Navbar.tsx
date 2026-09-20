import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationsContext';
import NotificationBell from './NotificationBell';

interface NavItem {
  to: string;
  label: string;
  badge?: number;
}

function Badge({ count, className }: { count: number; className: string }) {
  return (
    <span
      className={`bg-primary text-white text-[10px] leading-none font-semibold rounded-full min-w-4 h-4 px-1 flex items-center justify-center ${className}`}
    >
      {count > 9 ? '9+' : count}
    </span>
  );
}

function isActive(pathname: string, to: string) {
  return pathname === to || pathname.startsWith(to + '/');
}

function DesktopLink({ item }: { item: NavItem }) {
  const { pathname } = useLocation();
  const active = isActive(pathname, item.to);
  return (
    <Link
      to={item.to}
      className={`relative text-sm font-medium px-1 py-1 border-b-2 transition-colors ${
        active ? 'border-primary text-ink' : 'border-transparent text-muted hover:text-ink'
      }`}
    >
      {item.label}
      {!!item.badge && <Badge count={item.badge} className="absolute -top-1.5 -right-3" />}
    </Link>
  );
}

function MobileLink({ item }: { item: NavItem }) {
  const { pathname } = useLocation();
  const active = isActive(pathname, item.to);
  return (
    <Link
      to={item.to}
      className={`flex items-center gap-2 px-4 py-3 text-base font-medium border-b border-border/60 transition-colors ${
        active ? 'text-primary bg-primary-light/40' : 'text-ink hover:bg-bg'
      }`}
    >
      {item.label}
      {!!item.badge && <Badge count={item.badge} className="" />}
    </Link>
  );
}

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const { unreadMessageCount } = useNotifications();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  // The menu is "open" only for the page it was opened on, so it closes
  // automatically on any navigation (link tap, back button, etc.).
  const [menuOpenAt, setMenuOpenAt] = useState<string | null>(null);
  const menuOpen = menuOpenAt === pathname;

  const handleLogout = () => {
    setMenuOpenAt(null);
    logout();
    navigate('/');
  };

  const items: NavItem[] = [{ to: '/jobs', label: 'Find work' }];
  if (currentUser?.role === 'client') {
    items.push({ to: '/client/jobs', label: 'My jobs' }, { to: '/client/jobs/new', label: 'Post a job' });
  }
  if (currentUser?.role === 'freelancer') {
    items.push({ to: '/freelancer/proposals', label: 'My proposals' });
  }
  if (currentUser) {
    items.push({
      to: currentUser.role === 'client' ? '/client/contracts' : '/freelancer/contracts',
      label: 'Contracts',
    });
    items.push({ to: '/messages', label: 'Messages', badge: unreadMessageCount });
  }

  const profilePath = currentUser
    ? currentUser.role === 'client'
      ? `/clients/${currentUser.id}`
      : `/freelancers/${currentUser.id}`
    : '';

  return (
    <header className="border-b border-border bg-surface sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4 md:gap-8">
        <Link to={currentUser ? '/dashboard' : '/'} className="flex items-center gap-1 shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block" />
          <span className="text-lg sm:text-xl font-bold text-ink tracking-tight">
            Freelance<span className="text-primary">Hub</span>
          </span>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-6 flex-1">
          {items.map((item) => (
            <DesktopLink key={item.to} item={item} />
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3 sm:gap-4 shrink-0">
          {currentUser ? (
            <>
              <NotificationBell />
              <Link
                to={profilePath}
                className="w-8 h-8 rounded-full bg-primary-light text-primary-dark flex items-center justify-center text-xs font-semibold"
                title={currentUser.name}
              >
                {currentUser.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </Link>
              <button
                onClick={handleLogout}
                className="hidden md:inline text-sm text-muted hover:text-ink transition-colors"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="hidden md:inline text-sm font-medium text-ink hover:text-primary transition-colors"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="bg-primary text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-primary-dark transition-colors"
              >
                Sign up
              </Link>
            </>
          )}

          {/* Hamburger (mobile only) */}
          <button
            type="button"
            onClick={() => setMenuOpenAt(menuOpen ? null : pathname)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="md:hidden -mr-2 p-2 text-ink hover:text-primary transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {menuOpen ? (
                <path d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav id="mobile-menu" className="md:hidden border-t border-border bg-surface max-h-[calc(100vh-4rem)] overflow-y-auto">
          {items.map((item) => (
            <MobileLink key={item.to} item={item} />
          ))}
          {currentUser ? (
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-3 text-base font-medium text-warn hover:bg-bg transition-colors"
            >
              Log out
            </button>
          ) : (
            <Link to="/login" className="block px-4 py-3 text-base font-medium text-ink hover:bg-bg transition-colors">
              Log in
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
