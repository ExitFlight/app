import { format, addMinutes, differenceInDays, parse, setHours, setMinutes, setSeconds } from 'date-fns'; // Added setHours, setMinutes, setSeconds, parse
import { toZonedTime, formatInTimeZone } from 'date-fns-tz'; // Still need these for converting UTC back to local and formatting

// Airport coordinates with latitude and longitude
// IMPORTANT: For accurate flight calculations, ensure ALL airports listed here
// have 'latitude' and 'longitude' defined.
const airportCoordinates: { [code: string]: { lat: number; lon: number } } = {
  // North America
  'JFK': { lat: 40.6413, lon: -73.7781 },
  'LAX': { lat: 33.9416, lon: -118.4085 },
  'ATL': { lat: 33.6407, lon: -84.4277 },
  'ORD': { lat: 41.9742, lon: -87.9073 },
  'DFW': { lat: 32.8998, lon: -97.0403 },
  'MIA': { lat: 25.7932, lon: -80.2906 },
  'SFO': { lat: 37.6213, lon: -122.3790 },
  'SEA': { lat: 47.4502, lon: -122.3088 },
  'YYZ': { lat: 43.6777, lon: -79.6248 },
  'YVR': { lat: 49.1967, lon: -123.1815 },
  'YYC': { lat: 51.1215, lon: -114.0076 },
  'ANC': { lat: 61.1743, lon: -149.9962 },
  'MEX': { lat: 19.4363, lon: -99.0721 },
  'HNL': { lat: 21.3245, lon: -157.9251 },
  'LAS': { lat: 36.0840, lon: -115.1536 },
  'DEN': { lat: 39.8561, lon: -104.6737 },
  'OGG': { lat: 20.8968, lon: -156.4329 },
  'LIH': { lat: 21.9761, lon: -159.3389 },
  'KOA': { lat: 19.7388, lon: -156.0456 },
  'CLT': { lat: 35.2140, lon: -80.9431 },
  'IAH': { lat: 29.9902, lon: -95.3368 },
  'EWR': { lat: 40.6925, lon: -74.1687 },
  'IAD': { lat: 38.9531, lon: -77.4565 },
  'DTW': { lat: 42.2124, lon: -83.3534 },
  'MSP': { lat: 44.8848, lon: -93.2223 },
  'SLC': { lat: 40.7884, lon: -111.9778},
  'YUL': { lat: 45.4679, lon: -73.7413 },

  // Europe
  'LHR': { lat: 51.4700, lon: -0.4543 },
  'CDG': { lat: 49.0097, lon: 2.5479 },
  'FRA': { lat: 50.0379, lon: 8.5622 },
  'AMS': { lat: 52.3105, lon: 4.7683 },
  'MAD': { lat: 40.4983, lon: -3.5676 },
  'FCO': { lat: 41.8003, lon: 12.2389 },
  'ZRH': { lat: 47.4582, lon: 8.5555 },
  'MUC': { lat: 48.3537, lon: 11.7861 },
  'IST': { lat: 41.2753, lon: 28.7519 },
  'LIS': { lat: 38.7742, lon: -9.1342 },
  'LGW': { lat: 51.1537, lon: -0.1821 },
  'ORY': { lat: 48.7233, lon: 2.3794 },
  'DME': { lat: 55.4088, lon: 37.9063 },
  'DUB': { lat: 53.4264, lon: -6.2499 },
  'ARN': { lat: 59.6498, lon: 17.9237 },
  'CPH': { lat: 55.6180, lon: 12.6508 },
  'OSL': { lat: 60.1975, lon: 11.1004 },
  'HEL': { lat: 60.3172, lon: 24.9633 },
  'KEF': { lat: 63.9850, lon: -22.6056 },
  'TLL': { lat: 59.4133, lon: 24.8327 },
  'RIX': { lat: 56.9236, lon: 23.9711 },
  'VNO': { lat: 54.6340, lon: 25.2858 },

  // Asia
  //'TPE': { lat: 25.0797, lon: 121.2328 }, // Duplicate TPE, commented out
  'HND': { lat: 35.5494, lon: 139.7798 },
  'NRT': { lat: 35.7719, lon: 140.3929 },
  'PEK': { lat: 40.0725, lon: 116.5974 },
  'PVG': { lat: 31.1443, lon: 121.8083 },
  'HKG': { lat: 22.3080, lon: 113.9185 },
  'SIN': { lat: 1.3644, lon: 103.9915 },
  'BKK': { lat: 13.6900, lon: 100.7501 },
  'DMK': { lat: 13.9132, lon: 100.6071 },
  'HKT': { lat: 8.1132, lon: 98.3169 },
  'CNX': { lat: 18.7669, lon: 98.9625 },
  'USM': { lat: 9.5478, lon: 100.0623 },
  'KBV': { lat: 8.0990, lon: 98.9862 },
  'CEI': { lat: 19.9522, lon: 99.8828 },
  'ICN': { lat: 37.4602, lon: 126.4407 },
  'GMP': { lat: 37.5586, lon: 126.7944 },
  'DEL': { lat: 28.5562, lon: 77.1000 },
  'KIX': { lat: 34.4338, lon: 135.2440 },
  'BOM': { lat: 19.0896, lon: 72.8656 },
  'KUL': { lat: 2.7456, lon: 101.7099 },
  'MNL': { lat: 14.5086, lon: 121.0194 },
  'SGN': { lat: 10.8189, lon: 106.6519 },
  'HAN': { lat: 21.2212, lon: 105.8072 },
  'DPS': { lat: -8.7489, lon: 115.1670 },

  // Australia/Oceania
  'SYD': { lat: -33.9399, lon: 151.1753 },
  'MEL': { lat: -37.6690, lon: 144.8410 },
  'BNE': { lat: -27.3942, lon: 153.1218 },
  'PER': { lat: -31.9385, lon: 115.9672 },
  'AKL': { lat: -37.0082, lon: 174.7850 },
  'CHC': { lat: -43.4864, lon: 172.5369 },
  'NAN': { lat: -17.7553, lon: 177.4431 },
  'POM': { lat: -9.4438, lon: 147.2200 },

  // Middle East
  'DXB': { lat: 25.2532, lon: 55.3657 },
  'DOH': { lat: 25.2609, lon: 51.6138 },
  'AUH': { lat: 24.4330, lon: 54.6511 },
  'RUH': { lat: 24.9578, lon: 46.6989 },

  // South America
  'GRU': { lat: -23.4307, lon: -46.4697 },
  'EZE': { lat: -34.8222, lon: -58.5358 },
  'BOG': { lat: 4.7016, lon: -74.1469 },
  'SCL': { lat: -33.3930, lon: -70.7947 },
  'LIM': { lat: -12.0219, lon: -77.1143 },

  // Africa
  'JNB': { lat: -26.1367, lon: 28.2411 },
  'CPT': { lat: -33.9649, lon: 18.6019 },
  'CAI': { lat: 30.1114, lon: 31.4139 },
  'NBO': { lat: -1.3192, lon: 36.9278 },
  'LOS': { lat: 6.5774, lon: 3.3214 },
  'ACC': { lat: 5.6052, lon: -0.1718 },
  'CMN': { lat: 33.3675, lon: -7.5899 },
  'RAK': { lat: 31.6069, lon: -8.0363 },
  'AGA': { lat: 30.3250, lon: -9.4130 },
  'ADD': { lat: 8.9779, lon: 38.7993 },
};

const airportTimezones: { [code: string]: string } = {
  // North America
  'JFK': 'America/New_York',
  'LAX': 'America/Los_Angeles',
  'ATL': 'America/New_York',
  'ORD': 'America/Chicago',
  'DFW': 'America/Chicago',
  'MIA': 'America/New_York',
  'SFO': 'America/Los_Angeles',
  'SEA': 'America/Los_Angeles',
  'ANC': 'America/Anchorage',
  'YYZ': 'America/Toronto',
  'YVR': 'America/Vancouver',
  'YYC': 'America/Edmonton', // Note: Calgary is Mountain Time
  'MEX': 'America/Mexico_City',
  'HNL': 'Pacific/Honolulu',
  'OGG': 'Pacific/Honolulu',
  'LIH': 'Pacific/Honolulu',
  'KOA': 'Pacific/Honolulu',
  'LAS': 'America/Los_Angeles',
  'DEN': 'America/Denver',
  'CLT': 'America/New_York',
  'IAH': 'America/Chicago',
  'EWR': 'America/New_York',
  'IAD': 'America/New_York',
  'DTW': 'America/Detroit',
  'MSP': 'America/Chicago',
  'SLC': 'America/Denver',
  'YUL': 'America/Toronto',

  // Europe
  'LHR': 'Europe/London',
  'CDG': 'Europe/Paris',
  'FRA': 'Europe/Berlin', // Frankfurt uses CET/CEST
  'AMS': 'Europe/Amsterdam',
  'MAD': 'Europe/Madrid',
  'FCO': 'Europe/Rome',
  'ZRH': 'Europe/Zurich',
  'MUC': 'Europe/Berlin', // Munich uses CET/CEST
  'IST': 'Europe/Istanbul',
  'LIS': 'Europe/Lisbon',
  'LGW': 'Europe/London',
  'ORY': 'Europe/Paris',
  'DME': 'Europe/Moscow',
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
  'TPE': 'Asia/Taipei',
  'HND': 'Asia/Tokyo',
  'NRT': 'Asia/Tokyo',
  'PEK': 'Asia/Shanghai', // Beijing uses China Standard Time
  'PVG': 'Asia/Shanghai', // Shanghai uses China Standard Time
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
  'DEL': 'Asia/Kolkata', // India Standard Time
  'KIX': 'Asia/Tokyo',
  'BOM': 'Asia/Kolkata', // India Standard Time
  'KUL': 'Asia/Kuala_Lumpur',
  'MNL': 'Asia/Manila',
  'SGN': 'Asia/Ho_Chi_Minh',
  'HAN': 'Asia/Hanoi',
  'DPS': 'Asia/Makassar', // Central Indonesia Time

  // Australia/Oceania
  'SYD': 'Australia/Sydney',
  'MEL': 'Australia/Melbourne',
  'BNE': 'Australia/Brisbane', // Brisbane does not observe DST
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
  'CMN': 'Africa/Casablanca',
  'RAK': 'Africa/Casablanca',
  'AGA': 'Africa/Casablanca',
  'ADD': 'Africa/Addis_Ababa',
};

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

export async function calculateRealisticFlightTimes(
  originCode: string,
  destCode: string,
  departureDateStrInput: string = new Date().toISOString().split('T')[0],
  departureTimeStrInput: string = '09:00'
): Promise<{
  durationMinutes: number;
  departureUTC: Date;
  arrivalUTC: Date;
  departureLocal: Date;
  arrivalLocal: Date;
  distanceKm: number;
}> {
  const originCoords = airportCoordinates[originCode];
  const destCoords = airportCoordinates[destCode];

  if (!originCoords) throw new Error(`Missing coordinates for origin airport: ${originCode}`);
  if (!destCoords) throw new Error(`Missing coordinates for destination airport: ${destCode}`);

  const distanceKm = getDistanceFromLatLonInKm(
    originCoords.lat, originCoords.lon, destCoords.lat, destCoords.lon
  );

  const cruiseSpeedKmh = 875;
  const baseFlightTimeHours = distanceKm / cruiseSpeedKmh;
  const bufferMinutes = 36 + (baseFlightTimeHours * 60 * 0.08);
  const durationMinutes = Math.round((baseFlightTimeHours * 60) + bufferMinutes);

  const originTimezone = airportTimezones[originCode];
  const destTimezone = airportTimezones[destCode];

  if (!originTimezone) console.warn(`Missing timezone for origin airport ${originCode}, using UTC as fallback.`);
  if (!destTimezone) console.warn(`Missing timezone for destination airport ${destCode}, using UTC as fallback.`);

  const departureDateToUse = departureDateStrInput || new Date().toISOString().split('T')[0];
  const departureTimeParts = (departureTimeStrInput || '09:00').split(':').map(Number);
  const departureHour = departureTimeParts[0];
  const departureMinute = departureTimeParts[1];

  let departureUTC: Date;
  let departureLocalForReturn: Date;

  try {
    // --- FALLBACK MANUAL UTC CALCULATION ---
    // Create a Date object representing the local departure time
    // We need to parse the date string and set the time components
    // Use parse from date-fns
    let localDepartureDateTime = parse(`${departureDateToUse} ${departureHour}:${departureMinute}`, 'yyyy-MM-dd HH:mm', new Date());

    if (isNaN(localDepartureDateTime.getTime())) {
         throw new Error(`Failed to parse local departure date/time: "${departureDateToUse} ${departureHour}:${departureMinute}"`);
    }

    // Convert local time to UTC using the browser's/system's understanding of the origin timezone offset
    // This is less precise than zonedTimeToUtc but avoids the import issue
    // Note: This relies on the system having correct timezone data for the origin timezone.
    // The getTimezoneOffset() method returns the difference in minutes between UTC and local time.
    // We need to add this offset (converted to milliseconds) to the local time to get UTC.
    const offsetMinutes = localDepartureDateTime.getTimezoneOffset();
    departureUTC = new Date(localDepartureDateTime.getTime() + (offsetMinutes * 60000));
    // --- END FALLBACK MANUAL UTC CALCULATION ---


    // Use toZonedTime to get a Date object representing the local time at origin for return
    // This function should still work even if zonedTimeToUtc is problematic
    departureLocalForReturn = toZonedTime(departureUTC, originTimezone || 'UTC');
     if (isNaN(departureLocalForReturn.getTime())) { // Should not happen if departureUTC is valid
      throw new Error('toZonedTime for departureLocalForReturn resulted in Invalid Date.');
    }

  } catch(e) {
    console.error(
      "Error processing departure time:", e,
      "\nInput string for local parse:", `${departureDateToUse} ${departureHour}:${departureMinute}`,
      "\nOrigin timezone:", originTimezone
    );
    throw new Error(`Failed to process departure time "${departureDateToUse} ${departureTimeStrInput}" in timezone "${originTimezone || 'UTC'}". Original error: ${e instanceof Error ? e.message : String(e)}`);
  }

  // Calculate the arrival time in UTC by adding the duration
  const arrivalUTC = addMinutes(departureUTC, durationMinutes);

  if (isNaN(arrivalUTC.getTime())) {
    throw new Error('Calculation of arrivalUTC resulted in Invalid Date.');
  }

  let arrivalLocalForReturn: Date;
  try {
    // Convert UTC arrival time back to local time using toZonedTime
    arrivalLocalForReturn = toZonedTime(arrivalUTC, destTimezone || 'UTC');
    if (isNaN(arrivalLocalForReturn.getTime())) {
        throw new Error('toZonedTime for arrival resulted in Invalid Date.');
    }
  } catch(e) {
    console.error("Error in toZonedTime for arrival:", e);
    throw new Error(`Failed to convert arrival time to local using timezone: ${destTimezone || 'UTC'}. Original error: ${e instanceof Error ? e.message : String(e)}`);
  }

  return {
    durationMinutes,
    departureUTC,
    arrivalUTC,
    departureLocal: departureLocalForReturn,
    arrivalLocal: arrivalLocalForReturn,
    distanceKm
  };
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h${mins > 0 ? ` ${mins}m` : ''}`;
}

export function calculateTimezoneDifference(timezone1: string, timezone2: string): number {
  const referenceDate = new Date();
  // Get the UTC offset for each timezone at this current moment
  // This approach is simpler but might not be accurate for historical dates or DST transitions
  // A more robust way is to format a known UTC time into each zone and compare.

  // For a more robust offset calculation:
  // Use toZonedTime to get Date objects representing the same instant in different timezones
  const nowInTz1 = toZonedTime(referenceDate, timezone1);
  const nowInTz2 = toZonedTime(referenceDate, timezone2);

  // The difference in their UTC timestamps gives the timezone offset difference
  const offsetDifferenceMs = nowInTz2.getTime() - nowInTz1.getTime();

  return offsetDifferenceMs / (1000 * 60 * 60); // Difference in hours
}

export function formatTimezoneDifference(hoursDiff: number): string {
  const sign = hoursDiff >= 0 ? '+' : '-';
  const absDiff = Math.abs(hoursDiff);
  const hours = Math.floor(absDiff);
  const minutes = Math.round((absDiff - hours) * 60);

  if (minutes === 0) {
    return `${sign}${hours}h`;
  } else {
    return `${sign}${hours}h ${minutes}m`;
  }
}

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
  timezoneDifference: string;
  dayChange: number;
  exitDay: string;
}> {
  const {
    durationMinutes,
    departureUTC,
    arrivalUTC,
    distanceKm,
    departureLocal, // Get the local date object from calculateRealisticFlightTimes
    arrivalLocal // Get the local date object from calculateRealisticFlightTimes
  } = await calculateRealisticFlightTimes(
    originCode,
    destCode,
    departureDateStr,
    departureTimeStr
  );

  const originTimezone = airportTimezones[originCode] || 'UTC';
  const destTimezone = airportTimezones[destCode] || 'UTC';

  if (!departureUTC || isNaN(departureUTC.getTime())) {
    throw new Error("[CalcEFD] calculateRealisticFlightTimes returned an invalid departureUTC date.");
  }
  if (!arrivalUTC || isNaN(arrivalUTC.getTime())) {
    throw new Error("[CalcEFD] calculateRealisticFlightTimes returned an invalid arrivalUTC date.");
  }

  // Use formatInTimeZone directly
  const departureTimeLocalStr = formatInTimeZone(departureUTC, originTimezone, 'HH:mm');
  const departureDateLocalStr = formatInTimeZone(departureUTC, originTimezone, 'yyyy-MM-dd');
  const arrivalTimeLocalStr = formatInTimeZone(arrivalUTC, destTimezone, 'HH:mm');
  const arrivalDateLocalStr = formatInTimeZone(arrivalUTC, destTimezone, 'yyyy-MM-dd');

  const tzDiffHours = calculateTimezoneDifference(originTimezone, destTimezone);
  const timezoneDifference = formatTimezoneDifference(tzDiffHours);

  // Calculate day change using the local date objects returned by calculateRealisticFlightTimes
  // This is more reliable than parsing strings again
  const dayChange = differenceInDays(arrivalLocal, departureLocal);

  // Use formatInTimeZone directly
  const exitDay = formatInTimeZone(arrivalUTC, destTimezone, 'EEEE');
  const durationFormatted = formatDuration(durationMinutes);

  return {
    durationFormatted,
    departureTimeLocal: departureTimeLocalStr,
    arrivalTimeLocal: arrivalTimeLocalStr,
    departureDateLocal: departureDateLocalStr,
    arrivalDateLocal: arrivalDateLocalStr,
    durationMinutes,
    departureUTC,
    arrivalUTC,
    distanceKm,
    timezoneDifference,
    dayChange,
    exitDay
  };
}
