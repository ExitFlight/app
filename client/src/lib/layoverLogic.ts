/**
 * Determines whether a flight needs a layover and constructs the flight path
 * Based on realistic flight duration, airline hubs, and no-direct-flight rules
 */

// Define common airport codes for major airline hubs
const airlineHubs: { [airline: string]: string[] } = {
  // North America
  'AA': ['DFW', 'ORD', 'MIA', 'CLT'], // American Airlines
  'UA': ['ORD', 'IAH', 'EWR', 'SFO', 'IAD'], // United Airlines
  'DL': ['ATL', 'DTW', 'MSP', 'SLC', 'SEA'], // Delta Airlines
  'AC': ['YYZ', 'YUL', 'YVR'], // Air Canada

  // Europe
  'BA': ['LHR', 'LGW'], // British Airways
  'LH': ['FRA', 'MUC'], // Lufthansa
  'AF': ['CDG', 'ORY'], // Air France
  'IB': ['MAD'], // Iberia
  'AZ': ['FCO'], // Alitalia

  // Middle East
  'EK': ['DXB'], // Emirates
  'EY': ['AUH'], // Etihad
  'QR': ['DOH'], // Qatar Airways

  // Asia
  'AK': ['KUL'], // AirAsia
  'CX': ['HKG'], // Cathay Pacific
  'SQ': ['SIN'], // Singapore Airlines
  'MH': ['KUL'], // Malaysia Airlines
  'TG': ['BKK'], // Thai Airways
  'JL': ['NRT', 'HND'], // Japan Airlines
  'NH': ['NRT', 'HND'], // ANA

  // Australia/Oceania
  'QF': ['SYD', 'MEL'], // Qantas
  'NZ': ['AKL'] // Air New Zealand
};

// Define pairs that never have direct flights (ultra-long haul or no commercial demand)
const noDirectFlightRules = new Set([
  'SYD-LHR', // Sydney to London
  'MEL-LHR', // Melbourne to London
  'AKL-LHR', // Auckland to London
  'PER-JFK', // Perth to New York
  'SYD-CDG', // Sydney to Paris
  'NRT-GRU', // Tokyo to Sao Paulo
  'HKG-GRU', // Hong Kong to Sao Paulo
  'SIN-GRU', // Singapore to Sao Paulo
  'CPT-LAX', // Cape Town to Los Angeles
  'JNB-SEA', // Johannesburg to Seattle
  'AKL-JFK', // Auckland to New York
  'AKL-ORD', // Auckland to Chicago
  'SYD-YYZ' // Sydney to Toronto
]);

// Major airports by region that make logical layover points
const layoverAirportsByRegion: { [region: string]: string[] } = {
  'North America': ['ATL', 'ORD', 'DFW', 'LAX', 'JFK', 'YYZ', 'SEA', 'SFO', 'MIA', 'YVR'],
  'Europe': ['LHR', 'CDG', 'FRA', 'AMS', 'MAD', 'FCO', 'ZRH', 'IST', 'DME'],
  'Asia': ['HKG', 'SIN', 'BKK', 'NRT', 'ICN', 'PEK', 'KUL', 'TPE', 'DEL', 'PVG'],
  'Middle East': ['DXB', 'DOH', 'AUH'],
  'Oceania': ['SYD', 'MEL', 'BNE', 'AKL'],
  'Africa': ['JNB', 'CAI', 'CPT', 'ADD', 'NBO'],
  'South America': ['GRU', 'SCL', 'BOG', 'EZE', 'LIM']
};

// Regions for airports to help with geographic layover determination
const airportToRegion: { [airport: string]: string } = {
  // North America
  'JFK': 'North America', 'LAX': 'North America', 'ORD': 'North America', 'DFW': 'North America',
  'ATL': 'North America', 'YYZ': 'North America', 'SFO': 'North America', 'YVR': 'North America',
  'SEA': 'North America', 'MIA': 'North America', 'BOS': 'North America', 'IAD': 'North America',
  'YUL': 'North America', 'DEN': 'North America', 'IAH': 'North America', 'PHX': 'North America',
  'LAS': 'North America', 'MCO': 'North America', 'MSP': 'North America', 'DTW': 'North America',
  'EWR': 'North America', 'CLT': 'North America', 'PHL': 'North America', 'HNL': 'North America',
  'KOA': 'North America', 'OGG': 'North America', 'LIH': 'North America',

  // Europe
  // UK & Ireland
  'LHR': 'Europe', 'LGW': 'Europe', 'MAN': 'Europe', 'DUB': 'Europe',
  // Western Europe
  'CDG': 'Europe', 'ORY': 'Europe', 'FRA': 'Europe', 'MUC': 'Europe', 'AMS': 'Europe', 'BRU': 'Europe',
  // Southern Europe
  'MAD': 'Europe', 'BCN': 'Europe', 'LIS': 'Europe', 'FCO': 'Europe', 'MXP': 'Europe', 'ATH': 'Europe', 'IST': 'Europe',
  // Northern Europe
  'CPH': 'Europe', 'ARN': 'Europe', 'OSL': 'Europe', 'HEL': 'Europe',
  // Central/Eastern Europe
  'VIE': 'Europe', 'ZRH': 'Europe', 'WAW': 'Europe', 'BUD': 'Europe', 'PRG': 'Europe',
  // Russia
  'SVO': 'Europe', 'DME': 'Europe', 'LED': 'Europe', 'KZN': 'Europe', 'AER': 'Europe',

  // Asia
  'HKG': 'Asia', 'SIN': 'Asia', 'BKK': 'Asia', 'NRT': 'Asia', 'ICN': 'Asia',
  'PEK': 'Asia', 'KUL': 'Asia', 'TPE': 'Asia', 'HND': 'Asia', 'MNL': 'Asia',
  'DEL': 'Asia', 'BOM': 'Asia', 'CGK': 'Asia', 'KIX': 'Asia', 'SGN': 'Asia',
  'PVG': 'Asia', 'CAN': 'Asia', 'CEB': 'Asia', 'HAN': 'Asia', 'REP': 'Asia',
  'HKT': 'Asia', 'CNX': 'Asia', 'USM': 'Asia',

  // Middle East
  'DXB': 'Middle East', 'DOH': 'Middle East', 'AUH': 'Middle East', 'TLV': 'Middle East',
  'RUH': 'Middle East', 'BAH': 'Middle East', 'MCT': 'Middle East',
  'AMM': 'Middle East', 'KWI': 'Middle East',

  // Oceania
  'SYD': 'Oceania', 'MEL': 'Oceania', 'BNE': 'Oceania', 'AKL': 'Oceania',
  'PER': 'Oceania', 'CHC': 'Oceania', 'ADL': 'Oceania', 'WLG': 'Oceania',
  'CNS': 'Oceania', 'HBA': 'Oceania', 'ZQN': 'Oceania', 'DPS': 'Oceania',
  'NAN': 'Oceania', 'PPT': 'Oceania', 'APW': 'Oceania',

  // Africa
  // South Africa
  'JNB': 'Africa', 'DUR': 'Africa', 'CPT': 'Africa', 'PLZ': 'Africa',
  // Morocco
  'CMN': 'Africa', 'RAK': 'Africa', 'FEZ': 'Africa', 'AGA': 'Africa', 'TNG': 'Africa', 
  // North Africa
  'CAI': 'Africa', 'ALG': 'Africa', 'TUN': 'Africa',
  // East and West Africa
  'LOS': 'Africa', 'ADD': 'Africa', 'NBO': 'Africa', 'ACC': 'Africa', 'DKR': 'Africa',
  'DAR': 'Africa', 'EBB': 'Africa',
  // Islands
  'MRU': 'Africa', 'SEZ': 'Africa',

  // South America
  'GRU': 'South America', 'CGH': 'South America', 'GIG': 'South America', 'SDU': 'South America',
  'EZE': 'South America', 'AEP': 'South America', 'SCL': 'South America', 'BOG': 'South America',
  'LIM': 'South America', 'CCS': 'South America', 'UIO': 'South America', 'GYE': 'South America',
  'MVD': 'South America', 'ASU': 'South America', 'VVI': 'South America', 'LPB': 'South America',
  'CUZ': 'South America', 'CTG': 'South America', 'CNF': 'South America', 'FLN': 'South America',
  'CUN': 'South America'
};

// Threshold for long-haul flights that might require a layover (in minutes)
const longHaulThresholdMinutes = 840; // 14 hours

/**
 * Determines if a flight requires a layover and defines the segments of the journey
 * 
 * @param originCode Origin airport code (e.g., 'LHR')
 * @param destCode Destination airport code (e.g., 'SYD')
 * @param airlineCode Airline code (e.g., 'BA')
 * @param baseDurationMinutes Calculated duration of the flight in minutes
 * @returns Flight path with segments and layover information if applicable
 */
export function determineFlightPath(
  originCode: string,
  destCode: string,
  airlineCode: string,
  baseDurationMinutes: number
): {
  segments: Array<{ origin: string; destination: string; durationMinutes: number }>;
  requiresLayover: boolean;
  layoverAirport?: string;
  layoverDurationMinutes?: number;
  totalDurationMinutes: number;
} {
  // Create route key for checking no-direct rules
  const routeKey = `${originCode}-${destCode}`;
  
  // Default result structure
  const result: {
    segments: Array<{ origin: string; destination: string; durationMinutes: number }>;
    requiresLayover: boolean;
    layoverAirport?: string;
    layoverDurationMinutes?: number;
    totalDurationMinutes: number;
  } = {
    segments: [],
    requiresLayover: false,
    totalDurationMinutes: baseDurationMinutes
  };

  // Check if the route requires a layover based on our rules
  const requiresLayover = 
    noDirectFlightRules.has(routeKey) || 
    baseDurationMinutes > longHaulThresholdMinutes ||
    shouldUseAirlineHub(originCode, destCode, airlineCode);

  if (!requiresLayover) {
    // Direct flight
    result.segments.push({
      origin: originCode,
      destination: destCode,
      durationMinutes: baseDurationMinutes
    });
    return result;
  }

  // A layover is required - find an appropriate airport
  result.requiresLayover = true;
  
  // Determine layover airport
  const layoverAirport = selectLayoverAirport(originCode, destCode, airlineCode);
  result.layoverAirport = layoverAirport;
  
  // Generate a random layover duration between 1.5 and 8 hours
  const layoverDurationMinutes = Math.floor(Math.random() * (480 - 90 + 1)) + 90;
  result.layoverDurationMinutes = layoverDurationMinutes;
  
  // Split the flight time between the two segments, roughly proportionate to distance
  // (This is a simplification - in a real application we would calculate based on actual distances)
  const firstLegRatio = 0.4 + (Math.random() * 0.2); // 40-60% of total flight time
  const firstLegDuration = Math.floor(baseDurationMinutes * firstLegRatio);
  const secondLegDuration = baseDurationMinutes - firstLegDuration;
  
  // Add the segments
  result.segments.push({
    origin: originCode,
    destination: layoverAirport,
    durationMinutes: firstLegDuration
  });
  
  result.segments.push({
    origin: layoverAirport,
    destination: destCode,
    durationMinutes: secondLegDuration
  });
  
  // Update total duration to include layover
  result.totalDurationMinutes = baseDurationMinutes + layoverDurationMinutes;
  
  return result;
}

/**
 * Determines if a flight should use an airline's hub based on operational patterns
 */
function shouldUseAirlineHub(originCode: string, destCode: string, airlineCode: string): boolean {
  // Get the regions of origin and destination
  const originRegion = airportToRegion[originCode] || '';
  const destRegion = airportToRegion[destCode] || '';
  
  // Check if this is a cross-region flight
  if (originRegion !== destRegion) {
    // For cross-continental flights, most airlines route through their hubs
    // Probability increases with certain airlines known for hub-spoke models
    const hubFocusedAirlines = ['EK', 'QR', 'EY', 'TK', 'LH', 'BA'];
    
    if (hubFocusedAirlines.includes(airlineCode)) {
      return Math.random() > 0.2; // 80% chance of routing through hub
    }
    
    return Math.random() > 0.5; // 50% chance for other airlines
  }
  
  // For same-region flights, less likely to need a hub
  return Math.random() > 0.8; // 20% chance
}

/**
 * Selects an appropriate layover airport based on airline hubs and flight route
 */
function selectLayoverAirport(originCode: string, destCode: string, airlineCode: string): string {
  // First try to use an airline hub if available
  if (airlineHubs[airlineCode] && airlineHubs[airlineCode].length > 0) {
    const hubs = airlineHubs[airlineCode];
    // Don't use a hub that's the same as origin or destination
    const validHubs = hubs.filter(hub => hub !== originCode && hub !== destCode);
    if (validHubs.length > 0) {
      return validHubs[Math.floor(Math.random() * validHubs.length)];
    }
  }
  
  // If no airline hub is available, find a geographically sensible layover
  // Get the regions of the origin and destination
  const originRegion = airportToRegion[originCode] || '';
  const destRegion = airportToRegion[destCode] || '';
  
  // Different regions - try to find a hub in a region in between
  if (originRegion !== destRegion) {
    // For simplicity, use either origin or destination region
    // In a real app, we would use more complex geographic logic
    const layoverRegions = [];
    
    // Add origin and destination regions
    if (layoverAirportsByRegion[originRegion]) {
      layoverRegions.push(originRegion);
    }
    if (layoverAirportsByRegion[destRegion]) {
      layoverRegions.push(destRegion);
    }
    
    // For specific region pairs, add logical connecting regions
    if ((originRegion === 'North America' && destRegion === 'Asia') || 
        (originRegion === 'Asia' && destRegion === 'North America')) {
      layoverRegions.push('Asia'); // Likely a Pacific route
    }
    
    if ((originRegion === 'Europe' && destRegion === 'Asia') || 
        (originRegion === 'Asia' && destRegion === 'Europe')) {
      layoverRegions.push('Middle East'); // Common connecting region
    }
    
    if ((originRegion === 'North America' && destRegion === 'Africa') || 
        (originRegion === 'Africa' && destRegion === 'North America')) {
      layoverRegions.push('Europe'); // Likely route through Europe
    }
    
    if ((originRegion === 'Oceania' && destRegion === 'Europe') || 
        (originRegion === 'Europe' && destRegion === 'Oceania')) {
      layoverRegions.push('Middle East', 'Asia'); // Common "Kangaroo route" stops
    }
    
    // Select a random region from our candidates
    if (layoverRegions.length > 0) {
      const selectedRegion = layoverRegions[Math.floor(Math.random() * layoverRegions.length)];
      const airports = layoverAirportsByRegion[selectedRegion].filter(
        airport => airport !== originCode && airport !== destCode
      );
      
      if (airports.length > 0) {
        return airports[Math.floor(Math.random() * airports.length)];
      }
    }
  }
  
  // Fallback to major global hubs
  const majorHubs = ['LHR', 'DXB', 'JFK', 'SIN', 'HKG', 'CDG', 'FRA', 'AMS', 'LAX'];
  const validHubs = majorHubs.filter(hub => hub !== originCode && hub !== destCode);
  return validHubs[Math.floor(Math.random() * validHubs.length)];
}

/**
 * Formats the flight path information into a human-readable string
 */
export function formatFlightPath(flightPath: ReturnType<typeof determineFlightPath>): string {
  if (!flightPath.requiresLayover) {
    return `Direct flight: ${flightPath.segments[0].origin} → ${flightPath.segments[0].destination}`;
  }
  
  const firstLeg = `${flightPath.segments[0].origin} → ${flightPath.segments[0].destination}`;
  const layover = `${flightPath.layoverDurationMinutes} min layover`;
  const secondLeg = `${flightPath.segments[1].origin} → ${flightPath.segments[1].destination}`;
  
  return `${firstLeg}, ${layover}, ${secondLeg}`;
}

/**
 * Calculates and formats the arrival time for a multi-segment journey
 * 
 * @param departureTime Departure time of the first segment
 * @param flightPath Complete flight path with segments and layover
 * @returns Formatted arrival time at final destination
 */
export function calculateArrivalTime(departureTime: Date, flightPath: ReturnType<typeof determineFlightPath>): Date {
  let currentTime = new Date(departureTime);
  
  // Add duration of each segment plus any layover time
  for (let i = 0; i < flightPath.segments.length; i++) {
    // Add flight duration
    currentTime = new Date(currentTime.getTime() + flightPath.segments[i].durationMinutes * 60000);
    
    // Add layover time if this isn't the last segment
    if (i < flightPath.segments.length - 1 && flightPath.layoverDurationMinutes) {
      currentTime = new Date(currentTime.getTime() + flightPath.layoverDurationMinutes * 60000);
    }
  }
  
  return currentTime;
}