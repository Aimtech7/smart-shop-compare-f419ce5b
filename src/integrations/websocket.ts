export type WSCallback = (data: any) => void;

class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private listeners: Map<string, WSCallback[]> = new Map();

  constructor(url: string) {
    this.url = url;
  }

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) return;
    
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      console.log('[WebSocket] Connected');
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type) {
          const callbacks = this.listeners.get(data.type) || [];
          callbacks.forEach(cb => cb(data.payload));
        }
      } catch (e) {
        console.error('[WebSocket] Failed to parse message', e);
      }
    };

    this.ws.onclose = () => {
      console.log('[WebSocket] Disconnected');
      this.handleReconnect();
    };

    this.ws.onerror = (err) => {
      console.error('[WebSocket] Error', err);
      this.ws?.close();
    };
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const timeout = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);
      console.log(`[WebSocket] Reconnecting in ${timeout}ms...`);
      setTimeout(() => this.connect(), timeout);
    } else {
      console.error('[WebSocket] Max reconnect attempts reached');
    }
  }

  subscribe(type: string, callback: WSCallback) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type)!.push(callback);
    return () => this.unsubscribe(type, callback);
  }

  unsubscribe(type: string, callback: WSCallback) {
    const callbacks = this.listeners.get(type);
    if (callbacks) {
      this.listeners.set(type, callbacks.filter(cb => cb !== callback));
    }
  }

  send(data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn('[WebSocket] Cannot send, not connected');
    }
  }
}

const wsUrl = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000/ws/';
export const wsClient = new WebSocketClient(wsUrl);
