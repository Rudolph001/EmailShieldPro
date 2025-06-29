import { WebSocketServer, WebSocket } from 'ws';

interface WebSocketMessage {
  type: 'email_update' | 'threat_alert' | 'policy_update' | 'metrics_update';
  data: any;
  timestamp: string;
}

class WebSocketManager {
  private clients: Set<WebSocket> = new Set();

  setup(wss: WebSocketServer) {
    wss.on('connection', (ws: WebSocket) => {
      console.log('New WebSocket connection established');
      this.clients.add(ws);

      ws.on('close', () => {
        console.log('WebSocket connection closed');
        this.clients.delete(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.clients.delete(ws);
      });

      // Send initial connection confirmation
      this.sendToClient(ws, {
        type: 'email_update',
        data: { status: 'connected' },
        timestamp: new Date().toISOString(),
      });
    });
  }

  private sendToClient(ws: WebSocket, message: WebSocketMessage) {
    if (ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify(message));
      } catch (error) {
        console.error('Error sending WebSocket message:', error);
      }
    }
  }

  broadcast(message: WebSocketMessage) {
    this.clients.forEach((client) => {
      this.sendToClient(client, message);
    });
  }

  // Specific broadcast methods
  broadcastEmailUpdate(emailData: any) {
    this.broadcast({
      type: 'email_update',
      data: emailData,
      timestamp: new Date().toISOString(),
    });
  }

  broadcastThreatAlert(threatData: any) {
    this.broadcast({
      type: 'threat_alert',
      data: threatData,
      timestamp: new Date().toISOString(),
    });
  }

  broadcastPolicyUpdate(policyData: any) {
    this.broadcast({
      type: 'policy_update',
      data: policyData,
      timestamp: new Date().toISOString(),
    });
  }

  broadcastMetricsUpdate(metricsData: any) {
    this.broadcast({
      type: 'metrics_update',
      data: metricsData,
      timestamp: new Date().toISOString(),
    });
  }

  getConnectedClientsCount(): number {
    return this.clients.size;
  }
}

const webSocketManager = new WebSocketManager();

export function setupWebSocket(wss: WebSocketServer) {
  webSocketManager.setup(wss);
}

export { webSocketManager };
