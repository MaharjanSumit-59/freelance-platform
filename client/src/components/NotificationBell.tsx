import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../context/NotificationsContext';
import { useAuth } from '../context/AuthContext';
import type { Notification } from '../types';

const TYPE_ICON: Record<string, string> = {
  proposal_received: '📝',
  proposal_accepted: '✅',
  proposal_rejected: '❌',
  hired: '🎉',
  message: '💬',
  deadline: '⏰',
  review: '⭐',
};

function timeAgo(dateStr: string) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / (1000 * 60));
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function NotificationBell() {
  const { currentUser } = useAuth();
  const { notifications, unreadCount, markRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Messages have their own badge on the "Messages" nav link — keep them
  // out of the bell entirely so a new message doesn't also light this up.
  const bellNotifications = notifications.filter((n) => n.type !== 'message');

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (!currentUser) return null;

  const linkFor = (n: Notification) => {
    if (n.type === 'message') return `/messages?contract=${n.relatedId}`;
    if (n.type === 'hired') return currentUser.role === 'freelancer' ? '/freelancer/contracts' : '/client/contracts';
    if (n.type === 'proposal_received') return `/client/jobs/${n.relatedId}/proposals`;
    if (n.type === 'proposal_rejected') return '/freelancer/proposals';
    if (n.type === 'review') return `/freelancers/${currentUser.id}`;
    return '#';
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} className="relative p-1 hover:text-primary transition-colors" aria-label="Notifications">
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-2 bg-warn text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed left-4 right-4 top-[4.5rem] max-h-[70vh] sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-80 sm:max-h-96 overflow-y-auto border border-border rounded-lg bg-surface shadow-lg z-10">
          <div className="flex justify-between items-center px-4 py-2 border-b border-border">
            <p className="text-sm font-medium">Notifications</p>
            {unreadCount > 0 && (
              <button
                onClick={() => bellNotifications.filter((n) => !n.read).forEach((n) => markRead(n.id))}
                className="text-xs text-primary hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          {bellNotifications.length === 0 && (
            <p className="text-sm text-muted px-4 py-6 text-center">No notifications yet.</p>
          )}

          {bellNotifications.map((n) => (
            <Link
              key={n.id}
              to={linkFor(n)}
              onClick={() => {
                markRead(n.id);
                setOpen(false);
              }}
              className={`block px-4 py-3 border-b border-border/60 last:border-0 hover:bg-bg transition-colors ${
                !n.read ? 'bg-primary-light/40' : ''
              }`}
            >
              <div className="flex gap-2 items-start">
                <span>{TYPE_ICON[n.type] ?? '🔔'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm break-words">{n.message}</p>
                  <p className="text-xs text-muted mt-0.5">{timeAgo(n.createdAt)}</p>
                </div>
                {!n.read && <span className="w-2 h-2 rounded-full bg-warn mt-1.5" />}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}