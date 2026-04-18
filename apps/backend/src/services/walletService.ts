import { AuditLogger } from './auditLogger';

// ─── Dummy Locus API Configuration ──────────────────────────
// Replace these with real credentials from Phase 0 registration

const LOCUS_API_BASE = process.env.LOCUS_API_BASE || 'https://beta-api.paywithlocus.com/api';
const LOCUS_API_KEY = process.env.LOCUS_API_KEY || 'claw_dev_DUMMY_KEY';

const audit = AuditLogger.getInstance();

// ─── Wallet Service ──────────────────────────────────────────

export interface WalletBalance {
  balanceUsdc: string;
  walletAddress: string;
  chain: string;
}

export interface SubwalletInfo {
  subwalletAddress: string;
  balance: string;
  disburseBefore: number;
  isActive: boolean;
}

/**
 * Get the current wallet balance
 * Endpoint: GET /api/pay/balance
 */
export async function getBalance(tripId?: string): Promise<WalletBalance> {
  if (tripId) {
    audit.log({
      tripId,
      agentName: 'CFO',
      action: 'Checking wallet balance',
      reasoning: 'Need to verify funds before proceeding',
      apiProvider: 'locus',
      apiCost: 0,
      severity: 'info',
    });
  }

  // DUMMY: Return mock balance for development
  // TODO: Replace with real API call
  // const res = await fetch(`${LOCUS_API_BASE}/pay/balance`, {
  //   headers: { 'Authorization': `Bearer ${LOCUS_API_KEY}` }
  // });
  // return await res.json();

  return {
    balanceUsdc: '10.00',
    walletAddress: '0xDUMMY_WALLET_ADDRESS',
    chain: 'base',
  };
}

/**
 * Send USDC to an address
 * Endpoint: POST /api/pay/send
 */
export async function sendPayment(
  to: string,
  amount: string,
  tripId: string,
  reason: string
): Promise<{ txHash: string; amount: string }> {
  audit.log({
    tripId,
    agentName: 'Booking',
    action: `Sending $${amount} USDC to ${to.slice(0, 10)}...`,
    reasoning: reason,
    apiProvider: 'locus',
    apiCost: 0,
    severity: 'info',
  });

  // DUMMY: Return mock transaction
  // TODO: Replace with real API call
  // const res = await fetch(`${LOCUS_API_BASE}/pay/send`, {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${LOCUS_API_KEY}`,
  //     'Content-Type': 'application/json'
  //   },
  //   body: JSON.stringify({ to, amount })
  // });

  const txHash = `0xDUMMY_TX_${Date.now().toString(16)}`;

  audit.log({
    tripId,
    agentName: 'Booking',
    action: `Payment of $${amount} confirmed`,
    reasoning: `Transaction hash: ${txHash}`,
    txHash,
    severity: 'success',
  });

  return { txHash, amount };
}

/**
 * Send USDC via email escrow
 * Endpoint: POST /api/pay/send-email
 */
export async function sendViaEmail(
  email: string,
  amount: string,
  tripId: string,
  message: string
): Promise<{ txHash: string; subwalletAddress: string }> {
  audit.log({
    tripId,
    agentName: 'Delivery',
    action: `Sending $${amount} via email escrow to ${email}`,
    reasoning: message,
    apiProvider: 'locus',
    apiCost: 0,
    severity: 'info',
  });

  // DUMMY
  return {
    txHash: `0xDUMMY_EMAIL_TX_${Date.now().toString(16)}`,
    subwalletAddress: `0xDUMMY_SUBWALLET_${Date.now().toString(16)}`,
  };
}

/**
 * Create a funded subwallet (trip escrow)
 * On-chain: createAndFundSubwalletUSDC(amount, disburseBefore)
 */
export async function createSubwallet(
  amount: string,
  disburseBefore: number,
  tripId: string
): Promise<SubwalletInfo> {
  audit.log({
    tripId,
    agentName: 'CFO',
    action: `Creating trip escrow subwallet with $${amount}`,
    reasoning: `Funds locked until ${new Date(disburseBefore * 1000).toISOString()}. Auto-reclaim after deadline.`,
    apiProvider: 'locus',
    apiCost: 0,
    severity: 'info',
  });

  // DUMMY
  const subwalletAddress = `0xSUBWALLET_${Date.now().toString(16)}`;

  audit.log({
    tripId,
    agentName: 'CFO',
    action: `Subwallet created: ${subwalletAddress.slice(0, 14)}...`,
    reasoning: 'Trip escrow is now active. Spending controls enforced.',
    severity: 'success',
  });

  return {
    subwalletAddress,
    balance: amount,
    disburseBefore,
    isActive: true,
  };
}

/**
 * Reclaim subwallet funds (trip cancellation)
 */
export async function reclaimSubwallet(
  subwalletAddress: string,
  tripId: string
): Promise<{ txHash: string }> {
  audit.log({
    tripId,
    agentName: 'CFO',
    action: `Reclaiming funds from subwallet ${subwalletAddress.slice(0, 14)}...`,
    reasoning: 'Trip cancelled or deadline passed. Returning funds to main wallet.',
    apiProvider: 'locus',
    apiCost: 0,
    severity: 'warning',
  });

  return {
    txHash: `0xDUMMY_RECLAIM_${Date.now().toString(16)}`,
  };
}
