import { Platform } from 'react-native';

export interface PriceBreakdown {
  basePrice: number;
  guestCount: number;
  duration: number;
  subtotal: number;
  guestFee: number;
  hostFee: number;
  totalFees: number;
  totalPrice: number;
  hostPayout: number;
}

const GUEST_FEE_PERCENTAGE = 0.20; // 20% pour l'invité
const HOST_FEE_PERCENTAGE = 0.11; // 11% pour l'hôte (réduit de 17% à 11%)

export function calculatePricing(
  pricePerHour: number,
  guestCount: number,
  duration: number
): PriceBreakdown {
  // Prix de base
  const basePrice = pricePerHour;
  const subtotal = basePrice * guestCount * duration;

  // Frais invité (20% du sous-total)
  const guestFee = Math.round(subtotal * GUEST_FEE_PERCENTAGE);

  // Frais hôte (11% du sous-total)
  const hostFee = Math.round(subtotal * HOST_FEE_PERCENTAGE);

  // Total des frais
  const totalFees = guestFee + hostFee;

  // Prix total payé par l'invité (prix de base + frais invité)
  const totalPrice = subtotal + guestFee;

  // Montant reversé à l'hôte (prix de base - frais hôte)
  const hostPayout = subtotal - hostFee;

  return {
    basePrice,
    guestCount,
    duration,
    subtotal,
    guestFee,
    hostFee,
    totalFees,
    totalPrice,
    hostPayout
  };
}

export function formatPrice(amount: number): string {
  return Platform.select({
    web: amount.toLocaleString('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }),
    default: `${amount} MAD`
  });
}