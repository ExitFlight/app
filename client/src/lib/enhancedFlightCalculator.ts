import { format, addMinutes, differenceInDays, parse, setHours, setMinutes, setSeconds } from 'date-fns';
// Import toZonedTime, formatInTimeZone, AND getTimezoneOffset (aliased) from date-fns-tz
import { toZonedTime, formatInTimeZone, getTimezoneOffset as getIANATimezoneOffset } from 'date-fns-tz';

// Airport coordinates (ensure all airports used have lat/lon)
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
  'DAD': { lat: 16.0439, lon: 108.1992 }, // Da Nang
  'PKX': { lat: 39.5093, lon: 116.4103 }, // Beijing Daxing
  'TSA': { lat: 25.0691, lon: 121.5526 }, // Taipei Songshan
  'KHH': { lat: 22.5771, lon: 120.3499 }, // Kaohsiung
  'PQC': { lat: 10.1698, lon: 103.9934 }, // Phu Quoc
  'CXR': { lat: 11.9981, lon: 109.2193 }, // Nha Trang (Cam Ranh)
  'REP': { lat: 13.4108, lon: 103.8128 }, // Siem Reap
  'PNH': { lat: 11.5465, lon: 104.8441 }, // Phnom Penh
  'KOS': { lat: 10.5798, lon: 103.6347 }, // Sihanoukville
  'VTE': { lat: 17.9884, lon: 102.5633 }, // Vientiane
  'LPQ': { lat: 19.8978, lon: 102.1614 }, // Luang Prabang
  'RGN': { lat: 16.9073, lon: 96.1332 }, // Yangon
  'MDL': { lat: 21.7022, lon: 95.9780 }, // Mandalay
  'CGK': { lat: -6.1256, lon: 106.6559 }, // Jakarta Soekarno-Hatta
  'SUB': { lat: -7.3797, lon: 112.7868 }, // Surabaya
  'UPG': { lat: -5.0617, lon: 119.5542 }, // Makassar
  'DJJ': { lat: -2.5769, lon: 140.5169 }, // Jayapura
  'PEN': { lat: 5.2971, lon: 100.2767 }, // Penang
  'BKI': { lat: 5.9351, lon: 116.0500 }, // Kota Kinabalu
  'CEB': { lat: 10.3075, lon: 123.9789 }, // Cebu
  'MAA': { lat: 12.9901, lon: 80.1696 }, // Chennai
  'MLE': { lat: 4.2010, lon: 73.5290 },   // Malé
  'GAN': { lat: -0.6936, lon: 73.1556 },   // Gan Island

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
  'CGH': { lat: -23.6261, lon: -46.6564 }, // São Paulo Congonhas
  'GIG': { lat: -22.8100, lon: -43.2505 }, // Rio de Janeiro Galeão
  'SDU': { lat: -22.9105, lon: -43.1631 }, // Rio de Janeiro Santos Dumont
  'AEP': { lat: -34.5592, lon: -58.4156 }, // Buenos Aires Aeroparque
  'CCS': { lat: 10.6031, lon: -66.9906 }, // Caracas
  'UIO': { lat: -0.1292, lon: -78.3575 }, // Quito
  'GYE': { lat: -2.1575, lon: -79.8836 }, // Guayaquil
  'MVD': { lat: -34.8383, lon: -56.0308 }, // Montevideo
  'ASU': { lat: -25.2397, lon: -57.5192 }, // Asunción
  'VVI': { lat: -17.6448, lon: -63.1354 }, // Santa Cruz Viru Viru
  'LPB': { lat: -16.5134, lon: -68.1724 }, // La Paz
  'CUZ': { lat: -13.5357, lon: -71.9388 }, // Cusco
  'CTG': { lat: 10.4424, lon: -75.5129 }, // Cartagena
  'CNF': { lat: -19.6244, lon: -43.9719 }, // Belo Horizonte
  'FLN': { lat: -27.6706, lon: -48.5470 }, // Florianópolis

  // Central America & Caribbean - Add if these are in your UI dropdowns
  'PTY': { lat: 9.0713, lon: -79.3835 },   // Panama City Tocumen
  'SJO': { lat: 9.9939, lon: -84.2088 },   // San José, Costa Rica
  'PUJ': { lat: 18.5675, lon: -68.3634 },   // Punta Cana

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
  'DUR': { lat: -29.6142, lon: 31.1194 }, // Durban
  'PLZ': { lat: -33.9849, lon: 25.6173 }, // Port Elizabeth
  'FEZ': { lat: 33.9272, lon: -4.9779 },   // Fez
  'TNG': { lat: 35.7269, lon: -5.9169 },   // Tangier
  'ALG': { lat: 36.6910, lon: 3.2154 },   // Algiers
  'TUN': { lat: 36.8510, lon: 10.2272 },   // Tunis
  'DKR': { lat: 14.7397, lon: -17.4901 }, // Dakar
  'DAR': { lat: -6.8781, lon: 39.2026 }, // Dar es Salaam
  'EBB': { lat: 0.0424, lon: 32.4436 },   // Entebbe
  'SEZ': { lat: -4.6744, lon: 55.5219 }, // Seychelles
  'MRU': { lat: -20.4302, lon: 57.6830 }  // Mauritius
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
  'YYC': 'America/Edmonton',
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
  'FRA': 'Europe/Berlin',
  'AMS': 'Europe/Amsterdam',
  'MAD': 'Europe/Madrid',
  'FCO': 'Europe/Rome',
  'ZRH': 'Europe/Zurich',
  'MUC': 'Europe/Berlin',
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
  'KIX': 'Asia/Tokyo',
  'BOM': 'Asia/Kolkata',
  'KUL': 'Asia/Kuala_Lumpur',
  'MNL': 'Asia/Manila',
  'SGN': 'Asia/Ho_Chi_Minh',
  'HAN': 'Asia/Hanoi',
  'DPS': 'Asia/Makassar',
  'DAD': 'Asia/Ho_Chi_Minh', // Da Nang
  'PKX': 'Asia/Shanghai',    // Beijing Daxing
  'TSA': 'Asia/Taipei',      // Taipei Songshan
  'KHH': 'Asia/Taipei',      // Kaohsiung
  'PQC': 'Asia/Ho_Chi_Minh', // Phu Quoc
  'CXR': 'Asia/Ho_Chi_Minh', // Nha Trang (Cam Ranh)
  'REP': 'Asia/Bangkok',     // Siem Reap (Cambodia uses ICT, same as Bangkok)
  'PNH': 'Asia/Bangkok',     // Phnom Penh
  'KOS': 'Asia/Bangkok',     // Sihanoukville
  'VTE': 'Asia/Vientiane',   // Vientiane
  'LPQ': 'Asia/Vientiane',   // Luang Prabang
  'RGN': 'Asia/Yangon',      // Yangon
  'MDL': 'Asia/Yangon',      // Mandalay
  'CGK': 'Asia/Jakarta',     // Jakarta
  'SUB': 'Asia/Jakarta',     // Surabaya
  'UPG': 'Asia/Makassar',    // Makassar
  'DJJ': 'Asia/Jayapura',    // Jayapura
  'PEN': 'Asia/Kuala_Lumpur',// Penang
  'BKI': 'Asia/Kuching',     // Kota Kinabalu (East Malaysia timezone)
  'CEB': 'Asia/Manila',      // Cebu
  'MAA': 'Asia/Kolkata',     // Chennai
  'MLE': 'Indian/Maldives',  // Malé
  'GAN': 'Indian/Maldives',  // Gan Island

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
  'CGH': 'America/Sao_Paulo', // São Paulo Congonhas
  'GIG': 'America/Sao_Paulo', // Rio de Janeiro Galeão
  'SDU': 'America/Sao_Paulo', // Rio de Janeiro Santos Dumont
  'AEP': 'America/Argentina/Buenos_Aires', // Buenos Aires Aeroparque
  'CCS': 'America/Caracas',   // Caracas
  'UIO': 'America/Guayaquil', // Quito (Ecuador uses Guayaquil TZ for mainland)
  'GYE': 'America/Guayaquil', // Guayaquil
  'MVD': 'America/Montevideo',// Montevideo
  'ASU': 'America/Asuncion',  // Asunción
  'VVI': 'America/La_Paz',    // Santa Cruz Viru Viru (Bolivia uses La Paz TZ)
  'LPB': 'America/La_Paz',    // La Paz
  'CUZ': 'America/Lima',      // Cusco
  'CTG': 'America/Bogota',    // Cartagena
  'CNF': 'America/Sao_Paulo', // Belo Horizonte
  'FLN': 'America/Sao_Paulo', // Florianópolis

  // Central America & Caribbean
  'PTY': 'America/Panama',
  'SJO': 'America/Costa_Rica',
  'PUJ': 'America/Santo_Domingo',

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
  'DUR': 'Africa/Johannesburg', // Durban
  'PLZ': 'Africa/Johannesburg', // Port Elizabeth
  'FEZ': 'Africa/Casablanca',   // Fez
  'TNG': 'Africa/Casablanca',   // Tangier
  'ALG': 'Africa/Algiers',    // Algiers
  'TUN': 'Africa/Tunis',      // Tunis
  'DKR': 'Africa/Dakar',      // Dakar
  'DAR': 'Africa/Dar_es_Salaam', // Dar es Salaam
  'EBB': 'Africa/Kampala',    // Entebbe (Uganda uses EAT, same as Nairobi/Dar)
  'SEZ': 'Indian/Mahe',       // Seychelles
  'MRU': 'Indian/Mauritius'   // Mauritius
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
  departureTimeStrInput: string = '09:00' // Expected format "HH:mm"
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

  const originTimezone = airportTimezones[originCode] || 'UTC';
  const destTimezone = airportTimezones[destCode] || 'UTC';

  if (!originTimezone) console.warn(`Missing timezone for origin airport ${originCode}, using UTC as fallback.`);
  if (!destTimezone) console.warn(`Missing timezone for destination airport ${destCode}, using UTC as fallback.`);

  const departureDateToUse = departureDateStrInput || new Date().toISOString().split('T')[0];

  let departureUTC: Date;
  let departureLocalForReturn: Date;

  try {
    // Construct the local departure time string in a full ISO-like format for parsing
    const departureLocalWallTimeString = `${departureDateToUse}T${departureTimeStrInput}:00`; // e.g., "2025-05-20T04:40:00"
    
    // Parse this string to get a naive Date object (it will have the correct Y,M,D,H,M numbers, but in host timezone)
    const naiveParsedDate = parse(departureLocalWallTimeString, "yyyy-MM-dd'T'HH:mm:ss", new Date());

    if (isNaN(naiveParsedDate.getTime())) {
        throw new Error(`Could not parse input date/time for UTC conversion: "${departureLocalWallTimeString}"`);
    }

    // Get the offset for the origin timezone AT THE TIME of the naiveParsedDate
    // date-fns-tz getTimezoneOffset returns the offset in milliseconds.
    // This offset is what you *add* to a UTC time to get the wall time in that zone.
    // Therefore, to get UTC from a wall time, you *subtract* this offset from the wall time (when treated as UTC).
    const originOffsetMilliseconds = getIANATimezoneOffset(originTimezone, naiveParsedDate);

    // Create a UTC date using the numerical components from naiveParsedDate,
    // then adjust it by the origin timezone's offset to get the true UTC time.
    // Date.UTC() treats its arguments as UTC components and returns a UTC millisecond timestamp.
    const utcMsFromNaiveComponents = Date.UTC(
        naiveParsedDate.getFullYear(),
        naiveParsedDate.getMonth(), // Month is 0-indexed for Date.UTC
        naiveParsedDate.getDate(),
        naiveParsedDate.getHours(),
        naiveParsedDate.getMinutes(),
        naiveParsedDate.getSeconds(), 
        naiveParsedDate.getMilliseconds() 
    );
    departureUTC = new Date(utcMsFromNaiveComponents - originOffsetMilliseconds);

    // departureLocalForReturn is essentially departureUTC "viewed" in the origin timezone.
    // toZonedTime(departureUTC, originTimezone) will give a Date object that, when formatted
    // in originTimezone, will show the original input local time.
    departureLocalForReturn = toZonedTime(departureUTC, originTimezone);

     if (isNaN(departureLocalForReturn.getTime())) {
      throw new Error('toZonedTime for departureLocalForReturn resulted in Invalid Date.');
    }

  } catch(e) {
    console.error(
      "Error processing departure time:", e,
      "\nInput date string:", departureDateToUse,
      "\nInput time string:", departureTimeStrInput,
      "\nOrigin timezone:", originTimezone
    );
    throw new Error(`Failed to process departure time "${departureDateToUse} ${departureTimeStrInput}" in timezone "${originTimezone}". Original error: ${e instanceof Error ? e.message : String(e)}`);
  }

  const arrivalUTC = addMinutes(departureUTC, durationMinutes);

  if (isNaN(arrivalUTC.getTime())) {
    throw new Error('Calculation of arrivalUTC resulted in Invalid Date.');
  }

  let arrivalLocalForReturn: Date;
  try {
    arrivalLocalForReturn = toZonedTime(arrivalUTC, destTimezone);
    if (isNaN(arrivalLocalForReturn.getTime())) {
        throw new Error('toZonedTime for arrival resulted in Invalid Date.');
    }
  } catch(e) {
    console.error("Error in toZonedTime for arrival:", e);
    throw new Error(`Failed to convert arrival time to local using timezone: ${destTimezone}. Original error: ${e instanceof Error ? e.message : String(e)}`);
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

  const getOffsetInHours = (tz: string): number => {
    try {
      // Get offset string like "+07:00" or "-05:30" using 'xxx' token
      const offsetStringWithColon = formatInTimeZone(referenceDate, tz, 'xxx');
      
      // Parse the offset string
      const sign = offsetStringWithColon[0] === '-' ? -1 : 1;
      const parts = offsetStringWithColon.substring(1).split(':');
      const hours = parseInt(parts[0], 10);
      const minutes = parts[1] ? parseInt(parts[1], 10) : 0;
      
      if (isNaN(hours) || isNaN(minutes)) {
        console.warn(`Could not parse offset string: ${offsetStringWithColon} for timezone ${tz}. Falling back to 0 offset.`);
        return 0;
      }
      
      return sign * (hours + minutes / 60);
    } catch (e) {
      console.warn(`Error formatting/parsing offset for timezone ${tz}:`, e, `Falling back to 0 offset.`);
      return 0; // Fallback in case of error
    }
  };

  const offset1Hours = getOffsetInHours(timezone1); // Origin's offset from UTC in hours
  const offset2Hours = getOffsetInHours(timezone2); // Destination's offset from UTC in hours
  
  // Difference: (Destination UTC Offset) - (Origin UTC Offset)
  // Example: SIN (UTC+8) and CNX (UTC+7). Difference = 8 - 7 = +1 hour.
  return offset2Hours - offset1Hours;
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
    departureLocal,
    arrivalLocal
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

  // Use formatInTimeZone with the correctly calculated departureUTC and arrivalUTC
  const departureTimeLocalStr = formatInTimeZone(departureUTC, originTimezone, 'HH:mm');
  const departureDateLocalStr = formatInTimeZone(departureUTC, originTimezone, 'yyyy-MM-dd');
  const arrivalTimeLocalStr = formatInTimeZone(arrivalUTC, destTimezone, 'HH:mm');
  const arrivalDateLocalStr = formatInTimeZone(arrivalUTC, destTimezone, 'yyyy-MM-dd');

  const tzDiffHours = calculateTimezoneDifference(originTimezone, destTimezone);
  const timezoneDifference = formatTimezoneDifference(tzDiffHours);

  const dayChange = differenceInDays(arrivalLocal, departureLocal);
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
