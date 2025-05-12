import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a distance in kilometers to a human-readable string
 * @param distanceKm Distance in kilometers
 * @returns Formatted distance string (e.g., "1,500 km")
 */
export function formatDistance(distanceKm: number): string {
  return `${distanceKm.toLocaleString(undefined, { maximumFractionDigits: 0 })} km`
}
