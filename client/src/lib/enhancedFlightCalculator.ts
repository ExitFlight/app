import { format, addMinutes } from 'date-fns';
import { toZonedTime, formatInTimeZone } from 'date-fns-tz';

// Airport coordinates with latitude and longitude
const airportCoordinates: { [code: string]: { lat: number; lon: number } } = {
  // North America
  'JFK': { lat: 40.6413, lon: -73.7781 }, // New York
  'LAX': { lat: 33.9416, lon: -118.4085 }, // Los Angeles
  'ORD': { lat: 41.9742, lon: -87.9073 }, // Chicago
  'DFW': { lat: 32.8998, lon: -97.0403 }, // Dallas
  'MIA': { lat: 25.7932, lon: -80.2906 }, // Miami
  'SFO': { lat: 37.6213, lon: -122.3790 }, // San Francisco
  'SEA': { lat: 47.4502, lon: -122.3088 }, // Seattle
  'YYZ': { lat: 43.6777, lon: -79.6248 }, // Toronto
  'YVR': { lat: 49.1967, lon: -123.1815 }, // Vancouver
  'YYC': { lat: 51.1215, lon: -114.0076 }, // Calgary
  'ANC': { lat: 61.1743, lon: -149.9962 }, // Anchorage
  'MEX': { lat: 19.4363, lon: -99.0721 }, // Mexico City
  
  // Europe
  'LHR': { lat: 51.4700, lon: -0.4543 }, // London
  'CDG': { lat: 49.0097, lon: 2.5479 }, // Paris
  'FRA': { lat: 50.0379, lon: 8.5622 }, // Frankfurt
  'AMS': { lat: 52.3105, lon: 4.7683 }, // Amsterdam
  'MAD': { lat: 40.4983, lon: -3.5676 }, // Madrid
  'FCO': { lat: 41.8003, lon: 12.2389 }, // Rome
  'ZRH': { lat: 47.4582, lon: 8.5555 }, // Zurich
  
  // Northern Europe
  'DUB': { lat: 53.4264, lon: -6.2499 }, // Dublin
  'ARN': { lat: 59.6498, lon: 17.9237 }, // Stockholm
  'CPH': { lat: 55.6180, lon: 12.6508 }, // Copenhagen
  'OSL': { lat: 60.1975, lon: 11.1004 }, // Oslo
  'HEL': { lat: 60.3172, lon: 24.9633 }, // Helsinki
  'KEF': { lat: 63.9850, lon: -22.6056 }, // Reykjavík
  'TLL': { lat: 59.4133, lon: 24.8327 }, // Tallinn
  'RIX': { lat: 56.9236, lon: 23.9711 }, // Riga
  
  // Asia
  'HND': { lat: 35.5494, lon: 139.7798 }, // Tokyo Haneda
  'NRT': { lat: 35.7719, lon: 140.3929 }, // Tokyo Narita
  'PEK': { lat: 40.0725, lon: 116.5974 }, // Beijing
  'PVG': { lat: 31.1443, lon: 121.8083 }, // Shanghai
  'HKG': { lat: 22.3080, lon: 113.9185 }, // Hong Kong
  'SIN': { lat: 1.3644, lon: 103.9915 }, // Singapore
  'BKK': { lat: 13.6900, lon: 100.7501 }, // Bangkok
  'DMK': { lat: 13.9132, lon: 100.6071 }, // Bangkok Don Mueang
  'HKT': { lat: 8.1132, lon: 98.3169 }, // Phuket
  'CNX': { lat: 18.7669, lon: 98.9625 }, // Chiang Mai
  'USM': { lat: 9.5478, lon: 100.0623 }, // Koh Samui
  'KBV': { lat: 8.0990, lon: 98.9862 }, // Krabi
  'CEI': { lat: 19.9522, lon: 99.8828 }, // Chiang Rai
  'ICN': { lat: 37.4602, lon: 126.4407 }, // Seoul
  'GMP': { lat: 37.5586, lon: 126.7944 }, // Seoul Gimpo
  'DEL': { lat: 28.5562, lon: 77.1000 }, // Delhi
  'BOM': { lat: 19.0896, lon: 72.8656 }, // Mumbai
  
  // Australia/Oceania
  'SYD': { lat: -33.9399, lon: 151.1753 }, // Sydney
  'MEL': { lat: -37.6690, lon: 144.8410 }, // Melbourne
  'BNE': { lat: -27.3942, lon: 153.1218 }, // Brisbane
  'PER': { lat: -31.9385, lon: 115.9672 }, // Perth
  'AKL': { lat: -37.0082, lon: 174.7850 }, // Auckland
  'CHC': { lat: -43.4864, lon: 172.5369 }, // Christchurch
  'NAN': { lat: -17.7553, lon: 177.4431 }, // Fiji Nadi
  'POM': { lat: -9.4438, lon: 147.2200 }, // Port Moresby
  
  // Middle East
  'DXB': { lat: 25.2532, lon: 55.3657 }, // Dubai
  'DOH': { lat: 25.2609, lon: 51.6138 }, // Doha
  'AUH': { lat: 24.4330, lon: 54.6511 }, // Abu Dhabi
  'RUH': { lat: 24.9578, lon: 46.6989 }, // Riyadh
  
  // South America
  'GRU': { lat: -23.4307, lon: -46.4697 }, // São Paulo
  'EZE': { lat: -34.8222, lon: -58.5358 }, // Buenos Aires
  'BOG': { lat: 4.7016, lon: -74.1469 }, // Bogotá
  'SCL': { lat: -33.3930, lon: -70.7947 }, // Santiago
  'LIM': { lat: -12.0219, lon: -77.1143 }, // Lima
  
  // Africa
  'JNB': { lat: -26.1367, lon: 28.2411 }, // Johannesburg
  'CPT': { lat: -33.9649, lon: 18.6019 }, // Cape Town
  'CAI': { lat: 30.1114, lon: 31.4139 }, // Cairo
  'NBO': { lat: -1.3192, lon: 36.9278 }, // Nairobi
  'LOS': { lat: 6.5774, lon: 3.3214 }, // Lagos
  'ACC': { lat: 5.6052, lon: -0.1718 }, // Accra
};

// Airport timezones by IATA code
const airportTimezones: { [code: string]: string } = {
  // North America
  'JFK': 'America/New_York',
  'LAX': 'America/Los_Angeles',
  'ORD': 'America/Chicago',
  'DFW': 'America/Chicago',
  'MIA': 'America/New_York',
  'SFO': 'America/Los_Angeles',
  'SEA': 'America/Los_Angeles',
  'ANC': 'America/Anchorage',
  'YYZ': 'America/Toronto',
  'YVR': 'America/Vancouver',
  'YYC': 'America/Edmonton',
  'MEX': 'America/Mexico_City',
  
  // Europe
  'LHR': 'Europe/London',
  'CDG': 'Europe/Paris',
  'FRA': 'Europe/Berlin',
  'AMS': 'Europe/Amsterdam',
  'MAD': 'Europe/Madrid',
  'FCO': 'Europe/Rome',
  'ZRH': 'Europe/Zurich',
  
  // Northern Europe
  'DUB': 'Europe/Dublin',
  'ARN': 'Europe/Stockholm',
  'CPH': 'Europe/Copenhagen',
  'OSL': 'Europe/Oslo',
  'HEL': 'Europe/Helsinki',
  'KEF': 'Atlantic/Reykjavik',
  'TLL': 'Europe/Tallinn',
  'RIX': 'Europe/Riga',
  'VNO': 'Europe/Vilnius',
  
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

/**
 * Calculate the distance between two coordinates using the Haversine formula
 * @param lat1 Latitude of first point in degrees
 * @param lon1 Longitude of first point in degrees
 * @param lat2 Latitude of second point in degrees
 * @param lon2 Longitude of second point in degrees
 * @returns Distance in kilometers
 */
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
}

/**
 * Convert degrees to radians
 * @param deg Angle in degrees
 * @returns Angle in radians
 */
function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Calculate realistic flight times based on origin and destination coordinates
 * @param originCode Origin airport code
 * @param destCode Destination airport code
 * @param departureDateStr Departure date string in YYYY-MM-DD format
 * @param departureTimeStr Departure time string in HH:mm format
 * @returns Promise resolving to object with duration, departure and arrival times in UTC and local
 */
export async function calculateRealisticFlightTimes(
  originCode: string,
  destCode: string,
  departureDateStr: string = new Date().toISOString().split('T')[0],
  departureTimeStr: string = '09:00'
): Promise<{
  durationMinutes: number;
  departureUTC: Date;
  arrivalUTC: Date;
  departureLocal: Date;
  arrivalLocal: Date;
  distanceKm: number;
}> {
  // Get airport coordinates
  const originCoords = airportCoordinates[originCode];
  const destCoords = airportCoordinates[destCode];
  
  if (!originCoords || !destCoords) {
    throw new Error(`Missing coordinates for ${!originCoords ? originCode : destCode}`);
  }
  
  // Calculate distance using Haversine formula
  const distanceKm = getDistanceFromLatLonInKm(
    originCoords.lat, 
    originCoords.lon, 
    destCoords.lat, 
    destCoords.lon
  );
  
  // Flight parameters
  const cruiseSpeedKmh = 875; // Average cruise speed in km/h
  const baseFlightTimeHours = distanceKm / cruiseSpeedKmh;
  
  // Add buffer time: fixed amount + variable amount depending on flight length
  // - Taxiing: ~20-30 mins (depends on airport)
  // - Takeoff and initial climb: ~15 mins
  // - Approach and landing: ~30-45 mins
  // - Contingency for weather/routing: ~8% of flight time
  const bufferMinutes = 90 + (baseFlightTimeHours * 60 * 0.08);
  
  // Calculate total duration in minutes
  const durationMinutes = Math.round((baseFlightTimeHours * 60) + bufferMinutes);
  
  // Get timezones for origin and destination
  const originTimezone = airportTimezones[originCode] || 'UTC';
  const destTimezone = airportTimezones[destCode] || 'UTC';
  
  // Create departure date with local timezone
  const departureDateTimeStr = `${departureDateStr}T${departureTimeStr}:00`;
  const departureLocal = new Date(departureDateTimeStr);
  
  // Convert to UTC for calculations
  const departureUTC = new Date(
    departureLocal.getTime() - (departureLocal.getTimezoneOffset() * 60000)
  );
  
  // Calculate arrival time in UTC
  const arrivalUTC = addMinutes(departureUTC, durationMinutes);
  
  // Convert arrival time to destination timezone
  const arrivalLocal = toZonedTime(arrivalUTC, destTimezone);
  
  return {
    durationMinutes,
    departureUTC,
    arrivalUTC,
    departureLocal,
    arrivalLocal,
    distanceKm
  };
}

/**
 * Format a duration in minutes to a human-readable string (e.g., "2h 15m")
 * @param minutes Duration in minutes
 * @returns Formatted duration string
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h${mins > 0 ? ` ${mins}m` : ''}`;
}

/**
 * Calculate complete flight details for display
 * @param originCode Origin airport code
 * @param destCode Destination airport code
 * @param departureDateStr Optional departure date string
 * @param departureTimeStr Optional departure time string
 * @returns Promise resolving to formatted flight details
 */
export async function calculateEnhancedFlightDetails(
  originCode: string,
  destCode: string,
  departureDateStr?: string,
  departureTimeStr?: string
): Promise<{
  durationFormatted: string;
  departureTimeLocal: string;
  arrivalTimeLocal: string;
  departureDateLocal: string;
  arrivalDateLocal: string;
  durationMinutes: number;
  departureUTC: Date;
  arrivalUTC: Date;
  distanceKm: number;
}> {
  // Calculate the realistic flight times
  const {
    durationMinutes,
    departureUTC,
    arrivalUTC,
    departureLocal,
    arrivalLocal,
    distanceKm
  } = await calculateRealisticFlightTimes(
    originCode, 
    destCode, 
    departureDateStr, 
    departureTimeStr
  );
  
  // Get the origin and destination timezones
  const originTimezone = airportTimezones[originCode] || 'UTC';
  const destTimezone = airportTimezones[destCode] || 'UTC';
  
  // Format times in local timezones
  const departureTimeLocal = formatInTimeZone(departureUTC, originTimezone, 'HH:mm');
  const departureDateLocal = formatInTimeZone(departureUTC, originTimezone, 'yyyy-MM-dd');
  const arrivalTimeLocal = formatInTimeZone(arrivalUTC, destTimezone, 'HH:mm');
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
    arrivalUTC,
    distanceKm
  };
}