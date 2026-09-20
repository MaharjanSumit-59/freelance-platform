import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationsContext';
import NotificationBell from './NotificationBell';

function NavLink({ to, children, badge }: { to: string; children: React.ReactNode; badge?: number }) {
  const { pathname } = useLocation();
  const active = pathname === to || pathname.startsWith(to + '/');
  return (
    <Link
      to={to}
      className={`relative text-sm font-medium px-1 py-1 border-b-2 transition-colors ${
        active ? 'border-primary text-ink' : 'border-transparent text-muted hover:text-ink'
      }`}
    >
      {children}
      {!!badge && (
        <span className="absolute -top-1.5 -right-3 bg-primary text-white text-[10px] leading-none font-semibold rounded-full min-w-4 h-4 px-1 flex items-center justify-center">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </Link>
  );
}

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const { unreadMessageCount } = useNotifications();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="border-b border-border bg-surface sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-8">
        <Link to={currentUser ? '/dashboard' : '/'} className="flex items-center gap-1 shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block" />
          <span className="text-xl font-bold text-ink tracking-tight">
            Freelance<span className="text-primary">Hub</span>
          </span>
        </Link>

        <nav className="flex items-center gap-6 flex-1">
          <NavLink to="/jobs">Find work</NavLink>
          {currentUser?.role === 'client' && <NavLink to="/client/jobs">My jobs</NavLink>}
          {currentUser?.role === 'client' && <NavLink to="/client/jobs/new">Post a job</NavLink>}
          {currentUser?.role === 'freelancer' && <NavLink to="/freelancer/proposals">My proposals</NavLink>}
          {currentUser && (
            <NavLink to={currentUser.role === 'client' ? '/client/contracts' : '/freelancer/contracts'}>
              Contracts
            </NavLink>
          )}
          {currentUser && (
            <NavLink to="/messages" badge={unreadMessageCount}>
              Messages
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-4 shrink-0">
          {currentUser ? (
            <>
              <NotificationBell />
              <Link
                to={
                  currentUser.role === 'client'
                    ? `/clients/${currentUser.id}`
                    : `/freelancers/${currentUser.id}`
                }
                className="w-8 h-8 rounded-full bg-primary-light text-primary-dark flex items-center justify-center text-xs font-semibold"
                title={currentUser.name}
              >
                {currentUser.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </Link>
              <button onClick={handleLogout} className="text-sm text-muted hover:text-ink transition-colors">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-ink hover:text-primary transition-colors">
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
        </div>
      </div>
    </header>
  );
}
