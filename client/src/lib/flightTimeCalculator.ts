import { format, addMinutes, setHours, setMinutes, setSeconds } from 'date-fns';
import { toZonedTime, formatInTimeZone } from 'date-fns-tz';

// Example timezone data by airport code
const airportTimezones: Record<string, string> = {
  // North America
  'JFK': 'America/New_York',
  'LAX': 'America/Los_Angeles',
  'ORD': 'America/Chicago',
  'DFW': 'America/Chicago',
  'MIA': 'America/New_York',
  'YYZ': 'America/Toronto',
  'MEX': 'America/Mexico_City',
  
  // Europe
  'LHR': 'Europe/London',
  'CDG': 'Europe/Paris',
  'FRA': 'Europe/Berlin',
  'AMS': 'Europe/Amsterdam',
  'MAD': 'Europe/Madrid',
  'FCO': 'Europe/Rome',
  'ZRH': 'Europe/Zurich',
  
  // Asia
  'HND': 'Asia/Tokyo',
  'NRT': 'Asia/Tokyo',
  'PEK': 'Asia/Shanghai',
  'PVG': 'Asia/Shanghai',
  'HKG': 'Asia/Hong_Kong',
  'SIN': 'Asia/Singapore',
  'BKK': 'Asia/Bangkok',
  'DMK': 'Asia/Bangkok',
  'HKT': 'Asia/Bangkok',
  'CNX': 'Asia/Bangkok',
  'USM': 'Asia/Bangkok',
  'KBV': 'Asia/Bangkok',
  'CEI': 'Asia/Bangkok',
  'ICN': 'Asia/Seoul',
  'GMP': 'Asia/Seoul',
  'DEL': 'Asia/Kolkata',
  'BOM': 'Asia/Kolkata',
  
  // Australia/Oceania
  'SYD': 'Australia/Sydney',
  'MEL': 'Australia/Melbourne',
  'BNE': 'Australia/Brisbane',
  'PER': 'Australia/Perth',
  'AKL': 'Pacific/Auckland',
  'CHC': 'Pacific/Auckland',
  'NAN': 'Pacific/Fiji',
  'POM': 'Pacific/Port_Moresby',
  
  // Middle East
  'DXB': 'Asia/Dubai',
  'DOH': 'Asia/Qatar',
  'AUH': 'Asia/Dubai',
  'RUH': 'Asia/Riyadh',
  
  // South America
  'GRU': 'America/Sao_Paulo',
  'EZE': 'America/Argentina/Buenos_Aires',
  'BOG': 'America/Bogota',
  'SCL': 'America/Santiago',
  'LIM': 'America/Lima',
  
  // Africa
  'JNB': 'Africa/Johannesburg',
  'CPT': 'Africa/Johannesburg',
  'CAI': 'Africa/Cairo',
  'NBO': 'Africa/Nairobi',
  'LOS': 'Africa/Lagos',
  'ACC': 'Africa/Accra',
};

// Example flight duration data (in minutes)
// For simplicity, we'll calculate these dynamically but would be a lookup table in a real system
const estimateFlightDuration = (originCode: string, destCode: string): number => {
  // This is a simplified model that approximates flight times
  // Real flight times would depend on aircraft type, weather, routes, etc.
  
  // Using the Haversine formula would be more accurate with actual coordinates,
  // but for this example, we'll use a simple approximation based on region pairs
  
  const getRegion = (code: string): string => {
    // Simple region determination based on airport codes
    if (['JFK', 'LAX', 'ORD', 'DFW', 'MIA', 'YYZ', 'MEX'].includes(code)) return 'NA'; // North America
    if (['LHR', 'CDG', 'FRA', 'AMS', 'MAD', 'FCO', 'ZRH'].includes(code)) return 'EU'; // Europe
    if (['HND', 'NRT', 'PEK', 'PVG', 'HKG', 'SIN', 'BKK', 'ICN', 'DEL', 'BOM'].includes(code)) return 'AS'; // Asia
    if (['SYD', 'MEL', 'BNE', 'PER', 'AKL', 'CHC', 'NAN', 'POM'].includes(code)) return 'OC'; // Oceania
    if (['DXB', 'DOH', 'AUH', 'RUH'].includes(code)) return 'ME'; // Middle East
    if (['GRU', 'EZE', 'BOG', 'SCL', 'LIM'].includes(code)) return 'SA'; // South America
    if (['JNB', 'CPT', 'CAI', 'NBO', 'LOS', 'ACC'].includes(code)) return 'AF'; // Africa
    return 'UN'; // Unknown
  };
  
  const originRegion = getRegion(originCode);
  const destRegion = getRegion(destCode);
  
  // Base duration for typical short-haul flight
  let duration = 120; // 2 hours default
  
  // If same region, adjust by region
  if (originRegion === destRegion) {
    switch (originRegion) {
      case 'NA': duration = 180; break; // North America is large
      case 'EU': duration = 120; break; // Europe is relatively small
      case 'AS': duration = 240; break; // Asia is large
      case 'OC': duration = 180; break; // Australia/Oceania
      case 'ME': duration = 120; break; // Middle East is relatively small
      case 'SA': duration = 210; break; // South America
      case 'AF': duration = 210; break; // Africa is large
      default: duration = 150;
    }
    
    // Add some randomness for variety (±15%)
    const randomFactor = 0.85 + (Math.random() * 0.3);
    duration = Math.round(duration * randomFactor);
    
    return duration;
  }
  
  // If different regions, use a region-pair lookup
  // These are simplified approximations
  const regionPairs: Record<string, number> = {
    'NA-EU': 480,   // North America to Europe
    'EU-NA': 540,   // Europe to North America (jet stream makes westbound flights longer)
    'NA-AS': 780,   // North America to Asia
    'AS-NA': 720,   // Asia to North America
    'NA-OC': 840,   // North America to Oceania
    'OC-NA': 840,   // Oceania to North America
    'NA-ME': 720,   // North America to Middle East
    'ME-NA': 720,   // Middle East to North America
    'NA-SA': 540,   // North America to South America
    'SA-NA': 540,   // South America to North America
    'NA-AF': 720,   // North America to Africa
    'AF-NA': 720,   // Africa to North America
    
    'EU-AS': 600,   // Europe to Asia
    'AS-EU': 600,   // Asia to Europe
    'EU-OC': 1140,  // Europe to Oceania
    'OC-EU': 1140,  // Oceania to Europe
    'EU-ME': 300,   // Europe to Middle East
    'ME-EU': 300,   // Middle East to Europe
    'EU-SA': 720,   // Europe to South America
    'SA-EU': 720,   // South America to Europe
    'EU-AF': 360,   // Europe to Africa
    'AF-EU': 360,   // Africa to Europe
    
    'AS-OC': 540,   // Asia to Oceania
    'OC-AS': 540,   // Oceania to Asia
    'AS-ME': 360,   // Asia to Middle East
    'ME-AS': 360,   // Middle East to Asia
    'AS-SA': 1260,  // Asia to South America
    'SA-AS': 1260,  // South America to Asia
    'AS-AF': 540,   // Asia to Africa
    'AF-AS': 540,   // Africa to Asia
    
    'OC-ME': 840,   // Oceania to Middle East
    'ME-OC': 840,   // Middle East to Oceania
    'OC-SA': 840,   // Oceania to South America
    'SA-OC': 840,   // South America to Oceania
    'OC-AF': 900,   // Oceania to Africa
    'AF-OC': 900,   // Africa to Oceania
    
    'ME-SA': 840,   // Middle East to South America
    'SA-ME': 840,   // South America to Middle East
    'ME-AF': 300,   // Middle East to Africa
    'AF-ME': 300,   // Africa to Middle East
    
    'SA-AF': 660,   // South America to Africa
    'AF-SA': 660,   // Africa to South America
  };
  
  const pairKey = `${originRegion}-${destRegion}`;
  duration = regionPairs[pairKey] || 500; // Default to ~8.5 hours if pair not found
  
  // Add some randomness (±10%)
  const randomFactor = 0.9 + (Math.random() * 0.2);
  duration = Math.round(duration * randomFactor);
  
  return duration;
};

/**
 * Estimates flight times between two airports, generating departure and arrival times in UTC
 * @param originCode Origin airport code (e.g., 'LHR')
 * @param destCode Destination airport code (e.g., 'JFK')
 * @returns Promise resolving to object with duration in minutes, departure time in UTC, and arrival time in UTC
 */
export const estimateFlightTimes = async (
  originCode: string, 
  destCode: string
): Promise<{ durationMinutes: number; departureUTC: Date; arrivalUTC: Date }> => {
  // 1. Look up the origin and destination timezones
  const originTimezone = airportTimezones[originCode] || 'UTC';
  
  // 2. Generate a random departure time in the origin's local timezone (between 6am and 10pm)
  const today = new Date();
  const randomHour = 6 + Math.floor(Math.random() * 16); // 6am to 10pm (22:00)
  const randomMinute = Math.floor(Math.random() * 12) * 5; // 0, 5, 10, 15, ..., 55
  
  // Create a date object with today's date and our random time
  let localDepartureTime = new Date(today);
  localDepartureTime = setHours(localDepartureTime, randomHour);
  localDepartureTime = setMinutes(localDepartureTime, randomMinute);
  localDepartureTime = setSeconds(localDepartureTime, 0);
  
  // 3. Get the estimated flight duration in minutes
  const durationMinutes = estimateFlightDuration(originCode, destCode);
  
  // Since date-fns-tz doesn't have a direct zonedTimeToUtc function, we need to calculate UTC time manually
  // We'll use the local date and calculate the UTC offset
  const departureUTC = new Date(localDepartureTime.getTime() - (localDepartureTime.getTimezoneOffset() * 60000));
  
  // 5. Calculate the arrival time in UTC by adding the duration
  const arrivalUTC = addMinutes(departureUTC, durationMinutes);
  
  // Return the flight information
  return {
    durationMinutes,
    departureUTC,
    arrivalUTC
  };
};

/**
 * Formats a duration in minutes to a human-readable format (e.g., "2h 15m")
 * @param minutes Total duration in minutes
 * @returns Formatted duration string
 */
export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h${mins > 0 ? ` ${mins}m` : ''}`;
};

/**
 * Formats a date to a time string in the specified timezone
 * @param date Date object
 * @param timezone IANA timezone string (e.g., 'America/New_York')
 * @returns Formatted time string (e.g., "14:30")
 */
export const formatTimeInTimezone = (date: Date, timezone: string): string => {
  return formatInTimeZone(date, timezone, 'HH:mm');
};

/**
 * Calculates and formats flight details between two airports
 * @param originCode Origin airport code
 * @param destCode Destination airport code
 * @returns Promise resolving to formatted flight details
 */
export const calculateFlightDetails = async (
  originCode: string,
  destCode: string
): Promise<{
  durationFormatted: string;
  departureTimeLocal: string;
  arrivalTimeLocal: string;
  departureDateLocal: string;
  arrivalDateLocal: string;
  durationMinutes: number;
  departureUTC: Date;
  arrivalUTC: Date;
}> => {
  // Get the timezones for the airports
  const originTimezone = airportTimezones[originCode] || 'UTC';
  const destTimezone = airportTimezones[destCode] || 'UTC';
  
  // Estimate the flight times
  const { durationMinutes, departureUTC, arrivalUTC } = await estimateFlightTimes(originCode, destCode);
  
  // Convert UTC times to local times at origin and destination
  const departureTimeLocal = formatTimeInTimezone(departureUTC, originTimezone);
  const arrivalTimeLocal = formatTimeInTimezone(arrivalUTC, destTimezone);
  
  // Format dates
  const departureDateLocal = formatInTimeZone(departureUTC, originTimezone, 'yyyy-MM-dd');
  const arrivalDateLocal = formatInTimeZone(arrivalUTC, destTimezone, 'yyyy-MM-dd');
  
  // Format the duration
  const durationFormatted = formatDuration(durationMinutes);
  
  return {
    durationFormatted,
    departureTimeLocal,
    arrivalTimeLocal,
    departureDateLocal,
    arrivalDateLocal,
    durationMinutes,
    departureUTC,
    arrivalUTC
  };
};

// Example usage:
// calculateFlightDetails('JFK', 'LHR').then(details => console.log(details));