import { useEffect } from 'react';
import { toast } from 'sonner';
import { DJANGO_CONFIG } from '@/services/django/client';
import { useStore as useAuthStore } from '@/store/useStore';

export const NotificationListener = () => {
  const { user } = useAuthStore();

  useEffect(() => {
    if (!DJANGO_CONFIG.enabled || !user) return;

    // Determine WS base URL from environment or fallback to dynamic construction
    const envWsBase = import.meta.env.VITE_WS_BASE_URL;
    let wsUrl: string;

    if (envWsBase) {
      // Ensure VITE_WS_BASE_URL is used and path is appended correctly
      const base = envWsBase.endsWith('/') ? envWsBase.slice(0, -1) : envWsBase;
      wsUrl = `${base}/notifications/`;
    } else {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = DJANGO_CONFIG.baseUrl
        .replace(/^https?:\/\//, '')
        .split('/api')[0];
      wsUrl = `${protocol}//${host}/ws/notifications/`;
    }

    let socket: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout;

    const connect = () => {
      console.log('Connecting to Notifications WebSocket...');
      socket = new WebSocket(wsUrl);

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WS Notification:', data);

          if (data.type === 'notification') {
            toast.info(data.message, {
              description: 'System Alert',
              icon: '🔔',
            });
          } else if (data.type === 'order_update') {
            toast.success(`Order #${data.order_id.slice(0, 8)} updated: ${data.status}`, {
              description: data.message,
            });
          } else if (data.type === 'price_drop') {
            toast.info(`Price Drop: ${data.product_name}!`, {
              description: `New price: $${data.new_price}`,
              icon: '🔥',
            });
          }
        } catch (err) {
          console.error('Failed to parse WS message:', err);
        }
      };

      socket.onclose = () => {
        console.warn('WS Connection closed. Reconnecting in 5s...');
        reconnectTimeout = setTimeout(connect, 5000);
      };

      socket.onerror = (err) => {
        console.error('WS Socket error:', err);
        socket?.close();
      };
    };

    connect();

    return () => {
      if (socket) {
        socket.onclose = null; // Prevent reconnect on unmount
        socket.close();
      }
      clearTimeout(reconnectTimeout);
    };
  }, [user]);

  return null; // This component doesn't render anything
};
