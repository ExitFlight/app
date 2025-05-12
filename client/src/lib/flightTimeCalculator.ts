import { format, formatDuration, intervalToDuration, addMinutes } from 'date-fns';
import { zonedTimeToUtc, utcToZonedTime, getTimezoneOffset } from 'date-fns-tz';

// Interfaces for the data structures
interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
  timezone?: string; // IANA timezone like 'America/New_York'
}

interface FlightDetails {
  originAirport: Airport;
  destinationAirport: Airport;
  departureTimeLocal: string; // Format: HH:mm (24-hour)
  arrivalTimeLocal: string;   // Format: HH:mm (24-hour)
  departureDateLocal: string; // Format: YYYY-MM-DD
  arrivalDateLocal: string;   // Format: YYYY-MM-DD
  arrivalDateOffset: number;  // 0 = same day, 1 = next day, -1 = previous day
  flightDurationFormatted: string; // Format: Xh Ym
}

// A map of estimated flight durations between city pairs (in minutes)
const flightDurations: Record<string, Record<string, number>> = {
  'New York': {
    'London': 415,
    'Tokyo': 840,
    'Los Angeles': 360,
    'Mexico City': 240,
    'Sydney': 1260,
    'Dubai': 780,
    'Paris': 430,
    'Singapore': 1020,
    'Hong Kong': 960,
    'Toronto': 90,
  },
  'London': {
    'New York': 435,
    'Tokyo': 720,
    'Dubai': 420,
    'Singapore': 820,
    'Sydney': 1320,
    'Delhi': 510,
    'Paris': 75,
    'Rome': 165,
    'Berlin': 120,
    'Cairo': 285,
  },
  'Tokyo': {
    'New York': 810,
    'London': 720,
    'Singapore': 420,
    'Sydney': 540,
    'Hong Kong': 270,
    'Delhi': 450,
    'Bangkok': 390,
    'Seoul': 150,
    'Shanghai': 180,
    'Taipei': 210,
  },
  // Add more cities as needed
};

// A map of airports with their IANA timezone identifiers
const airportTimezones: Record<string, string> = {
  'JFK': 'America/New_York',
  'LGA': 'America/New_York',
  'LAX': 'America/Los_Angeles',
  'SFO': 'America/Los_Angeles',
  'ORD': 'America/Chicago',
  'DFW': 'America/Chicago',
  'MIA': 'America/New_York',
  'LHR': 'Europe/London',
  'CDG': 'Europe/Paris',
  'FRA': 'Europe/Berlin',
  'AMS': 'Europe/Amsterdam',
  'MAD': 'Europe/Madrid',
  'FCO': 'Europe/Rome',
  'NRT': 'Asia/Tokyo',
  'HND': 'Asia/Tokyo',
  'PEK': 'Asia/Shanghai',
  'PVG': 'Asia/Shanghai',
  'HKG': 'Asia/Hong_Kong',
  'SIN': 'Asia/Singapore',
  'BKK': 'Asia/Bangkok',
  'DXB': 'Asia/Dubai',
  'DEL': 'Asia/Kolkata',
  'BOM': 'Asia/Kolkata',
  'SYD': 'Australia/Sydney',
  'MEL': 'Australia/Melbourne',
  'AKL': 'Pacific/Auckland',
  'MEX': 'America/Mexico_City',
  'GDL': 'America/Mexico_City',
  'YYZ': 'America/Toronto',
  'YVR': 'America/Vancouver',
  'GRU': 'America/Sao_Paulo',
  'EZE': 'America/Argentina/Buenos_Aires',
  'SCL': 'America/Santiago',
  'LIM': 'America/Lima',
  'BOG': 'America/Bogota',
  'JNB': 'Africa/Johannesburg',
  'CPT': 'Africa/Johannesburg',
  'CAI': 'Africa/Cairo',
  // Add more airports as needed
};

/**
 * Calculates the estimated flight duration between two cities in minutes
 */
function estimateFlightDuration(originCity: string, destinationCity: string): number {
  // Use predefined durations if available
  if (flightDurations[originCity] && flightDurations[originCity][destinationCity]) {
    return flightDurations[originCity][destinationCity];
  }
  
  // If destination-to-origin is available, add a small variation (5%)
  if (flightDurations[destinationCity] && flightDurations[destinationCity][originCity]) {
    const reverseFlightTime = flightDurations[destinationCity][originCity];
    return Math.round(reverseFlightTime * 1.05); // Slightly longer in the other direction
  }
  
  // Fallback to a randomized reasonable value for unknown routes (3-15 hours)
  // For a real app, this would be calculated based on distance and aircraft type
  return Math.floor(Math.random() * (900 - 180 + 1)) + 180;
}

/**
 * Formats a flight duration in minutes to a human-readable string
 */
function formatFlightDuration(durationInMinutes: number): string {
  const hours = Math.floor(durationInMinutes / 60);
  const minutes = durationInMinutes % 60;
  
  if (minutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${minutes}m`;
}

/**
 * Generates a random departure time
 */
function generateRandomDepartureTime(): string {
  const hour = Math.floor(Math.random() * 24).toString().padStart(2, '0');
  // Generate minutes in 5-minute intervals
  const minute = (Math.floor(Math.random() * 12) * 5).toString().padStart(2, '0');
  return `${hour}:${minute}`;
}

/**
 * Looks up an airport by city name
 */
async function lookupAirport(city: string): Promise<Airport> {
  try {
    // In a real app, this would query an API or database
    // For now, we'll simulate a successful lookup
    const response = await fetch(`/api/airports/by-city/${encodeURIComponent(city)}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch airport data for ${city}`);
    }
    
    const airports = await response.json();
    
    if (!airports || airports.length === 0) {
      throw new Error(`No airports found for ${city}`);
    }
    
    // Choose the first (primary) airport for the city
    const airport = airports[0];
    
    // Add timezone information if available
    if (airportTimezones[airport.code]) {
      airport.timezone = airportTimezones[airport.code];
    } else {
      console.warn(`No timezone data for ${airport.code}`);
      // Fallback to a standard timezone (UTC)
      airport.timezone = 'UTC';
    }
    
    return airport;
  } catch (error) {
    console.error(`Error looking up airport for ${city}:`, error);
    // Return a default/fallback airport in case of error
    throw new Error(`Could not find airport for ${city}`);
  }
}

/**
 * Calculate flight details including time zone adjustments
 */
export async function calculateBasicFlightDetails(
  originCity: string,
  destinationCity: string
): Promise<FlightDetails> {
  try {
    // 1. Look up origin and destination airports
    const originAirport = await lookupAirport(originCity);
    const destinationAirport = await lookupAirport(destinationCity);
    
    // 2. Generate a random departure time (24-hour format)
    const departureTimeLocal = generateRandomDepartureTime();
    
    // 3. Estimate flight duration in minutes
    const flightDurationMinutes = estimateFlightDuration(originCity, destinationCity);
    
    // 4. Create a Date object for the departure (using today's date)
    const today = new Date();
    const departureDateLocal = format(today, 'yyyy-MM-dd');
    
    // Extract hours and minutes from the departure time
    const [departureHours, departureMinutes] = departureTimeLocal.split(':').map(Number);
    
    // Create a departure date with the time set
    const departureDate = new Date(today);
    departureDate.setHours(departureHours, departureMinutes, 0, 0);
    
    // 5. Convert departure time to UTC
    const departureTimeUTC = zonedTimeToUtc(
      departureDate,
      originAirport.timezone || 'UTC'
    );
    
    // 6. Add flight duration to get arrival time in UTC
    const arrivalTimeUTC = addMinutes(departureTimeUTC, flightDurationMinutes);
    
    // 7. Convert UTC arrival time to destination local time
    const arrivalTimeLocal = utcToZonedTime(
      arrivalTimeUTC,
      destinationAirport.timezone || 'UTC'
    );
    
    // 8. Format arrival time as HH:mm
    const formattedArrivalTime = format(arrivalTimeLocal, 'HH:mm');
    
    // 9. Determine if arrival is on a different date
    const arrivalDateLocal = format(arrivalTimeLocal, 'yyyy-MM-dd');
    
    // 10. Calculate date offset
    const departureDateObj = new Date(departureDateLocal);
    const arrivalDateObj = new Date(arrivalDateLocal);
    
    // Calculate the difference in days
    const timeDiff = arrivalDateObj.getTime() - departureDateObj.getTime();
    const dayDiff = Math.round(timeDiff / (1000 * 3600 * 24));
    
    return {
      originAirport,
      destinationAirport,
      departureTimeLocal,
      arrivalTimeLocal: formattedArrivalTime,
      departureDateLocal,
      arrivalDateLocal,
      arrivalDateOffset: dayDiff,
      flightDurationFormatted: formatFlightDuration(flightDurationMinutes)
    };
  } catch (error) {
    console.error('Error calculating flight details:', error);
    throw error;
  }
}

/**
 * Alternative implementation using an existing flight record
 * Useful when we have a selected flight but need to calculate its arrival time
 */
export function calculateFlightDetailsFromRecord(
  flight: {
    departure: { time: string; airport: { city: string; code: string } };
    arrival: { airport: { city: string; code: string } };
    departureDate: string; // YYYY-MM-DD
  }
): Promise<FlightDetails> {
  return calculateBasicFlightDetails(
    flight.departure.airport.city,
    flight.arrival.airport.city
  ).then(details => {
    // Override the generated departure time with the one from the record
    return {
      ...details,
      departureTimeLocal: flight.departure.time,
      departureDateLocal: flight.departureDate
    };
  });
}