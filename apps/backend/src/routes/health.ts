import { Router } from 'express';

export const healthRouter = Router();

// ─── Required by BuildWithLocus ──────────────────────────────
// Must return HTTP 200 for the platform to consider the service healthy.
healthRouter.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'voyageai-backend',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});
