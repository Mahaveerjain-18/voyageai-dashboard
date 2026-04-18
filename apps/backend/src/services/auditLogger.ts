import { WebSocketServer, WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';

// ─── Types ───────────────────────────────────────────────────

export interface AuditEntry {
  id: string;
  tripId: string;
  timestamp: string;
  agentName: 'Research' | 'Booking' | 'Delivery' | 'CFO' | 'System';
  action: string;
  reasoning: string;
  apiProvider?: string;
  apiCost?: number;
  txHash?: string;
  balanceAfter?: number;
  severity: 'info' | 'success' | 'warning' | 'error';
}

// ─── Singleton Audit Logger ──────────────────────────────────

export class AuditLogger {
  private static instance: AuditLogger;
  private wss: WebSocketServer | null = null;
  private logs: Map<string, AuditEntry[]> = new Map();

  private constructor() {}

  static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }

  setWebSocketServer(wss: WebSocketServer) {
    this.wss = wss;
  }

  log(entry: Omit<AuditEntry, 'id' | 'timestamp'>): AuditEntry {
    const fullEntry: AuditEntry = {
      ...entry,
      id: uuidv4(),
      timestamp: new Date().toISOString(),
    };

    // Store in memory
    const tripLogs = this.logs.get(entry.tripId) || [];
    tripLogs.push(fullEntry);
    this.logs.set(entry.tripId, tripLogs);

    // Broadcast to WebSocket clients
    if (this.wss) {
      const message = JSON.stringify({ type: 'audit', data: fullEntry });
      this.wss.clients.forEach((client: WebSocket) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    }

    // Console output for debugging
    const icon =
      entry.severity === 'success' ? '✅' :
      entry.severity === 'warning' ? '⚠️' :
      entry.severity === 'error' ? '❌' : '📋';

    const cost = entry.apiCost ? ` ($${entry.apiCost.toFixed(4)})` : '';
    console.log(
      `${icon} [${entry.agentName}] ${entry.action}${cost} — ${entry.reasoning}`
    );

    return fullEntry;
  }

  getLogsForTrip(tripId: string): AuditEntry[] {
    return this.logs.get(tripId) || [];
  }

  getAllLogs(): AuditEntry[] {
    const all: AuditEntry[] = [];
    this.logs.forEach((entries) => all.push(...entries));
    return all.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }
}
