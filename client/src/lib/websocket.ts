import { useEffect, useState, useRef, useCallback } from 'react';

interface WebSocketMessage {
  type: 'email_update' | 'threat_alert' | 'policy_update' | 'metrics_update';
  data: any;
  timestamp: string;
}

interface UseWebSocketReturn {
  isConnected: boolean;
  lastMessage: string | null;
  sendMessage: (message: any) => void;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
}

export function useWebSocket(url: string): UseWebSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000;

  const connect = useCallback(() => {
    try {
      setConnectionStatus('connecting');
      
      // Convert HTTP URL to WebSocket URL if needed
      const wsUrl = url.replace(/^http/, 'ws');
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setConnectionStatus('connected');
        reconnectAttempts.current = 0;
      };

      ws.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(event.data);
          
          // Log received messages for debugging
          console.log('WebSocket message received:', message.type, message.data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.current.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        setConnectionStatus('disconnected');
        
        // Attempt to reconnect if it wasn't a manual close
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          console.log(`Attempting to reconnect (${reconnectAttempts.current}/${maxReconnectAttempts})...`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectDelay);
        }
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('error');
      };

    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      setConnectionStatus('error');
    }
  }, [url]);

  const sendMessage = useCallback((message: any) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      try {
        ws.current.send(JSON.stringify(message));
      } catch (error) {
        console.error('Error sending WebSocket message:', error);
      }
    } else {
      console.warn('WebSocket is not connected. Cannot send message.');
    }
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (ws.current) {
      ws.current.close(1000, 'Manual disconnect');
      ws.current = null;
    }
    
    setIsConnected(false);
    setConnectionStatus('disconnected');
  }, []);

  useEffect(() => {
    connect();

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Ping/pong heartbeat to keep connection alive
  useEffect(() => {
    if (!isConnected) return;

    const heartbeat = setInterval(() => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        sendMessage({ type: 'ping', timestamp: new Date().toISOString() });
      }
    }, 30000); // Send ping every 30 seconds

    return () => clearInterval(heartbeat);
  }, [isConnected, sendMessage]);

  return {
    isConnected,
    lastMessage,
    sendMessage,
    connectionStatus,
  };
}

// Hook for specific WebSocket message types
export function useWebSocketMessageHandler(
  wsHook: UseWebSocketReturn,
  messageType: string,
  handler: (data: any) => void
) {
  useEffect(() => {
    if (wsHook.lastMessage) {
      try {
        const message: WebSocketMessage = JSON.parse(wsHook.lastMessage);
        if (message.type === messageType) {
          handler(message.data);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message in handler:', error);
      }
    }
  }, [wsHook.lastMessage, messageType, handler]);
}

// Mock WebSocket hook for development/testing
export function useMockWebSocket(): UseWebSocketReturn {
  const [isConnected, setIsConnected] = useState(true);
  const [lastMessage, setLastMessage] = useState<string | null>(null);

  useEffect(() => {
    // Simulate real-time email updates
    const interval = setInterval(() => {
      const mockEmail = {
        id: `mock-${Date.now()}`,
        subject: `Test Email ${Math.floor(Math.random() * 1000)}`,
        sender: 'test@example.com',
        timestamp: new Date().toLocaleTimeString(),
        classification: ['safe', 'suspicious', 'malicious', 'dlp_violation'][Math.floor(Math.random() * 4)],
        riskScore: Math.floor(Math.random() * 100),
      };

      const message = {
        type: 'email_update',
        data: mockEmail,
        timestamp: new Date().toISOString(),
      };

      setLastMessage(JSON.stringify(message));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const sendMessage = useCallback((message: any) => {
    console.log('Mock WebSocket send:', message);
  }, []);

  return {
    isConnected,
    lastMessage,
    sendMessage,
    connectionStatus: 'connected',
  };
}

export default useWebSocket;
