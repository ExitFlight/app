// Airline logos from reliable sources
export const airlineLogos = {
  delta: "https://logos-world.net/wp-content/uploads/2020/11/Delta-Air-Lines-Logo.png",
  american: "https://logos-world.net/wp-content/uploads/2020/11/American-Airlines-Logo.png",
  united: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/United_Airlines_logo_2019.svg/2560px-United_Airlines_logo_2019.svg.png",
  british: "https://1000logos.net/wp-content/uploads/2020/04/British-Airways-Logo.png",
};

// Flight images from Unsplash (reliable source)
export const flightImages = [
  "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3",
  "https://images.unsplash.com/photo-1542296332-2e4473faf563?ixlib=rb-4.0.3",
  "https://images.unsplash.com/photo-1559769775-9d9d4f5cfc7d?ixlib=rb-4.0.3",
  "https://images.unsplash.com/photo-1517479149777-5f3b1511d5ad?ixlib=rb-4.0.3",
];

// Regional hub airports that have direct international flights
const majorHubs = [
  // North America
  'JFK', 'LAX', 'ORD', 'DFW', 'ATL', 'MIA', 'SFO', 'YYZ', 'YVR', 'MEX',
  
  // Europe
  'LHR', 'CDG', 'FRA', 'AMS', 'MAD', 'FCO', 'IST', 'DUB', 'ZRH', 'CPH', 'ARN', 'OSL', 'HEL',
  
  // Asia
  'HKG', 'SIN', 'NRT', 'HND', 'PEK', 'PVG', 'ICN', 'BKK', 'KUL', 'TPE', 'MNL', 'SGN', 'HAN',
  
  // Middle East
  'DXB', 'DOH', 'AUH',
  
  // Oceania
  'SYD', 'MEL', 'AKL',
  
  // Africa
  'JNB', 'CAI', 'CMN', 'ADD'
];

// Special paired routes that don't follow hub rules
const specialRoutes = [
  // Examples of specific non-hub direct routes
  ['SFO', 'HNL'], // San Francisco to Honolulu
  ['LAX', 'DPS'], // Los Angeles to Bali
  ['YVR', 'PVG'], // Vancouver to Shanghai
  ['SEA', 'KEF'], // Seattle to Reykjavik
];

/**
 * Checks if a direct flight exists between two airports
 * @param origin Origin airport code
 * @param destination Destination airport code
 * @returns Boolean indicating if direct flights exist
 */
export function directFlightExists(origin: string, destination: string): boolean {
  // If it's the same airport, no direct flight needed (but not valid for booking)
  if (origin === destination) {
    return true;
  }
  
  // Check for special direct routes
  if (specialRoutes.some(route => 
    (route[0] === origin && route[1] === destination) || 
    (route[0] === destination && route[1] === origin)
  )) {
    return true;
  }
  
  // Rules for direct flights:
  // 1. Both airports are major hubs
  // 2. Same region (both North America, both Europe, etc.)
  // 3. Short-distance airports
  
  const isMajorRoute = majorHubs.includes(origin) && majorHubs.includes(destination);
  
  // The rest would need to be determined by a proper flight database
  // For now, we'll assume major hubs have direct flights between them
  return isMajorRoute;
}

// Function to format dates for the tickets
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Function to calculate boarding time (typically 30 mins before departure)
export function calculateBoardingTime(departureTime: string): string {
  const [hours, minutes] = departureTime.split(':').map(Number);
  
  const date = new Date();
  date.setHours(hours, minutes);
  date.setMinutes(date.getMinutes() - 30);
  
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

// Generate a random booking reference (6 alphanumeric characters)
export function generateBookingReference(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Generate a random seat number based on preference
export function generateSeatNumber(preference?: string): string {
  const row = Math.floor(Math.random() * 30) + 1;
  let seat: string;
  
  if (preference === 'window') {
    // A or F
    seat = Math.random() > 0.5 ? 'A' : 'F';
  } else if (preference === 'aisle') {
    // C or D
    seat = Math.random() > 0.5 ? 'C' : 'D';
  } else if (preference === 'middle') {
    // B or E
    seat = Math.random() > 0.5 ? 'B' : 'E';
  } else {
    // Any seat
    seat = String.fromCharCode(65 + Math.floor(Math.random() * 6)); // A-F
  }
  
  return `${row}${seat}`;
}
