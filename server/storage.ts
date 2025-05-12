import {
  type User,
  type InsertUser,
  type Airport,
  type InsertAirport,
  type Airline,
  type InsertAirline,
  type Flight,
  type InsertFlight,
  type Passenger,
  type InsertPassenger,
  type Ticket,
  type InsertTicket,
  type FlightWithDetails,
  type TicketWithDetails
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Airport methods
  getAirport(id: number): Promise<Airport | undefined>;
  getAirportByCode(code: string): Promise<Airport | undefined>;
  getAllAirports(): Promise<Airport[]>;
  createAirport(airport: InsertAirport): Promise<Airport>;

  // Airline methods
  getAirline(id: number): Promise<Airline | undefined>;
  getAirlineByCode(code: string): Promise<Airline | undefined>;
  getAllAirlines(): Promise<Airline[]>;
  createAirline(airline: InsertAirline): Promise<Airline>;

  // Flight methods
  getFlight(id: number): Promise<Flight | undefined>;
  getFlightWithDetails(id: number): Promise<FlightWithDetails | undefined>;
  searchFlights(params: { 
    departureAirportCode: string;
    arrivalAirportCode: string;
    date: string;
    time?: string;
  }): Promise<FlightWithDetails[]>;
  createFlight(flight: InsertFlight): Promise<Flight>;

  // Passenger methods
  getPassenger(id: number): Promise<Passenger | undefined>;
  createPassenger(passenger: InsertPassenger): Promise<Passenger>;

  // Ticket methods
  getTicket(id: number): Promise<Ticket | undefined>;
  getTicketWithDetails(id: number): Promise<TicketWithDetails | undefined>;
  createTicket(ticket: InsertTicket): Promise<Ticket>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private airports: Map<number, Airport>;
  private airlines: Map<number, Airline>;
  private flights: Map<number, Flight>;
  private passengers: Map<number, Passenger>;
  private tickets: Map<number, Ticket>;
  
  private currentUserId: number;
  private currentAirportId: number;
  private currentAirlineId: number;
  private currentFlightId: number;
  private currentPassengerId: number;
  private currentTicketId: number;

  constructor() {
    this.users = new Map();
    this.airports = new Map();
    this.airlines = new Map();
    this.flights = new Map();
    this.passengers = new Map();
    this.tickets = new Map();
    
    this.currentUserId = 1;
    this.currentAirportId = 1;
    this.currentAirlineId = 1;
    this.currentFlightId = 1;
    this.currentPassengerId = 1;
    this.currentTicketId = 1;

    // Initialize with some sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Add airports
    const airports: InsertAirport[] = [
      // North America
      { code: "JFK", name: "John F. Kennedy International Airport", city: "New York", country: "United States", region: "North America" },
      { code: "LAX", name: "Los Angeles International Airport", city: "Los Angeles", country: "United States", region: "North America" },
      { code: "ORD", name: "O'Hare International Airport", city: "Chicago", country: "United States", region: "North America" },
      { code: "YYZ", name: "Toronto Pearson International Airport", city: "Toronto", country: "Canada", region: "North America" },
      
      // Mexico
      { code: "MEX", name: "Mexico City International Airport", city: "Mexico City", country: "Mexico", region: "North America" },
      { code: "CUN", name: "Cancún International Airport", city: "Cancún", country: "Mexico", region: "North America" },
      { code: "GDL", name: "Guadalajara International Airport", city: "Guadalajara", country: "Mexico", region: "North America" },
      { code: "MTY", name: "Monterrey International Airport", city: "Monterrey", country: "Mexico", region: "North America" },
      { code: "SJD", name: "Los Cabos International Airport", city: "San José del Cabo", country: "Mexico", region: "North America" },
      { code: "PVR", name: "Licenciado Gustavo Díaz Ordaz International Airport", city: "Puerto Vallarta", country: "Mexico", region: "North America" },
      { code: "TIJ", name: "Tijuana International Airport", city: "Tijuana", country: "Mexico", region: "North America" },
      { code: "MZT", name: "General Rafael Buelna International Airport", city: "Mazatlán", country: "Mexico", region: "North America" },
      { code: "MID", name: "Manuel Crescencio Rejón International Airport", city: "Mérida", country: "Mexico", region: "North America" },
      { code: "OAX", name: "Oaxaca International Airport", city: "Oaxaca", country: "Mexico", region: "North America" },
      
      // Europe
      { code: "LHR", name: "London Heathrow Airport", city: "London", country: "United Kingdom", region: "Europe" },
      { code: "CDG", name: "Charles de Gaulle Airport", city: "Paris", country: "France", region: "Europe" },
      { code: "FRA", name: "Frankfurt Airport", city: "Frankfurt", country: "Germany", region: "Europe" },
      { code: "AMS", name: "Amsterdam Airport Schiphol", city: "Amsterdam", country: "Netherlands", region: "Europe" },
      { code: "FCO", name: "Leonardo da Vinci International Airport", city: "Rome", country: "Italy", region: "Europe" },
      
      // Middle East
      { code: "DXB", name: "Dubai International Airport", city: "Dubai", country: "United Arab Emirates", region: "Middle East" },
      { code: "DOH", name: "Hamad International Airport", city: "Doha", country: "Qatar", region: "Middle East" },
      { code: "AUH", name: "Abu Dhabi International Airport", city: "Abu Dhabi", country: "United Arab Emirates", region: "Middle East" },
      { code: "IST", name: "Istanbul Airport", city: "Istanbul", country: "Turkey", region: "Middle East" },
      { code: "SAW", name: "Istanbul Sabiha Gökçen International Airport", city: "Istanbul", country: "Turkey", region: "Middle East" },
      { code: "JED", name: "King Abdulaziz International Airport", city: "Jeddah", country: "Saudi Arabia", region: "Middle East" },
      { code: "RUH", name: "King Khalid International Airport", city: "Riyadh", country: "Saudi Arabia", region: "Middle East" },
      
      // Asia
      { code: "SIN", name: "Singapore Changi Airport", city: "Singapore", country: "Singapore", region: "Asia" },
      { code: "BKK", name: "Suvarnabhumi Airport", city: "Bangkok", country: "Thailand", region: "Asia" },
      { code: "DMK", name: "Don Mueang International Airport", city: "Bangkok", country: "Thailand", region: "Asia" },
      { code: "HKG", name: "Hong Kong International Airport", city: "Hong Kong", country: "China", region: "Asia" },
      { code: "PEK", name: "Beijing Capital International Airport", city: "Beijing", country: "China", region: "Asia" },
      { code: "HND", name: "Tokyo Haneda Airport", city: "Tokyo", country: "Japan", region: "Asia" },
      { code: "NRT", name: "Narita International Airport", city: "Tokyo", country: "Japan", region: "Asia" },
      { code: "KIX", name: "Kansai International Airport", city: "Osaka", country: "Japan", region: "Asia" },
      { code: "ICN", name: "Incheon International Airport", city: "Seoul", country: "South Korea", region: "Asia" },
      // Indonesia
      { code: "CGK", name: "Soekarno-Hatta International Airport", city: "Jakarta", country: "Indonesia", region: "Asia" },
      { code: "HLP", name: "Halim Perdanakusuma International Airport", city: "Jakarta", country: "Indonesia", region: "Asia" },
      { code: "DPS", name: "Ngurah Rai International Airport", city: "Denpasar", country: "Indonesia", region: "Asia" },
      { code: "LOP", name: "Lombok International Airport", city: "Lombok", country: "Indonesia", region: "Asia" },
      { code: "SUB", name: "Juanda International Airport", city: "Surabaya", country: "Indonesia", region: "Asia" },
      { code: "UPG", name: "Sultan Hasanuddin International Airport", city: "Makassar", country: "Indonesia", region: "Asia" },
      { code: "BDO", name: "Husein Sastranegara International Airport", city: "Bandung", country: "Indonesia", region: "Asia" },
      { code: "JOG", name: "Adisutjipto International Airport", city: "Yogyakarta", country: "Indonesia", region: "Asia" },
      { code: "SOC", name: "Adisumarmo International Airport", city: "Solo", country: "Indonesia", region: "Asia" },
      { code: "PDG", name: "Minangkabau International Airport", city: "Padang", country: "Indonesia", region: "Asia" },
      { code: "BTJ", name: "Sultan Iskandar Muda International Airport", city: "Banda Aceh", country: "Indonesia", region: "Asia" },
      { code: "PLM", name: "Sultan Mahmud Badaruddin II Airport", city: "Palembang", country: "Indonesia", region: "Asia" },
      { code: "KUL", name: "Kuala Lumpur International Airport", city: "Kuala Lumpur", country: "Malaysia", region: "Asia" },
      { code: "MNL", name: "Ninoy Aquino International Airport", city: "Manila", country: "Philippines", region: "Asia" },
      { code: "CEB", name: "Mactan-Cebu International Airport", city: "Cebu", country: "Philippines", region: "Asia" },
      { code: "BWN", name: "Brunei International Airport", city: "Bandar Seri Begawan", country: "Brunei", region: "Asia" },
      // Vietnam
      { code: "SGN", name: "Tan Son Nhat International Airport", city: "Ho Chi Minh City", country: "Vietnam", region: "Asia" },
      { code: "HAN", name: "Noi Bai International Airport", city: "Hanoi", country: "Vietnam", region: "Asia" },
      { code: "DAD", name: "Da Nang International Airport", city: "Da Nang", country: "Vietnam", region: "Asia" },
      { code: "CXR", name: "Cam Ranh International Airport", city: "Nha Trang", country: "Vietnam", region: "Asia" },
      { code: "PQC", name: "Phu Quoc International Airport", city: "Phu Quoc", country: "Vietnam", region: "Asia" },
      
      // Cambodia
      { code: "PNH", name: "Phnom Penh International Airport", city: "Phnom Penh", country: "Cambodia", region: "Asia" },
      { code: "REP", name: "Siem Reap International Airport", city: "Siem Reap", country: "Cambodia", region: "Asia" },
      { code: "KOS", name: "Sihanoukville International Airport", city: "Sihanoukville", country: "Cambodia", region: "Asia" },
      
      // Myanmar
      { code: "RGN", name: "Yangon International Airport", city: "Yangon", country: "Myanmar", region: "Asia" },
      { code: "MDL", name: "Mandalay International Airport", city: "Mandalay", country: "Myanmar", region: "Asia" },
      { code: "NYU", name: "Bagan Nyaung U Airport", city: "Bagan", country: "Myanmar", region: "Asia" },
      
      // Oceania
      // Australia
      { code: "SYD", name: "Sydney Airport", city: "Sydney", country: "Australia", region: "Oceania" },
      { code: "MEL", name: "Melbourne Airport", city: "Melbourne", country: "Australia", region: "Oceania" },
      { code: "BNE", name: "Brisbane Airport", city: "Brisbane", country: "Australia", region: "Oceania" },
      { code: "PER", name: "Perth Airport", city: "Perth", country: "Australia", region: "Oceania" },
      { code: "ADL", name: "Adelaide Airport", city: "Adelaide", country: "Australia", region: "Oceania" },
      { code: "CNS", name: "Cairns Airport", city: "Cairns", country: "Australia", region: "Oceania" },
      
      // New Zealand
      { code: "AKL", name: "Auckland Airport", city: "Auckland", country: "New Zealand", region: "Oceania" },
      { code: "CHC", name: "Christchurch Airport", city: "Christchurch", country: "New Zealand", region: "Oceania" },
      { code: "WLG", name: "Wellington Airport", city: "Wellington", country: "New Zealand", region: "Oceania" },
      { code: "ZQN", name: "Queenstown Airport", city: "Queenstown", country: "New Zealand", region: "Oceania" },
      
      // Melanesia
      // Fiji
      { code: "NAN", name: "Nadi International Airport", city: "Nadi", country: "Fiji", region: "Oceania" },
      { code: "SUV", name: "Nausori International Airport", city: "Suva", country: "Fiji", region: "Oceania" },
      // Papua New Guinea
      { code: "POM", name: "Port Moresby Jacksons International Airport", city: "Port Moresby", country: "Papua New Guinea", region: "Oceania" },
      // Solomon Islands
      { code: "HIR", name: "Honiara International Airport", city: "Honiara", country: "Solomon Islands", region: "Oceania" },
      // Vanuatu
      { code: "VLI", name: "Bauerfield International Airport", city: "Port Vila", country: "Vanuatu", region: "Oceania" },
      // New Caledonia
      { code: "NOU", name: "La Tontouta International Airport", city: "Nouméa", country: "New Caledonia", region: "Oceania" },
      
      // Micronesia
      // Guam
      { code: "GUM", name: "Antonio B. Won Pat International Airport", city: "Hagåtña", country: "Guam", region: "Oceania" },
      // Palau
      { code: "ROR", name: "Roman Tmetuchl International Airport", city: "Koror", country: "Palau", region: "Oceania" },
      // Federated States of Micronesia
      { code: "PNI", name: "Pohnpei International Airport", city: "Pohnpei", country: "Federated States of Micronesia", region: "Oceania" },
      
      // Polynesia
      // French Polynesia
      { code: "PPT", name: "Faa'a International Airport", city: "Papeete", country: "French Polynesia", region: "Oceania" },
      { code: "BOB", name: "Bora Bora Airport", city: "Bora Bora", country: "French Polynesia", region: "Oceania" },
      // Samoa
      { code: "APW", name: "Faleolo International Airport", city: "Apia", country: "Samoa", region: "Oceania" },
      // Tonga
      { code: "TBU", name: "Fua'amotu International Airport", city: "Nukuʻalofa", country: "Tonga", region: "Oceania" },
      // Cook Islands
      { code: "RAR", name: "Rarotonga International Airport", city: "Rarotonga", country: "Cook Islands", region: "Oceania" },
      
      // Central America
      { code: "SJO", name: "Juan Santamaría International Airport", city: "San José", country: "Costa Rica", region: "Central America" },
      { code: "LIR", name: "Daniel Oduber Quirós International Airport", city: "Liberia", country: "Costa Rica", region: "Central America" },
      { code: "PTY", name: "Tocumen International Airport", city: "Panama City", country: "Panama", region: "Central America" },
      { code: "SAL", name: "El Salvador International Airport", city: "San Salvador", country: "El Salvador", region: "Central America" },
      { code: "GUA", name: "La Aurora International Airport", city: "Guatemala City", country: "Guatemala", region: "Central America" },
      { code: "BZE", name: "Philip S. W. Goldson International Airport", city: "Belize City", country: "Belize", region: "Central America" },
      { code: "MGA", name: "Augusto C. Sandino International Airport", city: "Managua", country: "Nicaragua", region: "Central America" },
      { code: "SAP", name: "Ramón Villeda Morales International Airport", city: "San Pedro Sula", country: "Honduras", region: "Central America" },
      { code: "TGU", name: "Toncontín International Airport", city: "Tegucigalpa", country: "Honduras", region: "Central America" },
      
      // South America
      // Brazil
      { code: "GRU", name: "São Paulo–Guarulhos International Airport", city: "São Paulo", country: "Brazil", region: "South America" },
      { code: "GIG", name: "Rio de Janeiro–Galeão International Airport", city: "Rio de Janeiro", country: "Brazil", region: "South America" },
      { code: "BSB", name: "Brasília International Airport", city: "Brasília", country: "Brazil", region: "South America" },
      { code: "CNF", name: "Belo Horizonte International Airport", city: "Belo Horizonte", country: "Brazil", region: "South America" },
      { code: "SSA", name: "Salvador International Airport", city: "Salvador", country: "Brazil", region: "South America" },
      // Argentina
      { code: "EZE", name: "Ministro Pistarini International Airport", city: "Buenos Aires", country: "Argentina", region: "South America" },
      { code: "AEP", name: "Jorge Newbery Airfield", city: "Buenos Aires", country: "Argentina", region: "South America" },
      { code: "COR", name: "Ingeniero Aeronáutico Ambrosio L.V. Taravella International Airport", city: "Córdoba", country: "Argentina", region: "South America" },
      { code: "MDZ", name: "Governor Francisco Gabrielli International Airport", city: "Mendoza", country: "Argentina", region: "South America" },
      // Colombia
      { code: "BOG", name: "El Dorado International Airport", city: "Bogotá", country: "Colombia", region: "South America" },
      { code: "MDE", name: "José María Córdova International Airport", city: "Medellín", country: "Colombia", region: "South America" },
      { code: "CTG", name: "Rafael Núñez International Airport", city: "Cartagena", country: "Colombia", region: "South America" },
      // Peru
      { code: "LIM", name: "Jorge Chávez International Airport", city: "Lima", country: "Peru", region: "South America" },
      { code: "CUZ", name: "Alejandro Velasco Astete International Airport", city: "Cusco", country: "Peru", region: "South America" },
      // Chile
      { code: "SCL", name: "Arturo Merino Benítez International Airport", city: "Santiago", country: "Chile", region: "South America" },
      // Ecuador
      { code: "UIO", name: "Mariscal Sucre International Airport", city: "Quito", country: "Ecuador", region: "South America" },
      { code: "GYE", name: "José Joaquín de Olmedo International Airport", city: "Guayaquil", country: "Ecuador", region: "South America" },
      // Venezuela
      { code: "CCS", name: "Simón Bolívar International Airport", city: "Caracas", country: "Venezuela", region: "South America" },
      // Bolivia
      { code: "LPB", name: "El Alto International Airport", city: "La Paz", country: "Bolivia", region: "South America" },
      { code: "VVI", name: "Viru Viru International Airport", city: "Santa Cruz", country: "Bolivia", region: "South America" },
      // Paraguay
      { code: "ASU", name: "Silvio Pettirossi International Airport", city: "Asunción", country: "Paraguay", region: "South America" },
      // Uruguay
      { code: "MVD", name: "Carrasco International Airport", city: "Montevideo", country: "Uruguay", region: "South America" },
    ];

    airports.forEach(airport => this.createAirport(airport));

    // Add airlines
    const airlines: InsertAirline[] = [
      // North America
      { code: "AA", name: "American Airlines", logo: "american-airlines", region: "North America" },
      { code: "AS", name: "Alaska Airlines", logo: "alaska-airlines", region: "North America" },
      { code: "B6", name: "JetBlue Airways", logo: "jetblue-airways", region: "North America" },
      { code: "DL", name: "Delta Air Lines", logo: "delta-airlines", region: "North America" },
      { code: "F9", name: "Frontier Airlines", logo: "frontier-airlines", region: "North America" },
      { code: "HA", name: "Hawaiian Airlines", logo: "hawaiian-airlines", region: "North America" },
      { code: "NK", name: "Spirit Airlines", logo: "spirit-airlines", region: "North America" },
      { code: "UA", name: "United Airlines", logo: "united-airlines", region: "North America" },
      { code: "WN", name: "Southwest Airlines", logo: "southwest-airlines", region: "North America" },
      { code: "AC", name: "Air Canada", logo: "air-canada", region: "North America" },
      
      // Europe
      { code: "AF", name: "Air France", logo: "air-france", region: "Europe" },
      { code: "LH", name: "Lufthansa", logo: "lufthansa", region: "Europe" },
      { code: "KL", name: "KLM Royal Dutch Airlines", logo: "klm", region: "Europe" },
      { code: "BA", name: "British Airways", logo: "british-airways", region: "Europe" },
      
      // Middle East
      { code: "QR", name: "Qatar Airways", logo: "qatar-airways", region: "Middle East" },
      { code: "SV", name: "Saudia", logo: "saudia-airlines", region: "Middle East" },
      { code: "TK", name: "Turkish Airlines", logo: "turkish-airlines", region: "Middle East" },
      { code: "EK", name: "Emirates", logo: "emirates", region: "Middle East" },
      { code: "EY", name: "Etihad Airways", logo: "etihad-airways", region: "Middle East" },
      
      // Asia
      { code: "BI", name: "Royal Brunei Airlines", logo: "royal-brunei", region: "Asia" },
      { code: "CX", name: "Cathay Pacific", logo: "cathay-pacific", region: "Asia" },
      { code: "GA", name: "Garuda Indonesia", logo: "garuda-indonesia", region: "Asia" },
      { code: "JT", name: "Lion Air", logo: "lion-air", region: "Asia" },
      { code: "JL", name: "Japan Airlines", logo: "japan-airlines", region: "Asia" },
      { code: "NH", name: "All Nippon Airways", logo: "ana", region: "Asia" },
      { code: "AK", name: "AirAsia", logo: "airasia", region: "Asia" },
      { code: "MH", name: "Malaysia Airlines", logo: "malaysia-airlines", region: "Asia" },
      { code: "5J", name: "Cebu Pacific", logo: "cebu-pacific", region: "Asia" },
      { code: "PR", name: "Philippine Airlines", logo: "philippine-airlines", region: "Asia" },
      { code: "SQ", name: "Singapore Airlines", logo: "singapore-airlines", region: "Asia" },
      { code: "TR", name: "Scoot", logo: "scoot", region: "Asia" },
      { code: "KE", name: "Korean Air", logo: "korean-air", region: "Asia" },
      { code: "FD", name: "Thai AirAsia", logo: "thai-airasia", region: "Asia" },
      { code: "TG", name: "Thai Airways", logo: "thai-airways", region: "Asia" },
      { code: "VJ", name: "VietJet Air", logo: "vietjet-air", region: "Asia" },
      { code: "VN", name: "Vietnam Airlines", logo: "vietnam-airlines", region: "Asia" },
      
      // Central America
      { code: "TA", name: "Avianca Costa Rica", logo: "avianca", region: "Central America" },
      { code: "LR", name: "LACSA", logo: "lacsa", region: "Central America" },
      { code: "CM", name: "Copa Airlines", logo: "copa-airlines", region: "Central America" },
      { code: "AV", name: "TACA Airlines", logo: "taca", region: "Central America" },
      { code: "5Q", name: "Volaris Costa Rica", logo: "volaris", region: "Central America" },
      
      // South America
      { code: "LA", name: "LATAM Airlines", logo: "latam", region: "South America" },
      { code: "JJ", name: "LATAM Brasil", logo: "latam-brasil", region: "South America" },
      { code: "AV", name: "Avianca", logo: "avianca", region: "South America" },
      { code: "H2", name: "Sky Airline", logo: "sky-airline", region: "South America" },
      { code: "AD", name: "Azul Brazilian Airlines", logo: "azul", region: "South America" },
      { code: "G3", name: "Gol Transportes Aéreos", logo: "gol", region: "South America" },
      { code: "AR", name: "Aerolíneas Argentinas", logo: "aerolineas-argentinas", region: "South America" },
      { code: "LP", name: "LATAM Peru", logo: "latam-peru", region: "South America" },
      { code: "P9", name: "Peruvian Airlines", logo: "peruvian", region: "South America" },
      { code: "OB", name: "Boliviana de Aviación", logo: "boa", region: "South America" },
      
      // Oceania
      // Australia & New Zealand
      { code: "JQ", name: "Jetstar Airways", logo: "jetstar", region: "Oceania" },
      { code: "QF", name: "Qantas Airways", logo: "qantas", region: "Oceania" },
      { code: "VA", name: "Virgin Australia", logo: "virgin-australia", region: "Oceania" },
      { code: "NZ", name: "Air New Zealand", logo: "air-new-zealand", region: "Oceania" },
      // Melanesia
      { code: "FJ", name: "Fiji Airways", logo: "fiji-airways", region: "Oceania" },
      { code: "PX", name: "Air Niugini", logo: "air-niugini", region: "Oceania" },
      { code: "IE", name: "Solomon Airlines", logo: "solomon-airlines", region: "Oceania" },
      { code: "NF", name: "Air Vanuatu", logo: "air-vanuatu", region: "Oceania" },
      { code: "SB", name: "Air Calin", logo: "air-calin", region: "Oceania" },
      // Micronesia & Polynesia
      { code: "GU", name: "United Airlines Guam", logo: "united-airlines", region: "Oceania" },
      { code: "TN", name: "Air Tahiti Nui", logo: "air-tahiti-nui", region: "Oceania" },
      { code: "VT", name: "Air Tahiti", logo: "air-tahiti", region: "Oceania" },
      { code: "DN", name: "Air Nauru", logo: "air-nauru", region: "Oceania" },
      { code: "HW", name: "Hawaiian Airlines", logo: "hawaiian-airlines", region: "Oceania" },
      { code: "MU", name: "Air Marshall Islands", logo: "air-marshall", region: "Oceania" },
      { code: "ON", name: "Air Nauru", logo: "air-nauru", region: "Oceania" },
      { code: "OG", name: "Air Rarotonga", logo: "air-rarotonga", region: "Oceania" },
      { code: "RA", name: "Royal Tongan Airlines", logo: "royal-tongan", region: "Oceania" },
    ];

    airlines.forEach(airline => this.createAirline(airline));

    // Add some flights
    const flights: Array<InsertFlight & { departureAirportCode: string; arrivalAirportCode: string }> = [
      { 
        flightNumber: "AA-2347", 
        airlineId: 1, 
        departureAirportCode: "JFK", 
        departureAirportId: 1, 
        arrivalAirportCode: "CDG", 
        arrivalAirportId: 4, 
        departureTime: "08:45", 
        arrivalTime: "12:10", 
        duration: "3h 25m", 
        price: "$249", 
        class: "Economy" 
      },
      { 
        flightNumber: "DL-4522", 
        airlineId: 2, 
        departureAirportCode: "JFK", 
        departureAirportId: 1, 
        arrivalAirportCode: "CDG", 
        arrivalAirportId: 4, 
        departureTime: "11:20", 
        arrivalTime: "15:10", 
        duration: "3h 50m", 
        price: "$289", 
        class: "Economy" 
      },
      { 
        flightNumber: "BA-1775", 
        airlineId: 3, 
        departureAirportCode: "JFK", 
        departureAirportId: 1, 
        arrivalAirportCode: "CDG", 
        arrivalAirportId: 4, 
        departureTime: "16:35", 
        arrivalTime: "20:15", 
        duration: "3h 40m", 
        price: "$319", 
        class: "Economy" 
      },
      { 
        flightNumber: "AA-1121", 
        airlineId: 1, 
        departureAirportCode: "LAX", 
        departureAirportId: 2, 
        arrivalAirportCode: "JFK", 
        arrivalAirportId: 1, 
        departureTime: "09:15", 
        arrivalTime: "17:40", 
        duration: "5h 25m", 
        price: "$329", 
        class: "Economy" 
      },
      { 
        flightNumber: "EK-202", 
        airlineId: 4, 
        departureAirportCode: "JFK", 
        departureAirportId: 1, 
        arrivalAirportCode: "DXB", 
        arrivalAirportId: 5, 
        departureTime: "22:15", 
        arrivalTime: "19:10", 
        duration: "12h 55m", 
        price: "$899", 
        class: "Economy" 
      },
    ];

    flights.forEach(flightData => {
      const { departureAirportCode, arrivalAirportCode, ...flight } = flightData;
      this.createFlight(flight);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Airport methods
  async getAirport(id: number): Promise<Airport | undefined> {
    return this.airports.get(id);
  }

  async getAirportByCode(code: string): Promise<Airport | undefined> {
    return Array.from(this.airports.values()).find(
      (airport) => airport.code === code,
    );
  }

  async getAllAirports(): Promise<Airport[]> {
    return Array.from(this.airports.values());
  }

  async createAirport(insertAirport: InsertAirport): Promise<Airport> {
    const id = this.currentAirportId++;
    const airport: Airport = { ...insertAirport, id };
    this.airports.set(id, airport);
    return airport;
  }

  // Airline methods
  async getAirline(id: number): Promise<Airline | undefined> {
    return this.airlines.get(id);
  }

  async getAirlineByCode(code: string): Promise<Airline | undefined> {
    return Array.from(this.airlines.values()).find(
      (airline) => airline.code === code,
    );
  }

  async getAllAirlines(): Promise<Airline[]> {
    return Array.from(this.airlines.values());
  }

  async createAirline(insertAirline: InsertAirline): Promise<Airline> {
    const id = this.currentAirlineId++;
    const airline: Airline = { ...insertAirline, id };
    this.airlines.set(id, airline);
    return airline;
  }

  // Flight methods
  async getFlight(id: number): Promise<Flight | undefined> {
    return this.flights.get(id);
  }

  async getFlightWithDetails(id: number): Promise<FlightWithDetails | undefined> {
    const flight = this.flights.get(id);
    if (!flight) return undefined;

    const airline = await this.getAirline(flight.airlineId);
    const departureAirport = await this.getAirport(flight.departureAirportId);
    const arrivalAirport = await this.getAirport(flight.arrivalAirportId);

    if (!airline || !departureAirport || !arrivalAirport) return undefined;

    return {
      id: flight.id,
      flightNumber: flight.flightNumber,
      airline: {
        id: airline.id,
        code: airline.code,
        name: airline.name,
        logo: airline.logo,
        region: airline.region
      },
      departure: {
        airport: {
          id: departureAirport.id,
          code: departureAirport.code,
          name: departureAirport.name,
          city: departureAirport.city,
          country: departureAirport.country
        },
        time: flight.departureTime
      },
      arrival: {
        airport: {
          id: arrivalAirport.id,
          code: arrivalAirport.code,
          name: arrivalAirport.name,
          city: arrivalAirport.city,
          country: arrivalAirport.country
        },
        time: flight.arrivalTime
      },
      duration: flight.duration,
      price: flight.price,
      class: flight.class
    };
  }

  async searchFlights(params: { 
    departureAirportCode: string;
    arrivalAirportCode: string;
    date: string;
    time?: string;
  }): Promise<FlightWithDetails[]> {
    const { departureAirportCode, arrivalAirportCode, date, time } = params;
    
    const departureAirport = await this.getAirportByCode(departureAirportCode);
    const arrivalAirport = await this.getAirportByCode(arrivalAirportCode);
    
    if (!departureAirport || !arrivalAirport) return [];
    
    const flights = Array.from(this.flights.values()).filter(flight => 
      flight.departureAirportId === departureAirport.id && 
      flight.arrivalAirportId === arrivalAirport.id
    );
    
    // Create flight details for each flight
    const flightDetails: FlightWithDetails[] = [];
    
    for (const flight of flights) {
      const airline = await this.getAirline(flight.airlineId);
      if (!airline) continue;
      
      flightDetails.push({
        id: flight.id,
        flightNumber: flight.flightNumber,
        airline: {
          id: airline.id,
          code: airline.code,
          name: airline.name,
          logo: airline.logo,
          region: airline.region
        },
        departure: {
          airport: {
            id: departureAirport.id,
            code: departureAirport.code,
            name: departureAirport.name,
            city: departureAirport.city,
            country: departureAirport.country
          },
          time: flight.departureTime
        },
        arrival: {
          airport: {
            id: arrivalAirport.id,
            code: arrivalAirport.code,
            name: arrivalAirport.name,
            city: arrivalAirport.city,
            country: arrivalAirport.country
          },
          time: flight.arrivalTime
        },
        duration: flight.duration,
        price: flight.price,
        class: flight.class
      });
    }
    
    return flightDetails;
  }

  async createFlight(insertFlight: InsertFlight): Promise<Flight> {
    const id = this.currentFlightId++;
    const flight: Flight = { ...insertFlight, id };
    this.flights.set(id, flight);
    return flight;
  }

  // Passenger methods
  async getPassenger(id: number): Promise<Passenger | undefined> {
    return this.passengers.get(id);
  }

  async createPassenger(insertPassenger: InsertPassenger): Promise<Passenger> {
    const id = this.currentPassengerId++;
    // Create a properly typed passenger object
    const passenger: Passenger = { 
      id,
      firstName: insertPassenger.firstName,
      lastName: insertPassenger.lastName,
      email: insertPassenger.email,
      phone: insertPassenger.phone || null,  // Explicitly handle the nullable phone
      passportNumber: insertPassenger.passportNumber,
      nationality: insertPassenger.nationality,
      birthdate: insertPassenger.birthdate
    };
    this.passengers.set(id, passenger);
    return passenger;
  }

  // Ticket methods
  async getTicket(id: number): Promise<Ticket | undefined> {
    return this.tickets.get(id);
  }

  async getTicketWithDetails(id: number): Promise<TicketWithDetails | undefined> {
    const ticket = this.tickets.get(id);
    if (!ticket) return undefined;

    const flightDetails = await this.getFlightWithDetails(ticket.flightId);
    const passenger = await this.getPassenger(ticket.passengerId);

    if (!flightDetails || !passenger) return undefined;

    return {
      id: ticket.id,
      flight: flightDetails,
      passenger,
      seatNumber: ticket.seatNumber,
      bookingReference: ticket.bookingReference,
      gate: ticket.gate,
      boardingTime: ticket.boardingTime,
      createdAt: ticket.createdAt
    };
  }

  async createTicket(insertTicket: InsertTicket): Promise<Ticket> {
    const id = this.currentTicketId++;
    const ticket: Ticket = { 
      ...insertTicket, 
      id,
      createdAt: new Date() 
    };
    this.tickets.set(id, ticket);
    return ticket;
  }
}

export const storage = new MemStorage();
