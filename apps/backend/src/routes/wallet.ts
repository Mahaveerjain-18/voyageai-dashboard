import { Router } from 'express';
import { getBalance, sendPayment, sendViaEmail } from '../services/walletService';

export const walletRouter = Router();

// ─── Get wallet balance ──────────────────────────────────────
walletRouter.get('/balance', async (_req, res) => {
  try {
    const balance = await getBalance();
    res.json(balance);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Send USDC to an address ─────────────────────────────────
walletRouter.post('/send', async (req, res) => {
  try {
    const { to, amount, tripId, reason } = req.body;
    const result = await sendPayment(to, amount, tripId, reason);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Send USDC via email escrow ──────────────────────────────
walletRouter.post('/send-email', async (req, res) => {
  try {
    const { email, amount, tripId, message } = req.body;
    const result = await sendViaEmail(email, amount, tripId, message);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
