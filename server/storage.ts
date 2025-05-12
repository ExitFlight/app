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
      { code: "MEX", name: "Mexico City International Airport", city: "Mexico City", country: "Mexico", region: "North America" },
      
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
      { code: "SGN", name: "Tan Son Nhat International Airport", city: "Ho Chi Minh City", country: "Vietnam", region: "Asia" },
      { code: "HAN", name: "Noi Bai International Airport", city: "Hanoi", country: "Vietnam", region: "Asia" },
      
      // Australia/NZ
      { code: "SYD", name: "Sydney Airport", city: "Sydney", country: "Australia", region: "Australia/NZ" },
      { code: "MEL", name: "Melbourne Airport", city: "Melbourne", country: "Australia", region: "Australia/NZ" },
      { code: "BNE", name: "Brisbane Airport", city: "Brisbane", country: "Australia", region: "Australia/NZ" },
      { code: "PER", name: "Perth Airport", city: "Perth", country: "Australia", region: "Australia/NZ" },
      { code: "ADL", name: "Adelaide Airport", city: "Adelaide", country: "Australia", region: "Australia/NZ" },
      { code: "AKL", name: "Auckland Airport", city: "Auckland", country: "New Zealand", region: "Australia/NZ" },
      { code: "CHC", name: "Christchurch Airport", city: "Christchurch", country: "New Zealand", region: "Australia/NZ" },
      { code: "WLG", name: "Wellington Airport", city: "Wellington", country: "New Zealand", region: "Australia/NZ" },
      
      // South America
      { code: "GRU", name: "São Paulo–Guarulhos International Airport", city: "São Paulo", country: "Brazil", region: "South America" },
      { code: "EZE", name: "Ministro Pistarini International Airport", city: "Buenos Aires", country: "Argentina", region: "South America" },
      { code: "BOG", name: "El Dorado International Airport", city: "Bogotá", country: "Colombia", region: "South America" },
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
      
      // Australia/NZ
      { code: "JQ", name: "Jetstar Airways", logo: "jetstar", region: "Australia/NZ" },
      { code: "QF", name: "Qantas Airways", logo: "qantas", region: "Australia/NZ" },
      { code: "VA", name: "Virgin Australia", logo: "virgin-australia", region: "Australia/NZ" },
      { code: "NZ", name: "Air New Zealand", logo: "air-new-zealand", region: "Australia/NZ" },
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
        logo: airline.logo
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
          logo: airline.logo
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
    const passenger: Passenger = { ...insertPassenger, id };
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
