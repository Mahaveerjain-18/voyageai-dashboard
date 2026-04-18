import { Router } from 'express';
import { AuditLogger } from '../services/auditLogger';

export const auditRouter = Router();
const audit = AuditLogger.getInstance();

// ─── Get all audit logs for a trip ───────────────────────────
auditRouter.get('/trip/:tripId', (req, res) => {
  const logs = audit.getLogsForTrip(req.params.tripId);
  res.json({ tripId: req.params.tripId, count: logs.length, logs });
});

// ─── Get all audit logs ──────────────────────────────────────
auditRouter.get('/', (_req, res) => {
  const logs = audit.getAllLogs();
  res.json({ count: logs.length, logs });
});
