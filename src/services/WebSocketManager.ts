import { io, Socket } from 'socket.io-client';
import type { Route } from '../types';

export class WebSocketManager {
  private socket: Socket | null = null;
  private api: any; // We'll inject the API instance

  constructor(api: any) {
    this.api = api;
  }

  connect(onQuoteUpdate: (routes: Route[]) => void, onError?: (error: Error) => void) {
    try {
      this.socket = io(this.api.getWebSocketUrl(), {
        transports: ['websocket', 'polling'],
        timeout: 5000,
      });

      this.socket.on('connect', () => {
        console.log('Connected to AppPay WebSocket');
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from AppPay WebSocket');
      });

      this.socket.on('quote_update', (data: any) => {
        try {
          // Convert server format to Route format
          const routes: Route[] = Array.isArray(data) ? data : [data];
          onQuoteUpdate(routes);
        } catch (error) {
          console.error('Error processing quote update:', error);
          onError?.(error as Error);
        }
      });

      this.socket.on('error', (error: any) => {
        console.error('WebSocket error:', error);
        onError?.(new Error(String(error)));
      });
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      onError?.(error as Error);
    }
  }

  subscribeToPayment(params: {
    fromTokenAddress: string;
    toTokenAddress: string;
    userTokenAmount: string;
    fromChainId: number;
    toChainId: number;
  }) {
    if (this.socket?.connected) {
      this.socket.emit('subscribe_payment', params);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}
