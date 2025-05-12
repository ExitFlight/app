import { estimateFlightTimes, calculateFlightDetails, formatDuration } from './flightTimeCalculator';

/**
 * Example function to demonstrate the usage of estimateFlightTimes
 */
export async function demoEstimateFlightTimes(): Promise<void> {
  const originCode = 'JFK';  // New York
  const destCode = 'LHR';    // London
  
  console.log(`Estimating flight times for ${originCode} to ${destCode}:`);
  
  try {
    const flightTimes = await estimateFlightTimes(originCode, destCode);
    
    console.log(`Flight Duration: ${formatDuration(flightTimes.durationMinutes)}`);
    console.log(`Departure UTC: ${flightTimes.departureUTC.toISOString()}`);
    console.log(`Arrival UTC: ${flightTimes.arrivalUTC.toISOString()}`);
    
    return Promise.resolve();
  } catch (error) {
    console.error('Error estimating flight times:', error);
    return Promise.reject(error);
  }
}

/**
 * Example function to demonstrate the usage of calculateFlightDetails
 */
export async function demoCalculateFlightDetails(): Promise<void> {
  // Test cases for different region pairs
  const flightTestCases = [
    { origin: 'JFK', dest: 'LHR', description: 'Transatlantic: New York to London' },
    { origin: 'LHR', dest: 'SIN', description: 'Europe to Asia: London to Singapore' },
    { origin: 'SYD', dest: 'LAX', description: 'Transpacific: Sydney to Los Angeles' },
    { origin: 'NRT', dest: 'BKK', description: 'Within Asia: Tokyo to Bangkok' },
    { origin: 'CDG', dest: 'FCO', description: 'Within Europe: Paris to Rome' },
    { origin: 'DXB', dest: 'JNB', description: 'Middle East to Africa: Dubai to Johannesburg' },
    { origin: 'GRU', dest: 'MEX', description: 'Within Americas: São Paulo to Mexico City' },
    { origin: 'HKT', dest: 'CNX', description: 'Within Thailand: Phuket to Chiang Mai' },
  ];

  console.log('Demonstrating flight time calculations for various routes:');
  console.log('--------------------------------------------------------');
  
  try {
    for (const testCase of flightTestCases) {
      console.log(`\nRoute: ${testCase.description} (${testCase.origin} -> ${testCase.dest})`);
      
      const details = await calculateFlightDetails(testCase.origin, testCase.dest);
      
      console.log(`Departure: ${details.departureTimeLocal} (${testCase.origin} local time)`);
      console.log(`Arrival: ${details.arrivalTimeLocal} (${testCase.dest} local time)`);
      console.log(`Duration: ${details.durationFormatted}`);
      console.log(`Departure Date: ${details.departureDateLocal}`);
      console.log(`Arrival Date: ${details.arrivalDateLocal}`);
      
      // Check if arrival is on a different day
      if (details.departureDateLocal !== details.arrivalDateLocal) {
        console.log('Note: This flight arrives on a different day than departure.');
      }
    }
    
    return Promise.resolve();
  } catch (error) {
    console.error('Error calculating flight details:', error);
    return Promise.reject(error);
  }
}

/**
 * Run all demonstrations
 */
export async function runAllDemos(): Promise<void> {
  console.log('FLIGHT TIME CALCULATOR DEMONSTRATION');
  console.log('====================================');
  
  try {
    await demoEstimateFlightTimes();
    console.log('\n');
    await demoCalculateFlightDetails();
    
    return Promise.resolve();
  } catch (error) {
    console.error('Error running demos:', error);
    return Promise.reject(error);
  }
}

// Uncomment to run the demos
// runAllDemos();