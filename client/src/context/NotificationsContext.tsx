import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Notification } from '../types';
import * as notificationsApi from '../api/notifications';
import { useAuth } from './AuthContext';

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  unreadMessageCount: number;
  markRead: (id: string) => void;
  markAllRead: () => void;
  refetch: () => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

const POLL_INTERVAL_MS = 20000;

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const refetch = useCallback(() => {
    if (!currentUser) {
      setNotifications([]);
      return;
    }
    notificationsApi.listMyNotifications().then(setNotifications).catch(() => {
      // Silently ignore — the bell just won't update this cycle; next poll retries.
    });
  }, [currentUser]);

  useEffect(() => {
    refetch();
    if (!currentUser) return;
    const interval = setInterval(refetch, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [currentUser, refetch]);

  const markRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    notificationsApi.markNotificationRead(id).catch(() => refetch());
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    notificationsApi.markAllNotificationsRead().catch(() => refetch());
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const unreadMessageCount = notifications.filter((n) => !n.read && n.type === 'message').length;

  return (
    <NotificationsContext.Provider
      value={{ notifications, unreadCount, unreadMessageCount, markRead, markAllRead, refetch }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider');
  return ctx;
}
