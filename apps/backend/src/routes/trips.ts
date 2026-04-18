import { Router } from 'express';
import { createTrip, getTrip, getAllTrips, updateTrip, updateTripStatus } from '../models/Trip';
import { AuditLogger } from '../services/auditLogger';
import { createSubwallet, reclaimSubwallet } from '../services/walletService';

export const tripRouter = Router();
const audit = AuditLogger.getInstance();

// ─── Create a new trip ───────────────────────────────────────
tripRouter.post('/', (req, res) => {
  try {
    const { destination, startDate, endDate, travelers, preferences, totalBudget, spendingLimits } = req.body;

    if (!destination || !totalBudget) {
      return res.status(400).json({ error: 'destination and totalBudget are required' });
    }

    const trip = createTrip({
      userId: req.body.userId || 'demo-user',
      destination,
      startDate: startDate || new Date().toISOString(),
      endDate: endDate || new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      travelers: travelers || 1,
      preferences: preferences || '',
      totalBudget,
      spendingLimits: spendingLimits || {},
    });

    audit.log({
      tripId: trip.id,
      agentName: 'System',
      action: `Trip created: ${destination}`,
      reasoning: `Budget: $${totalBudget} | Travelers: ${trip.travelers} | Dates: ${trip.startDate} to ${trip.endDate}`,
      severity: 'success',
    });

    res.status(201).json(trip);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Get all trips ───────────────────────────────────────────
tripRouter.get('/', (_req, res) => {
  res.json(getAllTrips());
});

// ─── Get a single trip ───────────────────────────────────────
tripRouter.get('/:id', (req, res) => {
  const trip = getTrip(req.params.id);
  if (!trip) return res.status(404).json({ error: 'Trip not found' });
  res.json(trip);
});

// ─── Update spending limits ──────────────────────────────────
tripRouter.patch('/:id/limits', (req, res) => {
  const trip = getTrip(req.params.id);
  if (!trip) return res.status(404).json({ error: 'Trip not found' });

  const updated = updateTrip(trip.id, {
    spendingLimits: { ...trip.spendingLimits, ...req.body },
  });

  audit.log({
    tripId: trip.id,
    agentName: 'CFO',
    action: 'Spending limits updated',
    reasoning: `New limits: ${JSON.stringify(req.body)}`,
    severity: 'info',
  });

  res.json(updated);
});

// ─── Cancel a trip ───────────────────────────────────────────
tripRouter.post('/:id/cancel', async (req, res) => {
  const trip = getTrip(req.params.id);
  if (!trip) return res.status(404).json({ error: 'Trip not found' });

  // Reclaim subwallet if it exists
  if (trip.subwalletAddress) {
    await reclaimSubwallet(trip.subwalletAddress, trip.id);
  }

  const updated = updateTripStatus(trip.id, 'CANCELLED');

  audit.log({
    tripId: trip.id,
    agentName: 'System',
    action: 'Trip cancelled',
    reasoning: 'User requested trip cancellation. Funds reclaimed from subwallet.',
    severity: 'warning',
  });

  res.json(updated);
});

// ─── Approve selected options ────────────────────────────────
tripRouter.post('/:id/approve', (req, res) => {
  const trip = getTrip(req.params.id);
  if (!trip) return res.status(404).json({ error: 'Trip not found' });

  const { selectedOptionIds } = req.body;

  const updated = updateTrip(trip.id, {
    selectedOptions: selectedOptionIds,
    status: 'BOOKING',
  });

  audit.log({
    tripId: trip.id,
    agentName: 'System',
    action: 'User approved travel options — proceeding to booking',
    reasoning: `Approved ${selectedOptionIds.length} options. Transitioning to BOOKING state.`,
    severity: 'success',
  });

  res.json(updated);
});
