import { addHours, addMinutes, differenceInMinutes, format } from 'date-fns';
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';
import { calculateFlightDetails } from './flightTimeCalculator';

// Interface for airline routes data
interface AirlineRouteData {
  [airlineCode: string]: {
    name: string;
    hubs: string[];
    routes: {
      origin: string;
      destination: string;
    }[];
  };
}

// Flight segment interface
export interface FlightSegment {
  airline: {
    code: string;
    name: string;
  };
  flightNumber: string;
  origin: {
    city: string;
    code: string;
    localDepartureTime: string; // Format: HH:mm
    localDepartureDate: string; // Format: YYYY-MM-DD
    timezone: string;
  };
  destination: {
    city: string;
    code: string;
    localArrivalTime: string; // Format: HH:mm
    localArrivalDate: string; // Format: YYYY-MM-DD
    timezone: string;
    dateOffset: number; // 0 = same day, 1 = next day, -1 = previous day
  };
  duration: {
    hours: number;
    minutes: number;
    formatted: string; // Format: Xh Ym
  };
}

// Interface for the complete itinerary
export interface FlightItinerary {
  segments: FlightSegment[];
  totalTravelTime: {
    hours: number;
    minutes: number;
    formatted: string; // Format: Xh Ym
  };
  layover?: {
    city: string;
    duration: {
      hours: number;
      minutes: number;
      formatted: string; // Format: Xh Ym
    };
  };
}

// Sample airline route data
// In a real application, this would be loaded from a database or API
const airlineRouteData: AirlineRouteData = {
  "AA": {
    name: "American Airlines",
    hubs: ["Dallas", "Chicago", "Miami", "New York", "Los Angeles", "Philadelphia", "Phoenix", "Washington DC"],
    routes: [
      { origin: "New York", destination: "London" },
      { origin: "New York", destination: "Paris" },
      { origin: "New York", destination: "Tokyo" },
      { origin: "Miami", destination: "Rio de Janeiro" },
      { origin: "Miami", destination: "Mexico City" },
      { origin: "Dallas", destination: "Sydney" }
    ]
  },
  "UA": {
    name: "United Airlines",
    hubs: ["Chicago", "Denver", "Houston", "Los Angeles", "New York", "San Francisco", "Washington DC"],
    routes: [
      { origin: "New York", destination: "London" },
      { origin: "San Francisco", destination: "Tokyo" },
      { origin: "San Francisco", destination: "Hong Kong" },
      { origin: "Chicago", destination: "Frankfurt" }
    ]
  },
  "DL": {
    name: "Delta Air Lines",
    hubs: ["Atlanta", "Boston", "Detroit", "Los Angeles", "Minneapolis", "New York", "Seattle", "Salt Lake City"],
    routes: [
      { origin: "New York", destination: "London" },
      { origin: "New York", destination: "Paris" },
      { origin: "Atlanta", destination: "Johannesburg" },
      { origin: "Detroit", destination: "Tokyo" }
    ]
  },
  "LH": {
    name: "Lufthansa",
    hubs: ["Frankfurt", "Munich"],
    routes: [
      { origin: "Frankfurt", destination: "New York" },
      { origin: "Frankfurt", destination: "Tokyo" },
      { origin: "Frankfurt", destination: "Dubai" },
      { origin: "Munich", destination: "London" }
    ]
  },
  "BA": {
    name: "British Airways",
    hubs: ["London"],
    routes: [
      { origin: "London", destination: "New York" },
      { origin: "London", destination: "Singapore" },
      { origin: "London", destination: "Sydney" },
      { origin: "London", destination: "Cape Town" }
    ]
  },
  "AF": {
    name: "Air France",
    hubs: ["Paris"],
    routes: [
      { origin: "Paris", destination: "New York" },
      { origin: "Paris", destination: "Tokyo" },
      { origin: "Paris", destination: "Rio de Janeiro" }
    ]
  },
  "EK": {
    name: "Emirates",
    hubs: ["Dubai"],
    routes: [
      { origin: "Dubai", destination: "London" },
      { origin: "Dubai", destination: "New York" },
      { origin: "Dubai", destination: "Sydney" },
      { origin: "Dubai", destination: "Bangkok" }
    ]
  },
  "SQ": {
    name: "Singapore Airlines",
    hubs: ["Singapore"],
    routes: [
      { origin: "Singapore", destination: "London" },
      { origin: "Singapore", destination: "New York" },
      { origin: "Singapore", destination: "Tokyo" },
      { origin: "Singapore", destination: "Sydney" }
    ]
  },
  "CX": {
    name: "Cathay Pacific",
    hubs: ["Hong Kong"],
    routes: [
      { origin: "Hong Kong", destination: "London" },
      { origin: "Hong Kong", destination: "New York" },
      { origin: "Hong Kong", destination: "Sydney" },
      { origin: "Hong Kong", destination: "Tokyo" }
    ]
  },
  "QF": {
    name: "Qantas",
    hubs: ["Sydney", "Melbourne"],
    routes: [
      { origin: "Sydney", destination: "London" },
      { origin: "Sydney", destination: "Los Angeles" },
      { origin: "Sydney", destination: "Singapore" },
      { origin: "Melbourne", destination: "Los Angeles" }
    ]
  }
};

// City pairs that require a layover (long-haul routes)
const routesRequiringLayover = [
  { origin: "New York", destination: "Sydney" },
  { origin: "London", destination: "Sydney" },
  { origin: "Paris", destination: "Sydney" },
  { origin: "New York", destination: "Singapore" },
  { origin: "New York", destination: "Hong Kong" },
  { origin: "New York", destination: "Bangkok" },
  { origin: "London", destination: "Auckland" },
  { origin: "Paris", destination: "Auckland" },
  { origin: "Tokyo", destination: "London" },
  { origin: "Sydney", destination: "Paris" }
];

/**
 * Filter airlines based on origin and destination cities
 * @param originCity Origin city
 * @param destinationCity Destination city
 * @returns Array of airline codes that serve the route
 */
export function filterAirlinesForRoute(
  originCity: string,
  destinationCity: string
): string[] {
  const matchingAirlines: string[] = [];

  // Check each airline
  for (const [airlineCode, airlineData] of Object.entries(airlineRouteData)) {
    // Check if the airline has a direct route
    const hasDirectRoute = airlineData.routes.some(
      route => 
        (route.origin === originCity && route.destination === destinationCity) ||
        (route.origin === destinationCity && route.destination === originCity)
    );

    if (hasDirectRoute) {
      matchingAirlines.push(airlineCode);
      continue;
    }

    // Check if the airline can serve this route via one of its hubs
    const canServeViaHub = airlineData.hubs.some(hub => {
      const canFlyFromOriginToHub = airlineData.routes.some(
        route => 
          (route.origin === originCity && route.destination === hub) ||
          (route.origin === hub && route.destination === originCity)
      );
      
      const canFlyFromHubToDest = airlineData.routes.some(
        route => 
          (route.origin === hub && route.destination === destinationCity) ||
          (route.origin === destinationCity && route.destination === hub)
      );

      return canFlyFromOriginToHub && canFlyFromHubToDest;
    });

    if (canServeViaHub) {
      matchingAirlines.push(airlineCode);
    }
  }

  return matchingAirlines;
}

/**
 * Validate if an airline can serve a specific route
 * @param airlineCode Airline code
 * @param originCity Origin city
 * @param destinationCity Destination city
 * @returns Boolean indicating if the airline can serve the route
 */
export function validateAirlineForRoute(
  airlineCode: string,
  originCity: string,
  destinationCity: string
): boolean {
  const matchingAirlines = filterAirlinesForRoute(originCity, destinationCity);
  return matchingAirlines.includes(airlineCode);
}

/**
 * Generate a random flight number for an airline
 * @param airlineCode Airline code
 * @returns Flight number string
 */
function generateFlightNumber(airlineCode: string): string {
  // Generate a random 3 or 4 digit number
  const flightNum = Math.floor(Math.random() * 9000) + 1000;
  return `${airlineCode}${flightNum}`;
}

/**
 * Check if a route requires a layover
 * @param originCity Origin city
 * @param destinationCity Destination city
 * @returns Boolean indicating if a layover is required
 */
function needsLayover(originCity: string, destinationCity: string): boolean {
  // Check predefined routes that require layovers
  return routesRequiringLayover.some(
    route => 
      (route.origin === originCity && route.destination === destinationCity) ||
      (route.origin === destinationCity && route.destination === originCity)
  );
}

/**
 * Select a hub for a layover based on airline and route
 * @param airlineCode Airline code
 * @param originCity Origin city
 * @param destinationCity Destination city
 * @returns Hub city for layover
 */
function selectLayoverHub(
  airlineCode: string,
  originCity: string,
  destinationCity: string
): string {
  const airlineData = airlineRouteData[airlineCode];
  
  if (!airlineData) {
    // Fallback to a major hub if airline not found
    return "London";
  }

  // Find hubs that have routes to both origin and destination
  const validHubs = airlineData.hubs.filter(hub => {
    const hasRouteFromOrigin = airlineData.routes.some(
      route => 
        (route.origin === originCity && route.destination === hub) ||
        (route.origin === hub && route.destination === originCity)
    );
    
    const hasRouteToDestination = airlineData.routes.some(
      route => 
        (route.origin === hub && route.destination === destinationCity) ||
        (route.origin === destinationCity && route.destination === hub)
    );

    return hasRouteFromOrigin && hasRouteToDestination;
  });

  if (validHubs.length > 0) {
    // Select a random hub from valid options
    return validHubs[Math.floor(Math.random() * validHubs.length)];
  }

  // If no valid hub found, return the first hub as a fallback
  return airlineData.hubs[0] || "London";
}

/**
 * Format duration in minutes to a human-readable string
 * @param totalMinutes Duration in minutes
 * @returns Formatted duration string
 */
function formatDuration(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  if (hours === 0) {
    return `${minutes}m`;
  } else if (minutes === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${minutes}m`;
  }
}

/**
 * Generate a random layover duration between 1.5 and 8 hours
 * @returns Layover duration in minutes
 */
function generateLayoverDuration(): number {
  // Generate between 90 minutes (1.5 hours) and 480 minutes (8 hours)
  return Math.floor(Math.random() * (480 - 90 + 1)) + 90;
}

/**
 * Generate a flight itinerary based on origin, destination, and airline
 * @param originCity Origin city
 * @param destinationCity Destination city
 * @param airlineCode Airline code
 * @returns Promise resolving to an array of FlightSegment objects
 */
export async function generateFlightItinerary(
  originCity: string,
  destinationCity: string,
  airlineCode: string
): Promise<FlightSegment[]> {
  // Validate that the airline can serve this route
  const isValid = validateAirlineForRoute(airlineCode, originCity, destinationCity);
  if (!isValid) {
    throw new Error(`Airline ${airlineCode} does not serve the route from ${originCity} to ${destinationCity}`);
  }

  // Get airline data
  const airlineData = airlineRouteData[airlineCode];
  if (!airlineData) {
    throw new Error(`Airline ${airlineCode} not found in database`);
  }

  // Check if the route needs a layover
  const requiresLayover = needsLayover(originCity, destinationCity);

  if (!requiresLayover) {
    // Generate a direct flight
    const flightDetails = await calculateFlightDetails(originCity, destinationCity);
    
    // Create the flight segment
    const directSegment: FlightSegment = {
      airline: {
        code: airlineCode,
        name: airlineData.name
      },
      flightNumber: generateFlightNumber(airlineCode),
      origin: {
        city: originCity,
        code: originCity.substring(0, 3).toUpperCase(), // Simplified code generation
        localDepartureTime: flightDetails.departureTimeLocal,
        localDepartureDate: flightDetails.departureDateLocal,
        timezone: 'UTC' // Using UTC as default timezone
      },
      destination: {
        city: destinationCity,
        code: destinationCity.substring(0, 3).toUpperCase(), // Simplified code generation
        localArrivalTime: flightDetails.arrivalTimeLocal,
        localArrivalDate: flightDetails.arrivalDateLocal,
        timezone: 'UTC', // Using UTC as default timezone
        dateOffset: flightDetails.departureDateLocal !== flightDetails.arrivalDateLocal ? 1 : 0
      },
      duration: {
        hours: Math.floor(flightDetails.durationMinutes / 60),
        minutes: flightDetails.durationMinutes % 60,
        formatted: flightDetails.durationFormatted
      }
    };

    return [directSegment];
  } else {
    // Generate a flight with a layover
    const layoverHub = selectLayoverHub(airlineCode, originCity, destinationCity);
    
    // Generate the first segment (origin to layover)
    const firstSegmentDetails = await calculateFlightDetails(originCity, layoverHub);
    
    // Set up the layover duration
    const layoverDurationMinutes = generateLayoverDuration();
    
    // Parse the arrival time at the layover hub
    const layoverArrivalDate = new Date(`${firstSegmentDetails.arrivalDateLocal}T${firstSegmentDetails.arrivalTimeLocal}:00`);
    const layoverTimezone = firstSegmentDetails.destinationAirport.timezone || 'UTC';
    
    // Calculate the departure time from the layover hub
    const layoverDepDate = addMinutes(toZonedTime(layoverArrivalDate, layoverTimezone), layoverDurationMinutes);
    const layoverDepTime = format(layoverDepDate, 'HH:mm');
    const layoverDepDay = format(layoverDepDate, 'yyyy-MM-dd');
    
    // Generate the second segment (layover to destination)
    const secondSegmentDetails = await calculateFlightDetails(layoverHub, destinationCity);
    
    // Override the departure time with our calculated post-layover time
    secondSegmentDetails.departureTimeLocal = layoverDepTime;
    secondSegmentDetails.departureDateLocal = layoverDepDay;
    
    // Recalculate the arrival details based on the new departure time
    const layoverDepartureDate = new Date(`${layoverDepDay}T${layoverDepTime}:00`);
    const secondSegmentDuration = secondSegmentDetails.durationMinutes;
    
    const destinationTimezone = 'UTC'; // Using UTC as default timezone
    const finalArrivalDate = addMinutes(toZonedTime(layoverDepartureDate, layoverTimezone), secondSegmentDuration);
    const finalArrivalDateZoned = toZonedTime(finalArrivalDate, destinationTimezone);
    
    const finalArrivalTime = format(finalArrivalDateZoned, 'HH:mm');
    const finalArrivalDay = format(finalArrivalDateZoned, 'yyyy-MM-dd');
    
    // Calculate the date offset for the second segment
    const secondSegDepDay = new Date(layoverDepDay);
    const secondSegArrDay = new Date(finalArrivalDay);
    const dayDifference = differenceInMinutes(secondSegArrDay, secondSegDepDay) / (24 * 60);
    const dateOffset = Math.round(dayDifference);
    
    // Create the flight segments
    const firstSegment: FlightSegment = {
      airline: {
        code: airlineCode,
        name: airlineData.name
      },
      flightNumber: generateFlightNumber(airlineCode),
      origin: {
        city: originCity,
        code: originCity.substring(0, 3).toUpperCase(), // Simplified code generation
        localDepartureTime: firstSegmentDetails.departureTimeLocal,
        localDepartureDate: firstSegmentDetails.departureDateLocal,
        timezone: 'UTC' // Using UTC as default timezone
      },
      destination: {
        city: layoverHub,
        code: layoverHub.substring(0, 3).toUpperCase(), // Simplified code generation
        localArrivalTime: firstSegmentDetails.arrivalTimeLocal,
        localArrivalDate: firstSegmentDetails.arrivalDateLocal,
        timezone: 'UTC', // Using UTC as default timezone
        dateOffset: firstSegmentDetails.departureDateLocal !== firstSegmentDetails.arrivalDateLocal ? 1 : 0
      },
      duration: {
        hours: Math.floor(firstSegmentDetails.durationMinutes / 60),
        minutes: firstSegmentDetails.durationMinutes % 60,
        formatted: firstSegmentDetails.durationFormatted
      }
    };
    
    const secondSegment: FlightSegment = {
      airline: {
        code: airlineCode,
        name: airlineData.name
      },
      flightNumber: generateFlightNumber(airlineCode),
      origin: {
        city: layoverHub,
        code: layoverHub.substring(0, 3).toUpperCase(), // Simplified code generation
        localDepartureTime: layoverDepTime,
        localDepartureDate: layoverDepDay,
        timezone: 'UTC' // Using UTC as default timezone
      },
      destination: {
        city: destinationCity,
        code: destinationCity.substring(0, 3).toUpperCase(), // Simplified code generation
        localArrivalTime: finalArrivalTime,
        localArrivalDate: finalArrivalDay,
        timezone: 'UTC', // Using UTC as default timezone
        dateOffset: dateOffset
      },
      duration: {
        hours: Math.floor(secondSegmentDetails.durationMinutes / 60),
        minutes: secondSegmentDetails.durationMinutes % 60,
        formatted: secondSegmentDetails.durationFormatted
      }
    };

    return [firstSegment, secondSegment];
  }
}

/**
 * Format the flight itinerary for preview
 * @param segments Array of flight segments
 * @returns Object with formatted string and total travel time
 */
export function formatItineraryForPreview(
  segments: FlightSegment[]
): { formattedString: string; totalTravelTime: string; layoverDuration?: string } {
  // Calculate total travel time
  let totalMinutes = 0;
  let formattedString = '';
  
  // Add each segment to the formatted string
  segments.forEach((segment, index) => {
    // Add segment duration to total
    totalMinutes += segment.duration.hours * 60 + segment.duration.minutes;
    
    // Add segment details to formatted string
    formattedString += `Segment ${index + 1}: ${segment.airline.name} (${segment.airline.code}) Flight ${segment.flightNumber}\n`;
    formattedString += `From: ${segment.origin.city} (${segment.origin.code})\n`;
    formattedString += `Departure: ${segment.origin.localDepartureDate} at ${segment.origin.localDepartureTime} local time\n`;
    formattedString += `To: ${segment.destination.city} (${segment.destination.code})\n`;
    formattedString += `Arrival: ${segment.destination.localArrivalDate} at ${segment.destination.localArrivalTime} local time`;
    
    if (segment.destination.dateOffset !== 0) {
      formattedString += ` (${segment.destination.dateOffset > 0 ? '+' : ''}${segment.destination.dateOffset} day${segment.destination.dateOffset !== 1 ? 's' : ''})`;
    }
    
    formattedString += `\nFlight Duration: ${segment.duration.formatted}\n`;
    
    // Add layover information if there's a next segment
    if (index < segments.length - 1) {
      // Calculate layover duration
      const currentArrival = new Date(`${segment.destination.localArrivalDate}T${segment.destination.localArrivalTime}:00`);
      const nextDeparture = new Date(`${segments[index + 1].origin.localDepartureDate}T${segments[index + 1].origin.localDepartureTime}:00`);
      
      // Convert to same timezone for comparison
      const currentArrivalInLocalTZ = toZonedTime(currentArrival, segment.destination.timezone);
      const nextDepartureInLocalTZ = toZonedTime(nextDeparture, segments[index + 1].origin.timezone);
      
      // Calculate difference in minutes
      const layoverMinutes = differenceInMinutes(nextDepartureInLocalTZ, currentArrivalInLocalTZ);
      totalMinutes += layoverMinutes;
      
      // Format layover information
      const layoverHours = Math.floor(layoverMinutes / 60);
      const layoverRemainingMinutes = layoverMinutes % 60;
      const layoverFormatted = formatDuration(layoverMinutes);
      
      formattedString += `Layover in ${segment.destination.city}: ${layoverFormatted}\n\n`;
    } else {
      formattedString += '\n';
    }
  });
  
  // Calculate total travel time
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;
  const totalTravelTime = formatDuration(totalMinutes);
  
  return {
    formattedString,
    totalTravelTime
  };
}

/**
 * Calculate the complete flight itinerary including all details
 * @param originCity Origin city
 * @param destinationCity Destination city
 * @param airlineCode Airline code
 * @returns Promise resolving to a complete flight itinerary
 */
export async function calculateCompleteItinerary(
  originCity: string,
  destinationCity: string,
  airlineCode: string
): Promise<FlightItinerary> {
  // Generate the flight segments
  const segments = await generateFlightItinerary(originCity, destinationCity, airlineCode);
  
  // Calculate total travel time and format string
  let totalMinutes = 0;
  let layoverDuration = 0;
  let layoverCity = '';
  
  // Add flight segment durations
  segments.forEach(segment => {
    totalMinutes += segment.duration.hours * 60 + segment.duration.minutes;
  });
  
  // Calculate layover time if there are multiple segments
  if (segments.length > 1) {
    const firstSegment = segments[0];
    const secondSegment = segments[1];
    
    // Calculate layover duration
    const firstArrival = new Date(`${firstSegment.destination.localArrivalDate}T${firstSegment.destination.localArrivalTime}:00`);
    const secondDeparture = new Date(`${secondSegment.origin.localDepartureDate}T${secondSegment.origin.localDepartureTime}:00`);
    
    // Convert to same timezone for comparison
    const firstArrivalInLocalTZ = toZonedTime(firstArrival, firstSegment.destination.timezone);
    const secondDepartureInLocalTZ = toZonedTime(secondDeparture, secondSegment.origin.timezone);
    
    // Calculate layover duration in minutes
    layoverDuration = differenceInMinutes(secondDepartureInLocalTZ, firstArrivalInLocalTZ);
    totalMinutes += layoverDuration;
    layoverCity = firstSegment.destination.city;
  }
  
  // Format total travel time
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;
  
  const result: FlightItinerary = {
    segments,
    totalTravelTime: {
      hours: totalHours,
      minutes: remainingMinutes,
      formatted: formatDuration(totalMinutes)
    }
  };
  
  // Add layover information if applicable
  if (segments.length > 1 && layoverDuration > 0) {
    result.layover = {
      city: layoverCity,
      duration: {
        hours: Math.floor(layoverDuration / 60),
        minutes: layoverDuration % 60,
        formatted: formatDuration(layoverDuration)
      }
    };
  }
  
  return result;
}