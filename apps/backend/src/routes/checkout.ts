import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getTrip, updateTrip, updateTripStatus } from '../models/Trip';
import { AuditLogger } from '../services/auditLogger';
import { createSubwallet } from '../services/walletService';

export const checkoutRouter = Router();
const audit = AuditLogger.getInstance();

// ─── In-memory checkout sessions ─────────────────────────────

interface CheckoutSession {
  id: string;
  tripId: string;
  amount: string;
  description: string;
  status: 'pending' | 'paid' | 'expired' | 'cancelled';
  createdAt: string;
  txHash?: string;
}

const sessions: Map<string, CheckoutSession> = new Map();

// ─── Create a checkout session for trip funding ──────────────
// This is the HIGHEST priority bonus point
checkoutRouter.post('/sessions', (req, res) => {
  try {
    const { tripId, amount } = req.body;

    const trip = getTrip(tripId);
    if (!trip) return res.status(404).json({ error: 'Trip not found' });

    const session: CheckoutSession = {
      id: uuidv4(),
      tripId,
      amount: amount || trip.totalBudget.toString(),
      description: `VoyageAI Trip: ${trip.destination}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    sessions.set(session.id, session);

    audit.log({
      tripId,
      agentName: 'System',
      action: `Checkout session created: $${session.amount}`,
      reasoning: 'Waiting for user to fund trip via Locus Checkout widget',
      severity: 'info',
    });

    // In production, this would call:
    // const locus = new LocusAgent({ apiKey: LOCUS_API_KEY });
    // const session = await locus.sessions.create({
    //   amount: session.amount,
    //   description: session.description,
    //   successUrl: `${FRONTEND_URL}/trip/${tripId}/funded`,
    //   cancelUrl: `${FRONTEND_URL}/trip/${tripId}`,
    //   webhookUrl: `${BACKEND_URL}/api/checkout/webhook`,
    //   metadata: { tripId }
    // });

    res.status(201).json({
      sessionId: session.id,
      amount: session.amount,
      checkoutUrl: `https://beta.paywithlocus.com/checkout/${session.id}`,
      status: session.status,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Get checkout session status ─────────────────────────────
checkoutRouter.get('/sessions/:sessionId', (req, res) => {
  const session = sessions.get(req.params.sessionId);
  if (!session) return res.status(404).json({ error: 'Session not found' });
  res.json(session);
});

// ─── Simulate payment confirmation (for demo) ───────────────
checkoutRouter.post('/sessions/:sessionId/confirm', async (req, res) => {
  const session = sessions.get(req.params.sessionId);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  session.status = 'paid';
  session.txHash = `0xCHECKOUT_TX_${Date.now().toString(16)}`;
  sessions.set(session.id, session);

  const trip = getTrip(session.tripId);
  if (trip) {
    // Create the trip escrow subwallet
    const tripEndDate = new Date(trip.endDate).getTime() / 1000;
    const subwallet = await createSubwallet(session.amount, tripEndDate, trip.id);

    updateTrip(trip.id, {
      status: 'FUNDED',
      checkoutSessionId: session.id,
      subwalletAddress: subwallet.subwalletAddress,
    });

    audit.log({
      tripId: trip.id,
      agentName: 'System',
      action: `Trip funded! $${session.amount} USDC received`,
      reasoning: `Checkout confirmed (tx: ${session.txHash}). Subwallet created. Ready to start research.`,
      txHash: session.txHash,
      severity: 'success',
    });
  }

  res.json({ status: 'paid', txHash: session.txHash });
});

// ─── Webhook handler (for production) ────────────────────────
checkoutRouter.post('/webhook', (req, res) => {
  // In production, Locus calls this with onSuccess data
  console.log('[Checkout Webhook]', req.body);
  res.status(200).json({ received: true });
});
