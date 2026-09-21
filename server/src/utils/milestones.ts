import type { MilestoneStatus } from '../models/Contract.js';

// Splits a contract's price into four equal phases. Works in whole cents so the
// amounts always add up to the agreed price and can never go negative
// (the last phase absorbs any leftover cent from rounding).
export function defaultMilestones(totalPrice: number) {
  const titles = ['Planning & design', 'Core implementation', 'Testing & revisions', 'Delivery'];
  const totalCents = Math.round(totalPrice * 100);
  const shareCents = Math.floor(totalCents / titles.length);

  return titles.map((title, i) => {
    const cents = i === titles.length - 1 ? totalCents - shareCents * (titles.length - 1) : shareCents;
    return { title, amount: cents / 100, status: 'pending' as MilestoneStatus };
  });
}