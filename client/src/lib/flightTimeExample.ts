// This is a simple example showing how to use the flight time calculator

import { calculateBasicFlightDetails } from './flightTimeCalculator';

// Example function to demonstrate the flight time calculator
export async function demonstrateFlightTimeCalculation() {
  try {
    // Calculate flight details between New York and London
    const flightDetails = await calculateBasicFlightDetails('New York', 'London');
    
    console.log('Flight Details Calculation Example:');
    console.log('---------------------------------');
    console.log(`Origin: ${flightDetails.originAirport.city} (${flightDetails.originAirport.code})`);
    console.log(`Destination: ${flightDetails.destinationAirport.city} (${flightDetails.destinationAirport.code})`);
    console.log(`Departure: ${flightDetails.departureDateLocal} at ${flightDetails.departureTimeLocal}`);
    console.log(`Arrival: ${flightDetails.arrivalDateLocal} at ${flightDetails.arrivalTimeLocal}`);
    
    if (flightDetails.arrivalDateOffset === 1) {
      console.log('Arrives: Next day');
    } else if (flightDetails.arrivalDateOffset === -1) {
      console.log('Arrives: Previous day');
    } else {
      console.log('Arrives: Same day');
    }
    
    console.log(`Flight Duration: ${flightDetails.flightDurationFormatted}`);
    console.log('---------------------------------');
    
    return flightDetails;
  } catch (error) {
    console.error('Error demonstrating flight time calculation:', error);
    throw error;
  }
}

// To use this function:
/*
  import { demonstrateFlightTimeCalculation } from './flightTimeExample';
  
  // In a component or function
  useEffect(() => {
    demonstrateFlightTimeCalculation()
      .then(details => {
        // Use the flight details
        console.log('Flight calculation successful!', details);
      })
      .catch(error => {
        console.error('Flight calculation failed:', error);
      });
  }, []);
*/

// Example of using the flight calculator with specific origin and destination
export async function calculateCustomFlightTime(originCity: string, destinationCity: string) {
  try {
    const flightDetails = await calculateBasicFlightDetails(originCity, destinationCity);
    return flightDetails;
  } catch (error) {
    console.error(`Error calculating flight time from ${originCity} to ${destinationCity}:`, error);
    throw error;
  }
}