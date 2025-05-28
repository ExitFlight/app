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
  type TicketWithDetails,
  type ApiCreateTicketFlightDetails, // For type hinting in findOrCreate methods
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
  findOrCreateAirport(airportData: ApiCreateTicketFlightDetails['departure']['airport']): Promise<Airport>;


  // Airline methods
  getAirline(id: number): Promise<Airline | undefined>;
  getAirlineByCode(code: string): Promise<Airline | undefined>;
  getAllAirlines(): Promise<Airline[]>;
  createAirline(airline: InsertAirline): Promise<Airline>;
  findOrCreateAirline(airlineData: ApiCreateTicketFlightDetails['airline']): Promise<Airline>;

  // Flight methods
  getFlight(id: number): Promise<Flight | undefined>;
  getFlightWithDetails(id: number): Promise<FlightWithDetails | undefined>;
  searchFlights(params: {
    departureAirportCode: string;
    arrivalAirportCode: string;
    date: string; // This is departureDate
    time?: string;
  }): Promise<FlightWithDetails[]>;
  createFlight(flight: InsertFlight): Promise<Flight>;
  findOrCreateFlight(flightData: {
    flightNumber: string;
    airlineId: number;
    departureAirportId: number;
    arrivalAirportId: number;
    departureDate: string; // YYYY-MM-DD
    departureTime: string; // HH:MM
    arrivalDate: string;   // YYYY-MM-DD
    arrivalTime: string; // HH:MM
    duration: string;
    // price: number; // Price in cents - REMOVED
    class: string;
  }): Promise<Flight>;


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
    const airportsData: InsertAirport[] = [
      // North America
      { code: "JFK", name: "John F. Kennedy International Airport", city: "New York", country: "United States", region: "North America", latitude: "40.6413", longitude: "-73.7781" },
      { code: "LAX", name: "Los Angeles International Airport", city: "Los Angeles", country: "United States", region: "North America", latitude: "33.9416", longitude: "-118.4085" },
      { code: "CDG", name: "Charles de Gaulle Airport", city: "Paris", country: "France", region: "Europe", latitude: "49.0097", longitude: "2.5479" },
      { code: "DXB", name: "Dubai International Airport", city: "Dubai", country: "United Arab Emirates", region: "Middle East", latitude: "25.2532", longitude: "55.3657" },
      { code: "LHR", name: "London Heathrow Airport", city: "London", country: "United Kingdom", region: "Europe", latitude: "51.4700", longitude: "-0.4543" },
      { code: "DPS", name: "Ngurah Rai International Airport", city: "Denpasar", country: "Indonesia", region: "Asia", latitude: "-8.7482", longitude: "115.1672" },
      { code: "SIN", name: "Singapore Changi Airport", city: "Singapore", country: "Singapore", region: "Asia", latitude: "1.3644", longitude: "103.9915" },
    ];
    airportsData.forEach(airport => this.createAirport(airport));

    // Add airlines
    const airlinesData: InsertAirline[] = [
      { code: "AA", name: "American Airlines", logo: "american-airlines-logo.png", region: "North America" },
      { code: "DL", name: "Delta Air Lines", logo: "delta-logo.png", region: "North America" },
      { code: "BA", name: "British Airways", logo: "ba-logo.png", region: "Europe" },
      { code: "EK", name: "Emirates", logo: "emirates-logo.png", region: "Middle East" },
      { code: "SQ", name: "Singapore Airlines", logo: "sq-logo.png", region: "Asia" },
    ];
    airlinesData.forEach(airline => this.createAirline(airline));

    // Add some flights
    const sampleFlightsData: Array<Omit<InsertFlight, 'price'> & { departureAirportCode: string; arrivalAirportCode: string; airlineCode: string }> = [
      {
        flightNumber: "AA2347",
        airlineCode: "AA", airlineId: 0,
        departureAirportCode: "JFK", departureAirportId: 0,
        arrivalAirportCode: "CDG", arrivalAirportId: 0,
        departureDate: "2025-07-15",
        departureTime: "08:45",
        arrivalDate: "2025-07-15",
        arrivalTime: "20:10",
        duration: "7h 25m",
        class: "Economy"
      },
      {
        flightNumber: "EK202",
        airlineCode: "EK", airlineId: 0,
        departureAirportCode: "JFK", departureAirportId: 0,
        arrivalAirportCode: "DXB", arrivalAirportId: 0,
        departureDate: "2025-07-16",
        departureTime: "22:15",
        arrivalDate: "2025-07-17",
        arrivalTime: "19:10",
        duration: "12h 55m",
        class: "Economy"
      },
    ];

    sampleFlightsData.forEach(flightData => {
      const depAirport = Array.from(this.airports.values()).find(a => a.code === flightData.departureAirportCode);
      const arrAirport = Array.from(this.airports.values()).find(a => a.code === flightData.arrivalAirportCode);
      const airline = Array.from(this.airlines.values()).find(al => al.code === flightData.airlineCode);

      if (depAirport && arrAirport && airline) {
        this.createFlight({
          flightNumber: flightData.flightNumber,
          airlineId: airline.id,
          departureAirportId: depAirport.id,
          arrivalAirportId: arrAirport.id,
          departureDate: flightData.departureDate,
          departureTime: flightData.departureTime,
          arrivalDate: flightData.arrivalDate,
          arrivalTime: flightData.arrivalTime,
          duration: flightData.duration,
          class: flightData.class,
        });
      } else {
        console.warn(`Could not create sample flight due to missing airport/airline: ${flightData.flightNumber}`);
      }
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
    const airport: Airport = {
      ...insertAirport,
      id,
      latitude: insertAirport.latitude ? String(insertAirport.latitude) : null,
      longitude: insertAirport.longitude ? String(insertAirport.longitude) : null,
    };
    this.airports.set(id, airport);
    return airport;
  }

  async findOrCreateAirport(airportData: ApiCreateTicketFlightDetails['departure']['airport']): Promise<Airport> {
    let airport = await this.getAirportByCode(airportData.code);
    if (airport) {
      return airport;
    }
    const newAirportData: InsertAirport = {
      code: airportData.code,
      name: airportData.name,
      city: airportData.city,
      country: airportData.country,
      region: airportData.region || "Unknown",
      latitude: airportData.latitude ? String(airportData.latitude) : null,
      longitude: airportData.longitude ? String(airportData.longitude) : null,
    };
    return this.createAirport(newAirportData);
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

  async findOrCreateAirline(airlineData: ApiCreateTicketFlightDetails['airline']): Promise<Airline> {
    let airline = await this.getAirlineByCode(airlineData.code);
    if (airline) {
      return airline;
    }
    const newAirlineData: InsertAirline = {
      code: airlineData.code,
      name: airlineData.name,
      logo: airlineData.logo || `${airlineData.code.toLowerCase()}-default-logo.png`,
      region: airlineData.region || "Unknown",
    };
    return this.createAirline(newAirlineData);
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
          country: departureAirport.country,
          latitude: departureAirport.latitude,
          longitude: departureAirport.longitude
        },
        time: flight.departureTime,
        date: flight.departureDate,
      },
      arrival: {
        airport: {
          id: arrivalAirport.id,
          code: arrivalAirport.code,
          name: arrivalAirport.name,
          city: arrivalAirport.city,
          country: arrivalAirport.country,
          latitude: arrivalAirport.latitude,
          longitude: arrivalAirport.longitude
        },
        time: flight.arrivalTime,
        date: flight.arrivalDate,
      },
      duration: flight.duration,
      // price: flight.price, // REMOVED
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

    const matchingFlights = Array.from(this.flights.values()).filter(flight =>
      flight.departureAirportId === departureAirport.id &&
      flight.arrivalAirportId === arrivalAirport.id &&
      flight.departureDate === date
    );

    const flightDetailsPromises = matchingFlights.map(flight => this.getFlightWithDetails(flight.id));
    const flightDetailsResults = await Promise.all(flightDetailsPromises);

    return flightDetailsResults.filter(fd => fd !== undefined) as FlightWithDetails[];
  }


  async createFlight(insertFlight: InsertFlight): Promise<Flight> {
    const id = this.currentFlightId++;
    const flight: Flight = {
        ...insertFlight,
        id,
    };
    this.flights.set(id, flight);
    return flight;
  }

  async findOrCreateFlight(flightInput: {
    flightNumber: string;
    airlineId: number;
    departureAirportId: number;
    arrivalAirportId: number;
    departureDate: string;
    departureTime: string;
    arrivalDate: string;
    arrivalTime: string;
    duration: string;
    // price: number; // REMOVED
    class: string;
  }): Promise<Flight> {
    let flight = Array.from(this.flights.values()).find(f =>
      f.flightNumber === flightInput.flightNumber &&
      f.airlineId === flightInput.airlineId &&
      f.departureAirportId === flightInput.departureAirportId &&
      f.arrivalAirportId === flightInput.arrivalAirportId &&
      f.departureDate === flightInput.departureDate &&
      f.departureTime === flightInput.departureTime
    );

    if (flight) {
      return flight;
    }

    const newFlightData: InsertFlight = {
      flightNumber: flightInput.flightNumber,
      airlineId: flightInput.airlineId,
      departureAirportId: flightInput.departureAirportId,
      arrivalAirportId: flightInput.arrivalAirportId,
      departureDate: flightInput.departureDate,
      departureTime: flightInput.departureTime,
      arrivalDate: flightInput.arrivalDate,
      arrivalTime: flightInput.arrivalTime,
      duration: flightInput.duration,
      // price: flightInput.price, // REMOVED
      class: flightInput.class,
    };
    return this.createFlight(newFlightData);
  }


  // Passenger methods
  async getPassenger(id: number): Promise<Passenger | undefined> {
    return this.passengers.get(id);
  }

  async createPassenger(insertPassenger: InsertPassenger): Promise<Passenger> {
    const id = this.currentPassengerId++;
    const passenger: Passenger = {
       id,
      title: insertPassenger.title,
      firstName: insertPassenger.firstName,
      middleName: insertPassenger.middleName,
      lastName: insertPassenger.lastName,
      email: insertPassenger.email,
      phone: insertPassenger.phone || null,
      // passportNumber: insertPassenger.passportNumber, // Ensure this is removed if fully removed from schema
      nationality: insertPassenger.nationality,
      // birthdate: insertPassenger.birthdate, // Ensure this is removed if fully removed from schema
    };
    this.passengers.set(id, passenger);
     console.log("[MemStorage createPassenger] Stored passenger:", JSON.stringify(passenger, null, 2));
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
