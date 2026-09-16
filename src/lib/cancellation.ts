export interface RefundDetails {
  refundPercent: number;
  refundPaise: number;
  feePaise: number;
}

/**
 * Calculates the refund amount based on how far in advance the cancellation is made.
 * Tiers:
 * - >= 24 hours: 90% refund
 * - 12 to 24 hours: 50% refund
 * - 2 to 12 hours: 25% refund
 * - < 2 hours: 0% refund
 * 
 * @param slotStartTime The start time of the slot being cancelled
 * @param totalPaise The total amount paid in paise
 * @param now The current time (defaults to new Date())
 */
export function calculateRefund(slotStartTime: Date | string, totalPaise: number, now = new Date()): RefundDetails {
  const start = new Date(slotStartTime);
  const hoursUntilSlot = (start.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  let refundPercent = 0;
  
  if (hoursUntilSlot >= 24) {
    refundPercent = 90;
  } else if (hoursUntilSlot >= 12) {
    refundPercent = 50;
  } else if (hoursUntilSlot >= 2) {
    refundPercent = 25;
  } else {
    refundPercent = 0;
  }
  
  const refundPaise = Math.round((totalPaise * refundPercent) / 100);
  const feePaise = totalPaise - refundPaise;
  
  return { refundPercent, refundPaise, feePaise };
}
