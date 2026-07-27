// ✏️ EDITABLE — theme the ads to match this site. Devs own this file.
// You control the LOOK here (radius, border, shadow, background, label color).
// You CANNOT change the ad's shape/fit from here — that stays locked in
// src/lib/ad-slots.ts, so the ad always displays correctly no matter what.

import type { AdSkin } from '@/lib/ads/ad-frame'

// Site-wide default skin — tune to your brand.
export const adSkin: AdSkin = {
  radius: '20px',
  border: '1px solid #e1dcd1',
  shadow: '0 1px 2px rgba(20,22,40,0.05)',
  background: '#ffffff',
  labelClassName: 'bg-[#2c4ce0] text-white',
}

// Optional per-slot overrides — adjust only where you need to.
export const adSkinBySlot: Partial<Record<string, AdSkin>> = {
  sidebar: { radius: '16px', shadow: 'none', border: '1px solid #e1dcd1' },
  popup: { radius: '24px' },
  header: { radius: '24px', background: '#f8f7f3' },
  rail: { radius: '16px' },
  feature: { radius: '24px' },
  interstitial: { radius: '24px', shadow: '0 26px 60px rgba(10,12,26,0.45)' },
  anchor: { radius: '16px', shadow: '0 8px 28px rgba(10,12,26,0.18)' },
}

/** Merge site default + per-slot override for a slot. */
export function skinFor(slot: string): AdSkin {
  return { ...adSkin, ...(adSkinBySlot[slot] ?? {}) }
}
// junior tweak


