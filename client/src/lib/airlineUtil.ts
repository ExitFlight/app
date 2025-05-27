// Grouped airlines by region
export const airlinesGroupedByRegion = [
  {
    regionName: "North America",
    airlines: [
      // USA
      { code: "AA", name: "American Airlines" },
      { code: "AS", name: "Alaska Airlines" },
      { code: "B6", name: "JetBlue Airways" },
      { code: "DL", name: "Delta Air Lines" },
      //{ code: "F9", name: "Frontier Airlines" },
      { code: "HA", name: "Hawaiian Airlines" },
      //{ code: "NK", name: "Spirit Airlines" },
      { code: "UA", name: "United Airlines" },
      { code: "WN", name: "Southwest Airlines" },
      // Canada
      { code: "AC", name: "Air Canada" },
      //{ code: "WS", name: "WestJet" }
    ].sort((a, b) => a.name.localeCompare(b.name)), // Sort airlines within the region
  },
  {
    regionName: "Europe",
    airlines: [
      // UK
      { code: "BA", name: "British Airways" },
      { code: "VS", name: "Virgin Atlantic" },
      // Germany
      //{ code: "LH", name: "Lufthansa" },
      //{ code: "DE", name: "Condor" },
      // France
      { code: "AF", name: "Air France" },
      // Netherlands
      { code: "KL", name: "KLM Royal Dutch Airlines" },
      // Spain
      //{ code: "IB", name: "Iberia" },
      //{ code: "UX", name: "Air Europa" },
      // Italy
      //{ code: "AZ", name: "ITA Airways (Alitalia)" },
      // Switzerland
      //{ code: "LX", name: "SWISS" },
      // Ireland
      //{ code: "EI", name: "Aer Lingus" },
      // Scandinavia
      { code: "SK", name: "SAS Scandinavian" },
      { code: "DY", name: "Norwegian Air" },
      //{ code: "AY", name: "Finnair" }
    ].sort((a, b) => a.name.localeCompare(b.name)),
  },
  {
    regionName: "Middle East",
    airlines: [
      // UAE
      { code: "EK", name: "Emirates" },
      { code: "EY", name: "Etihad Airways" },
      //{ code: "FZ", name: "flydubai" },
      // Qatar
      { code: "QR", name: "Qatar Airways" },
      // Saudi Arabia
      // { code: "SV", name: "Saudia" },
      // // Turkey
      // { code: "TK", name: "Turkish Airlines" },
      // // Jordan
      // { code: "RJ", name: "Royal Jordanian" },
      // // Israel
      // { code: "LY", name: "El Al Israel Airlines" },
      // // Oman
      // { code: "WY", name: "Oman Air" }
    ].sort((a, b) => a.name.localeCompare(b.name)),
  },
  {
    regionName: "Asia",
    airlines: [
      // China
      { code: "AK", name: "AirAsia" },
      //{ code: "CA", name: "Air China" },
      //{ code: "MU", name: "China Eastern" },
      { code: "CZ", name: "China Southern" },
      // Hong Kong
      { code: "CX", name: "Cathay Pacific" },
      // Japan
      { code: "JL", name: "Japan Airlines" },
      //{ code: "NH", name: "All Nippon Airways" },
      // South Korea
      { code: "KE", name: "Korean Air" },
      //{ code: "OZ", name: "Asiana Airlines" },
      // Thailand
      { code: "TG", name: "Thai Airways" },
      // Singapore
      { code: "SQ", name: "Singapore Airlines" },
      // Malaysia
      { code: "MH", name: "Malaysia Airlines" },
      // Indonesia
      { code: "GA", name: "Garuda Indonesia" },
      // Vietnam
      { code: "VN", name: "Vietnam Airlines" },
      // India
      //{ code: "AI", name: "Air India" },
      // { code: "UK", name: "Vistara" },
      // { code: "6E", name: "IndiGo" }
    ].sort((a, b) => a.name.localeCompare(b.name)),
  },
  {
    regionName: "Oceania",
    airlines: [
      // Australia
      { code: "QF", name: "Qantas" },
      { code: "VA", name: "Virgin Australia" },
      { code: "JQ", name: "Jetstar" },
      // New Zealand
      { code: "NZ", name: "Air New Zealand" },
      // Fiji
      //{ code: "FJ", name: "Fiji Airways" },
      // Papua New Guinea
      //{ code: "PX", name: "Air Niugini" }
    ].sort((a, b) => a.name.localeCompare(b.name)),
  },
  {
    regionName: "Africa",
    airlines: [
      // South Africa
      { code: "SA", name: "South African Airways" },
      //{ code: "CAW", name: "Comair (South Africa)" },
      // Ethiopia
      //{ code: "ET", name: "Ethiopian Airlines" },
      // Kenya
      //{ code: "KQ", name: "Kenya Airways" },
      // Egypt
      { code: "MS", name: "EgyptAir" },
      // Morocco
      { code: "AT", name: "Royal Air Maroc" },
      // Nigeria
      //{ code: "W3", name: "Arik Air" },
      // Algeria
      //{ code: "AH", name: "Air Algérie" },
      // Tunisia
      //{ code: "TU", name: "Tunisair" },
      // Mauritius
      //{ code: "MK", name: "Air Mauritius" }
    ].sort((a, b) => a.name.localeCompare(b.name)),
  },
  {
    regionName: "Central America & Caribbean",
    airlines: [
      // Panama
      { code: "CM", name: "Copa Airlines" },
      // Costa Rica
      { code: "LR", name: "LACSA (Avianca Costa Rica)" },
      // El Salvador
      //{ code: "TA", name: "TACA (Avianca El Salvador)" },
      // Dominican Republic
      //{ code: "7I", name: "Aerolínea Mas" },
      // Cuba
      //{ code: "CU", name: "Cubana de Aviación" },
      // Jamaica
      //{ code: "BW", name: "Caribbean Airlines" },
      // Mexico (often grouped with Central America)
      { code: "AM", name: "Aeroméxico" },
      //{ code: "Y4", name: "Volaris" },
      //{ code: "4O", name: "Interjet" }
    ].sort((a, b) => a.name.localeCompare(b.name)),
  },
  {
    regionName: "South America",
    airlines: [
      // // Brazil
      // { code: "G3", name: "Gol Transportes Aéreos" },
      // { code: "JJ", name: "LATAM Brasil" },
      // { code: "AD", name: "Azul Brazilian Airlines" },
      // Chile
      { code: "LA", name: "LATAM Chile" },
      // Colombia
      { code: "AV", name: "Avianca" },
      // Argentina
      //{ code: "AR", name: "Aerolíneas Argentinas" },
      // Peru
      { code: "LP", name: "LATAM Perú" },
      // Ecuador
      { code: "EQ", name: "TAME" },
      // Venezuela
      //{ code: "V0", name: "Conviasa" },
    ].sort((a, b) => a.name.localeCompare(b.name)),
  },
].sort((a, b) => a.regionName.localeCompare(b.regionName)); // Sort regions by name

// Flattened list of all airlines
export const allAirlines = airlinesGroupedByRegion.flatMap(region => region.airlines);

// Helper function to find airlines that operate in a specific region
export function getAirlinesForRegion(regionName: string) {
  if (regionName === "All Regions") {
    return allAirlines;
  }
  
  const regionGroup = airlinesGroupedByRegion.find(group => group.regionName === regionName);
  return regionGroup ? regionGroup.airlines : [];
}

// Helper to get common airlines for a departure airport
export function getAirlinesForAirport(airportCode: string): any[] {
  // Map airport code to region (could be enhanced with more specific airport-to-airline mappings)
  const regions: {[key: string]: string} = {
    // North America
    'JFK': 'North America', 'LAX': 'North America', 'SFO': 'North America', 'ORD': 'North America', 
    'DFW': 'North America', 'MIA': 'North America', 'ATL': 'North America', 'SEA': 'North America',
    'HNL': 'North America', 'YYZ': 'North America', 'MEX': 'North America',
    
    // Europe
    'LHR': 'Europe', 'CDG': 'Europe', 'FRA': 'Europe', 'AMS': 'Europe', 'MAD': 'Europe',
    'FCO': 'Europe', 'MUC': 'Europe', 'ZRH': 'Europe',
    
    // Asia
    'PEK': 'Asia', 'PVG': 'Asia', 'HND': 'Asia', 'NRT': 'Asia', 'ICN': 'Asia',
    'SIN': 'Asia', 'BKK': 'Asia', 'KUL': 'Asia', 'HKG': 'Asia', 'TPE': 'Asia', 'KIX': 'Asia',
    
    // Middle East
    'DXB': 'Middle East', 'DOH': 'Middle East', 'AUH': 'Middle East',
    
    // Oceania
    'SYD': 'Oceania', 'MEL': 'Oceania', 'BNE': 'Oceania', 'AKL': 'Oceania',
    
    // Africa
    'JNB': 'Africa', 'CPT': 'Africa', 'CAI': 'Africa', 'CMN': 'Africa', 
    
    // South America
    'GRU': 'South America', 'EZE': 'South America', 'BOG': 'South America', 'SCL': 'South America'
  };
  
  const region = regions[airportCode] || "All Regions";
  return getAirlinesForRegion(region);
}