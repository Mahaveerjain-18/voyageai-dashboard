import { Request, Response, NextFunction } from 'express';
import { getTrip } from '../models/Trip';
import { AuditLogger } from '../services/auditLogger';

const audit = AuditLogger.getInstance();

/**
 * Spending Guard Middleware
 * Enforces per-category spending limits before any payment is executed.
 * This is critical for the "Spending Controls as Governance" bonus point.
 */
export function spendingGuard(category: 'flight' | 'hotel' | 'activities' | 'food') {
  return (req: Request, res: Response, next: NextFunction) => {
    const { tripId, amount } = req.body;

    if (!tripId || !amount) {
      return next(); // Skip if not a trip-related payment
    }

    const trip = getTrip(tripId);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    const categoryKey = `max${category.charAt(0).toUpperCase() + category.slice(1)}` as keyof typeof trip.spendingLimits;
    const limit = trip.spendingLimits[categoryKey] as number;
    const currentSpend = trip.bookings
      .filter((b) => b.type === category)
      .reduce((sum, b) => sum + b.price, 0);

    const proposedAmount = parseFloat(amount);

    if (currentSpend + proposedAmount > limit) {
      audit.log({
        tripId,
        agentName: 'CFO',
        action: `🛑 SPENDING BLOCKED: $${proposedAmount} in ${category}`,
        reasoning: `Category limit: $${limit}. Already spent: $${currentSpend}. Proposed: $${proposedAmount}. Would exceed by $${(currentSpend + proposedAmount - limit).toFixed(2)}`,
        severity: 'error',
      });

      return res.status(403).json({
        error: 'Spending limit exceeded',
        category,
        limit,
        currentSpend,
        proposedAmount,
        deficit: currentSpend + proposedAmount - limit,
      });
    }

    // Check total budget
    if (trip.totalSpent + proposedAmount > trip.totalBudget) {
      audit.log({
        tripId,
        agentName: 'CFO',
        action: `🛑 TOTAL BUDGET BLOCKED: $${proposedAmount}`,
        reasoning: `Total budget: $${trip.totalBudget}. Spent: $${trip.totalSpent}. Proposed: $${proposedAmount}`,
        severity: 'error',
      });

      return res.status(403).json({
        error: 'Total budget exceeded',
        totalBudget: trip.totalBudget,
        totalSpent: trip.totalSpent,
        proposedAmount,
      });
    }

    next();
  };
}
