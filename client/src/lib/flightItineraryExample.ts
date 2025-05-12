import { 
  filterAirlinesForRoute, 
  validateAirlineForRoute, 
  generateFlightItinerary, 
  formatItineraryForPreview,
  calculateCompleteItinerary
} from './flightItinerary';

/**
 * Demonstrates filtering airlines for a route
 */
export async function demoFilterAirlinesForRoute(
  originCity: string,
  destinationCity: string
): Promise<string[]> {
  console.log(`\nDEMO: Filtering airlines for route from ${originCity} to ${destinationCity}`);
  
  try {
    const airlines = filterAirlinesForRoute(originCity, destinationCity);
    
    console.log('Available airlines for this route:');
    if (airlines.length === 0) {
      console.log('No airlines found for this route');
    } else {
      airlines.forEach(airline => console.log(`- ${airline}`));
    }
    
    return airlines;
  } catch (error) {
    console.error('Error filtering airlines:', error);
    throw error;
  }
}

/**
 * Demonstrates validating if an airline can serve a specific route
 */
export async function demoValidateAirlineForRoute(
  airlineCode: string,
  originCity: string,
  destinationCity: string
): Promise<boolean> {
  console.log(`\nDEMO: Validating if airline ${airlineCode} can serve the route from ${originCity} to ${destinationCity}`);
  
  try {
    const isValid = validateAirlineForRoute(airlineCode, originCity, destinationCity);
    
    if (isValid) {
      console.log(`✅ Airline ${airlineCode} can serve this route`);
    } else {
      console.log(`❌ Airline ${airlineCode} cannot serve this route`);
    }
    
    return isValid;
  } catch (error) {
    console.error('Error validating airline:', error);
    throw error;
  }
}

/**
 * Demonstrates generating a flight itinerary
 */
export async function demoGenerateFlightItinerary(
  originCity: string,
  destinationCity: string,
  airlineCode: string
): Promise<void> {
  console.log(`\nDEMO: Generating flight itinerary from ${originCity} to ${destinationCity} with airline ${airlineCode}`);
  
  try {
    // First validate the airline
    const isValid = validateAirlineForRoute(airlineCode, originCity, destinationCity);
    
    if (!isValid) {
      console.log(`❌ Airline ${airlineCode} cannot serve this route. Stopping demo.`);
      return;
    }
    
    // Generate the itinerary
    console.log('Generating itinerary...');
    const segments = await generateFlightItinerary(originCity, destinationCity, airlineCode);
    
    console.log(`✅ Generated ${segments.length} flight segment(s)`);
    
    // Format the itinerary
    const formatted = formatItineraryForPreview(segments);
    
    console.log('\nITINERARY PREVIEW:');
    console.log('=================');
    console.log(formatted.formattedString);
    console.log('=================');
    console.log(`Total Travel Time: ${formatted.totalTravelTime}`);
    
  } catch (error) {
    console.error('Error generating flight itinerary:', error);
  }
}

/**
 * Demonstrates the complete flight itinerary calculation
 */
export async function demoCompleteItinerary(
  originCity: string,
  destinationCity: string,
  airlineCode: string
): Promise<void> {
  console.log(`\nDEMO: Calculating complete itinerary from ${originCity} to ${destinationCity} with airline ${airlineCode}`);
  
  try {
    // Calculate the complete itinerary
    const itinerary = await calculateCompleteItinerary(originCity, destinationCity, airlineCode);
    
    console.log('\nCOMPLETE ITINERARY:');
    console.log('==================');
    console.log(`Total Travel Time: ${itinerary.totalTravelTime.formatted}`);
    console.log(`Number of Segments: ${itinerary.segments.length}`);
    
    if (itinerary.layover) {
      console.log(`Layover in ${itinerary.layover.city} for ${itinerary.layover.duration.formatted}`);
    }
    
    itinerary.segments.forEach((segment, index) => {
      console.log(`\nSEGMENT ${index + 1}:`);
      console.log(`Airline: ${segment.airline.name} (${segment.airline.code})`);
      console.log(`Flight Number: ${segment.flightNumber}`);
      console.log(`From: ${segment.origin.city} (${segment.origin.code})`);
      console.log(`Departure: ${segment.origin.localDepartureDate} at ${segment.origin.localDepartureTime}`);
      console.log(`To: ${segment.destination.city} (${segment.destination.code})`);
      console.log(`Arrival: ${segment.destination.localArrivalDate} at ${segment.destination.localArrivalTime}`);
      
      if (segment.destination.dateOffset !== 0) {
        console.log(`Date Change: ${segment.destination.dateOffset > 0 ? '+' : ''}${segment.destination.dateOffset} day(s)`);
      }
      
      console.log(`Flight Duration: ${segment.duration.formatted}`);
    });
    
  } catch (error) {
    console.error('Error calculating complete itinerary:', error);
  }
}

// Example of running all demos
export async function runAllDemos(): Promise<void> {
  try {
    // Example 1: New York to London
    const originCity1 = 'New York';
    const destinationCity1 = 'London';
    
    // Filter airlines
    const airlines1 = await demoFilterAirlinesForRoute(originCity1, destinationCity1);
    
    if (airlines1.length > 0) {
      // Validate first airline
      await demoValidateAirlineForRoute(airlines1[0], originCity1, destinationCity1);
      
      // Generate itinerary
      await demoGenerateFlightItinerary(originCity1, destinationCity1, airlines1[0]);
      
      // Calculate complete itinerary
      await demoCompleteItinerary(originCity1, destinationCity1, airlines1[0]);
    }
    
    // Example 2: New York to Sydney (requires layover)
    const originCity2 = 'New York';
    const destinationCity2 = 'Sydney';
    
    // Filter airlines
    const airlines2 = await demoFilterAirlinesForRoute(originCity2, destinationCity2);
    
    if (airlines2.length > 0) {
      // Generate itinerary with layover
      await demoGenerateFlightItinerary(originCity2, destinationCity2, airlines2[0]);
      
      // Calculate complete itinerary with layover
      await demoCompleteItinerary(originCity2, destinationCity2, airlines2[0]);
    }
    
  } catch (error) {
    console.error('Error running demos:', error);
  }
}