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
      // United States
      { code: "JFK", name: "John F. Kennedy International Airport", city: "New York", country: "United States", region: "North America", latitude: 40.6413, longitude: -73.7781 },
      { code: "ATL", name: "Hartsfield-Jackson Atlanta International Airport", city: "Atlanta", country: "United States", region: "North America", latitude: 33.6407, longitude: -84.4277 },
      { code: "LAX", name: "Los Angeles International Airport", city: "Los Angeles", country: "United States", region: "North America", latitude: 33.9416, longitude: -118.4085 },
      { code: "ORD", name: "O'Hare International Airport", city: "Chicago", country: "United States", region: "North America", latitude: 41.9742, longitude: -87.9073 },
      { code: "DFW", name: "Dallas/Fort Worth International Airport", city: "Dallas-Fort Worth", country: "United States", region: "North America", latitude: 32.8998, longitude: -97.0403 },
      { code: "DEN", name: "Denver International Airport", city: "Denver", country: "United States", region: "North America", latitude: 39.8561, longitude: -104.6737 },
      { code: "CLT", name: "Charlotte Douglas International Airport", city: "Charlotte", country: "United States", region: "North America", latitude: 35.2140, longitude: -80.9431 },
      { code: "MIA", name: "Miami International Airport", city: "Miami", country: "United States", region: "North America", latitude: 25.7959, longitude: -80.2871 },
      { code: "SFO", name: "San Francisco International Airport", city: "San Francisco", country: "United States", region: "North America", latitude: 37.6213, longitude: -122.3790 },
      { code: "SEA", name: "Seattle-Tacoma International Airport", city: "Seattle", country: "United States", region: "North America", latitude: 47.4480, longitude: -122.3088 },
      { code: "IAH", name: "George Bush Intercontinental Airport", city: "Houston", country: "United States", region: "North America", latitude: 29.9902, longitude: -95.3368 },
      { code: "PHX", name: "Phoenix Sky Harbor International Airport", city: "Phoenix", country: "United States", region: "North America", latitude: 33.4343, longitude: -112.0081 },
      { code: "LAS", name: "Harry Reid International Airport", city: "Las Vegas", country: "United States", region: "North America", latitude: 36.0840, longitude: -115.1537 },
      { code: "ANC", name: "Ted Stevens Anchorage International Airport", city: "Anchorage", country: "United States", region: "North America", latitude: 61.1744, longitude: -149.9963 },
      
      // Canada
      { code: "YYZ", name: "Toronto Pearson International Airport", city: "Toronto", country: "Canada", region: "North America", latitude: 43.6777, longitude: -79.6248 },
      { code: "YVR", name: "Vancouver International Airport", city: "Vancouver", country: "Canada", region: "North America", latitude: 49.1939, longitude: -123.1840 },
      { code: "YYC", name: "Calgary International Airport", city: "Calgary", country: "Canada", region: "North America", latitude: 51.1215, longitude: -114.0200 },
      
      // Mexico
      { code: "MEX", name: "Mexico City International Airport", city: "Mexico City", country: "Mexico", region: "North America", latitude: 19.4363, longitude: -99.0721 },
      { code: "CUN", name: "Cancún International Airport", city: "Cancún", country: "Mexico", region: "North America", latitude: 21.0365, longitude: -86.8771 },
      { code: "GDL", name: "Guadalajara International Airport", city: "Guadalajara", country: "Mexico", region: "North America", latitude: 20.5218, longitude: -103.3110 },
      { code: "MTY", name: "Monterrey International Airport", city: "Monterrey", country: "Mexico", region: "North America", latitude: 25.7785, longitude: -100.1160 },
      { code: "SJD", name: "Los Cabos International Airport", city: "San José del Cabo", country: "Mexico", region: "North America", latitude: 23.1518, longitude: -109.7210 },
      { code: "PVR", name: "Licenciado Gustavo Díaz Ordaz International Airport", city: "Puerto Vallarta", country: "Mexico", region: "North America", latitude: 20.6800, longitude: -105.2540 },
      { code: "TIJ", name: "Tijuana International Airport", city: "Tijuana", country: "Mexico", region: "North America", latitude: 32.5411, longitude: -116.9700 },
      { code: "MZT", name: "General Rafael Buelna International Airport", city: "Mazatlán", country: "Mexico", region: "North America", latitude: 23.1613, longitude: -106.2640 },
      { code: "MID", name: "Manuel Crescencio Rejón International Airport", city: "Mérida", country: "Mexico", region: "North America", latitude: 20.9369, longitude: -89.6577 },
      { code: "OAX", name: "Oaxaca International Airport", city: "Oaxaca", country: "Mexico", region: "North America", latitude: 16.9993, longitude: -96.7265 },
      
      // Europe
      { code: "LHR", name: "London Heathrow Airport", city: "London", country: "United Kingdom", region: "Europe", latitude: 51.4700, longitude: -0.4543 },
      { code: "CDG", name: "Charles de Gaulle Airport", city: "Paris", country: "France", region: "Europe", latitude: 49.0097, longitude: 2.5479 },
      { code: "FRA", name: "Frankfurt Airport", city: "Frankfurt", country: "Germany", region: "Europe", latitude: 50.0379, longitude: 8.5622 },
      { code: "AMS", name: "Amsterdam Airport Schiphol", city: "Amsterdam", country: "Netherlands", region: "Europe", latitude: 52.3105, longitude: 4.7683 },
      { code: "FCO", name: "Leonardo da Vinci International Airport", city: "Rome", country: "Italy", region: "Europe", latitude: 41.8003, longitude: 12.2388 },
      
      // Northern Europe
      // Sweden
      { code: "ARN", name: "Stockholm Arlanda Airport", city: "Stockholm", country: "Sweden", region: "Europe", latitude: 59.6498, longitude: 17.9238 },
      { code: "BMA", name: "Stockholm Bromma Airport", city: "Stockholm", country: "Sweden", region: "Europe", latitude: 59.3544, longitude: 17.9416 },
      { code: "GOT", name: "Göteborg Landvetter Airport", city: "Gothenburg", country: "Sweden", region: "Europe", latitude: 57.6628, longitude: 12.2798 },
      { code: "MMX", name: "Malmö Airport", city: "Malmö", country: "Sweden", region: "Europe", latitude: 55.5300, longitude: 13.3717 },
      
      // Denmark
      { code: "CPH", name: "Copenhagen Airport", city: "Copenhagen", country: "Denmark", region: "Europe", latitude: 55.6180, longitude: 12.6560 },
      { code: "BLL", name: "Billund Airport", city: "Billund", country: "Denmark", region: "Europe", latitude: 55.7403, longitude: 9.1518 },
      { code: "AAL", name: "Aalborg Airport", city: "Aalborg", country: "Denmark", region: "Europe", latitude: 57.0928, longitude: 9.8728 },
      
      // Norway
      { code: "OSL", name: "Oslo Airport, Gardermoen", city: "Oslo", country: "Norway", region: "Europe", latitude: 60.1976, longitude: 11.1004 },
      { code: "BGO", name: "Bergen Airport, Flesland", city: "Bergen", country: "Norway", region: "Europe", latitude: 60.2934, longitude: 5.2183 },
      { code: "TRD", name: "Trondheim Airport, Værnes", city: "Trondheim", country: "Norway", region: "Europe", latitude: 63.4578, longitude: 10.9240 },
      { code: "SVG", name: "Stavanger Airport, Sola", city: "Stavanger", country: "Norway", region: "Europe", latitude: 58.8767, longitude: 5.6378 },
      { code: "TOS", name: "Tromsø Airport", city: "Tromsø", country: "Norway", region: "Europe", latitude: 69.6833, longitude: 18.9167 },
      
      // Finland
      { code: "HEL", name: "Helsinki Airport", city: "Helsinki", country: "Finland", region: "Europe", latitude: 60.3172, longitude: 24.9633 },
      { code: "TMP", name: "Tampere-Pirkkala Airport", city: "Tampere", country: "Finland", region: "Europe", latitude: 61.4141, longitude: 23.6044 },
      { code: "TKU", name: "Turku Airport", city: "Turku", country: "Finland", region: "Europe", latitude: 60.5140, longitude: 22.2626 },
      { code: "OUL", name: "Oulu Airport", city: "Oulu", country: "Finland", region: "Europe", latitude: 64.9301, longitude: 25.3546 },
      
      // Iceland
      { code: "KEF", name: "Keflavík International Airport", city: "Reykjavík", country: "Iceland", region: "Europe", latitude: 63.9850, longitude: -22.6056 },
      { code: "RKV", name: "Reykjavík Airport", city: "Reykjavík", country: "Iceland", region: "Europe", latitude: 64.1300, longitude: -21.9406 },
      
      // Baltic States
      // Estonia
      { code: "TLL", name: "Tallinn Airport", city: "Tallinn", country: "Estonia", region: "Europe", latitude: 59.4133, longitude: 24.8328 },
      // Latvia
      { code: "RIX", name: "Riga International Airport", city: "Riga", country: "Latvia", region: "Europe", latitude: 56.9236, longitude: 23.9711 },
      // Lithuania
      { code: "VNO", name: "Vilnius Airport", city: "Vilnius", country: "Lithuania", region: "Europe", latitude: 54.6340, longitude: 25.2858 },
      { code: "KUN", name: "Kaunas Airport", city: "Kaunas", country: "Lithuania", region: "Europe", latitude: 54.9639, longitude: 24.0847 },
      
      // Middle East
      { code: "DXB", name: "Dubai International Airport", city: "Dubai", country: "United Arab Emirates", region: "Middle East", latitude: 25.2532, longitude: 55.3657 },
      { code: "DOH", name: "Hamad International Airport", city: "Doha", country: "Qatar", region: "Middle East", latitude: 25.2731, longitude: 51.6081 },
      { code: "AUH", name: "Abu Dhabi International Airport", city: "Abu Dhabi", country: "United Arab Emirates", region: "Middle East", latitude: 24.4330, longitude: 54.6511 },
      { code: "IST", name: "Istanbul Airport", city: "Istanbul", country: "Turkey", region: "Middle East", latitude: 41.2753, longitude: 28.7519 }, // New Istanbul Airport
      { code: "SAW", name: "Istanbul Sabiha Gökçen International Airport", city: "Istanbul", country: "Turkey", region: "Middle East", latitude: 40.8986, longitude: 29.3092 },
      { code: "JED", name: "King Abdulaziz International Airport", city: "Jeddah", country: "Saudi Arabia", region: "Middle East", latitude: 21.6796, longitude: 39.1566 },
      { code: "RUH", name: "King Khalid International Airport", city: "Riyadh", country: "Saudi Arabia", region: "Middle East", latitude: 24.9576, longitude: 46.6988 },
      
      // Asia
      { code: "SIN", name: "Singapore Changi Airport", city: "Singapore", country: "Singapore", region: "Asia", latitude: 1.3644, longitude: 103.9915 },
      { code: "BKK", name: "Suvarnabhumi Airport", city: "Bangkok", country: "Thailand", region: "Asia", latitude: 13.6900, longitude: 100.7501 },
      { code: "DMK", name: "Don Mueang International Airport", city: "Bangkok", country: "Thailand", region: "Asia", latitude: 13.9126, longitude: 100.6068 },
      { code: "HKT", name: "Phuket International Airport", city: "Phuket", country: "Thailand", region: "Asia", latitude: 8.1132, longitude: 98.3169 },
      { code: "CNX", name: "Chiang Mai International Airport", city: "Chiang Mai", country: "Thailand", region: "Asia", latitude: 18.7668, longitude: 98.9628 },
      { code: "USM", name: "Samui International Airport", city: "Koh Samui", country: "Thailand", region: "Asia", latitude: 9.5479, longitude: 100.0623 },
      { code: "KBV", name: "Krabi International Airport", city: "Krabi", country: "Thailand", region: "Asia", latitude: 8.0958, longitude: 98.9858 },
      { code: "CEI", name: "Chiang Rai International Airport", city: "Chiang Rai", country: "Thailand", region: "Asia", latitude: 19.9525, longitude: 99.8828 },
      { code: "HKG", name: "Hong Kong International Airport", city: "Hong Kong", country: "China", region: "Asia", latitude: 22.3080, longitude: 113.9185 },
      { code: "PEK", name: "Beijing Capital International Airport", city: "Beijing", country: "China", region: "Asia", latitude: 40.0801, longitude: 116.5846 },
      // Japan
      { code: "HND", name: "Tokyo Haneda Airport", city: "Tokyo", country: "Japan", region: "Asia", latitude: 35.5494, longitude: 139.7798 },
      { code: "NRT", name: "Narita International Airport", city: "Tokyo", country: "Japan", region: "Asia", latitude: 35.7719, longitude: 140.3928 },
      { code: "KIX", name: "Kansai International Airport", city: "Osaka", country: "Japan", region: "Asia", latitude: 34.4347, longitude: 135.2440 },
      { code: "ITM", name: "Osaka International Airport", city: "Osaka", country: "Japan", region: "Asia", latitude: 34.7855, longitude: 135.4382 }, // Itami
      { code: "CTS", name: "New Chitose Airport", city: "Sapporo", country: "Japan", region: "Asia", latitude: 42.7752, longitude: 141.6923 },
      { code: "FUK", name: "Fukuoka Airport", city: "Fukuoka", country: "Japan", region: "Asia", latitude: 33.5859, longitude: 130.4505 },
      { code: "NGO", name: "Chubu Centrair International Airport", city: "Nagoya", country: "Japan", region: "Asia", latitude: 34.8584, longitude: 136.8054 },
      { code: "OKA", name: "Naha Airport", city: "Okinawa", country: "Japan", region: "Asia", latitude: 26.1958, longitude: 127.6459 },
      { code: "KOJ", name: "Kagoshima Airport", city: "Kagoshima", country: "Japan", region: "Asia", latitude: 31.8034, longitude: 130.7192 },
      { code: "HIJ", name: "Hiroshima Airport", city: "Hiroshima", country: "Japan", region: "Asia", latitude: 34.4361, longitude: 132.9192 },
      { code: "SDJ", name: "Sendai Airport", city: "Sendai", country: "Japan", region: "Asia", latitude: 38.1397, longitude: 140.9169 },
      { code: "KMJ", name: "Kumamoto Airport", city: "Kumamoto", country: "Japan", region: "Asia", latitude: 32.8381, longitude: 130.8550 },
      { code: "ICN", name: "Incheon International Airport", city: "Seoul", country: "South Korea", region: "Asia", latitude: 37.4602, longitude: 126.4407 },
      // Indonesia
      { code: "CGK", name: "Soekarno-Hatta International Airport", city: "Jakarta", country: "Indonesia", region: "Asia", latitude: -6.1256, longitude: 106.6559 },
      { code: "HLP", name: "Halim Perdanakusuma International Airport", city: "Jakarta", country: "Indonesia", region: "Asia", latitude: -6.2698, longitude: 106.8900 },
      { code: "DPS", name: "Ngurah Rai International Airport", city: "Denpasar", country: "Indonesia", region: "Asia", latitude: -8.7482, longitude: 115.1672 },
      { code: "LOP", name: "Lombok International Airport", city: "Lombok", country: "Indonesia", region: "Asia", latitude: -8.7572, longitude: 116.2767 },
      { code: "SUB", name: "Juanda International Airport", city: "Surabaya", country: "Indonesia", region: "Asia", latitude: -7.3797, longitude: 112.7868 },
      { code: "UPG", name: "Sultan Hasanuddin International Airport", city: "Makassar", country: "Indonesia", region: "Asia", latitude: -5.0617, longitude: 119.5542 },
      { code: "BDO", name: "Husein Sastranegara International Airport", city: "Bandung", country: "Indonesia", region: "Asia", latitude: -6.9007, longitude: 107.5760 },
      { code: "JOG", name: "Adisutjipto International Airport", city: "Yogyakarta", country: "Indonesia", region: "Asia", latitude: -7.7882, longitude: 110.4319 }, // Old airport, YIA is new
      { code: "SOC", name: "Adisumarmo International Airport", city: "Solo", country: "Indonesia", region: "Asia", latitude: -7.5161, longitude: 110.7570 },
      { code: "PDG", name: "Minangkabau International Airport", city: "Padang", country: "Indonesia", region: "Asia", latitude: -0.7871, longitude: 100.2810 },
      { code: "BTJ", name: "Sultan Iskandar Muda International Airport", city: "Banda Aceh", country: "Indonesia", region: "Asia", latitude: 5.5232, longitude: 95.4200 },
      { code: "PLM", name: "Sultan Mahmud Badaruddin II Airport", city: "Palembang", country: "Indonesia", region: "Asia", latitude: -2.8972, longitude: 104.7006 },
      { code: "KUL", name: "Kuala Lumpur International Airport", city: "Kuala Lumpur", country: "Malaysia", region: "Asia", latitude: 2.7456, longitude: 101.7099 },
      { code: "MNL", name: "Ninoy Aquino International Airport", city: "Manila", country: "Philippines", region: "Asia", latitude: 14.5086, longitude: 121.0194 },
      { code: "CEB", name: "Mactan-Cebu International Airport", city: "Cebu", country: "Philippines", region: "Asia", latitude: 10.3075, longitude: 123.9794 },
      { code: "BWN", name: "Brunei International Airport", city: "Bandar Seri Begawan", country: "Brunei", region: "Asia", latitude: 4.9442, longitude: 114.9283 },
      // Vietnam
      { code: "SGN", name: "Tan Son Nhat International Airport", city: "Ho Chi Minh City", country: "Vietnam", region: "Asia", latitude: 10.8189, longitude: 106.6519 },
      { code: "HAN", name: "Noi Bai International Airport", city: "Hanoi", country: "Vietnam", region: "Asia", latitude: 21.2212, longitude: 105.8072 },
      { code: "DAD", name: "Da Nang International Airport", city: "Da Nang", country: "Vietnam", region: "Asia", latitude: 16.0439, longitude: 108.1994 },
      { code: "CXR", name: "Cam Ranh International Airport", city: "Nha Trang", country: "Vietnam", region: "Asia", latitude: 11.9981, longitude: 109.2195 },
      { code: "PQC", name: "Phu Quoc International Airport", city: "Phu Quoc", country: "Vietnam", region: "Asia", latitude: 10.1698, longitude: 103.9935 },
      
      // Cambodia
      { code: "PNH", name: "Phnom Penh International Airport", city: "Phnom Penh", country: "Cambodia", region: "Asia", latitude: 11.5465, longitude: 104.8441 },
      { code: "REP", name: "Siem Reap International Airport", city: "Siem Reap", country: "Cambodia", region: "Asia", latitude: 13.4107, longitude: 103.8128 }, // Old airport, SAI is new
      { code: "KOS", name: "Sihanoukville International Airport", city: "Sihanoukville", country: "Cambodia", region: "Asia", latitude: 10.5790, longitude: 103.6345 },
      
      // Myanmar
      { code: "RGN", name: "Yangon International Airport", city: "Yangon", country: "Myanmar", region: "Asia", latitude: 16.9073, longitude: 96.1332 },
      { code: "MDL", name: "Mandalay International Airport", city: "Mandalay", country: "Myanmar", region: "Asia", latitude: 21.7022, longitude: 95.9780 },
      { code: "NYU", name: "Bagan Nyaung U Airport", city: "Bagan", country: "Myanmar", region: "Asia", latitude: 21.1786, longitude: 94.9297 },
      
      // Oceania
      // Australia
      { code: "SYD", name: "Sydney Airport", city: "Sydney", country: "Australia", region: "Oceania", latitude: -33.9399, longitude: 151.1753 },
      { code: "MEL", name: "Melbourne Airport", city: "Melbourne", country: "Australia", region: "Oceania", latitude: -37.6690, longitude: 144.8410 },
      { code: "BNE", name: "Brisbane Airport", city: "Brisbane", country: "Australia", region: "Oceania", latitude: -27.3842, longitude: 153.1175 },
      { code: "PER", name: "Perth Airport", city: "Perth", country: "Australia", region: "Oceania", latitude: -31.9403, longitude: 115.9669 },
      { code: "ADL", name: "Adelaide Airport", city: "Adelaide", country: "Australia", region: "Oceania", latitude: -34.9450, longitude: 138.5306 },
      { code: "CNS", name: "Cairns Airport", city: "Cairns", country: "Australia", region: "Oceania", latitude: -16.8858, longitude: 145.7551 },
      
      // New Zealand
      { code: "AKL", name: "Auckland Airport", city: "Auckland", country: "New Zealand", region: "Oceania", latitude: -37.0082, longitude: 174.7917 },
      { code: "CHC", name: "Christchurch Airport", city: "Christchurch", country: "New Zealand", region: "Oceania", latitude: -43.4894, longitude: 172.5322 },
      { code: "WLG", name: "Wellington Airport", city: "Wellington", country: "New Zealand", region: "Oceania", latitude: -41.3272, longitude: 174.8053 },
      { code: "ZQN", name: "Queenstown Airport", city: "Queenstown", country: "New Zealand", region: "Oceania", latitude: -45.0211, longitude: 168.7392 },
      
      // Melanesia
      // Fiji
      { code: "NAN", name: "Nadi International Airport", city: "Nadi", country: "Fiji", region: "Oceania", latitude: -17.7550, longitude: 177.4436 },
      { code: "SUV", name: "Nausori International Airport", city: "Suva", country: "Fiji", region: "Oceania", latitude: -18.0433, longitude: 178.5592 },
      // Papua New Guinea
      { code: "POM", name: "Port Moresby Jacksons International Airport", city: "Port Moresby", country: "Papua New Guinea", region: "Oceania", latitude: -9.4433, longitude: 147.2200 },
      // Solomon Islands
      { code: "HIR", name: "Honiara International Airport", city: "Honiara", country: "Solomon Islands", region: "Oceania", latitude: -9.4281, longitude: 160.0547 },
      // Vanuatu
      { code: "VLI", name: "Bauerfield International Airport", city: "Port Vila", country: "Vanuatu", region: "Oceania", latitude: -17.6991, longitude: 168.3197 },
      // New Caledonia
      { code: "NOU", name: "La Tontouta International Airport", city: "Nouméa", country: "New Caledonia", region: "Oceania", latitude: -22.0146, longitude: 166.2127 },
      
      // Micronesia
      // Guam
      { code: "GUM", name: "Antonio B. Won Pat International Airport", city: "Hagåtña", country: "Guam", region: "Oceania", latitude: 13.4834, longitude: 144.7960 },
      // Palau
      { code: "ROR", name: "Roman Tmetuchl International Airport", city: "Koror", country: "Palau", region: "Oceania", latitude: 7.3673, longitude: 134.5442 },
      // Federated States of Micronesia
      { code: "PNI", name: "Pohnpei International Airport", city: "Pohnpei", country: "Federated States of Micronesia", region: "Oceania", latitude: 6.9837, longitude: 158.2089 },
      
      // Polynesia
      // French Polynesia
      { code: "PPT", name: "Faa'a International Airport", city: "Papeete", country: "French Polynesia", region: "Oceania", latitude: -17.5560, longitude: -149.6115 },
      { code: "BOB", name: "Bora Bora Airport", city: "Bora Bora", country: "French Polynesia", region: "Oceania", latitude: -16.4444, longitude: -151.7514 },
      // Samoa
      { code: "APW", name: "Faleolo International Airport", city: "Apia", country: "Samoa", region: "Oceania", latitude: -13.8299, longitude: -171.9992 },
      // Tonga
      { code: "TBU", name: "Fua'amotu International Airport", city: "Nukuʻalofa", country: "Tonga", region: "Oceania", latitude: -21.2412, longitude: -175.1496 },
      // Cook Islands
      { code: "RAR", name: "Rarotonga International Airport", city: "Rarotonga", country: "Cook Islands", region: "Oceania", latitude: -21.2027, longitude: -159.8056 },
      
      // Central America
      { code: "SJO", name: "Juan Santamaría International Airport", city: "San José", country: "Costa Rica", region: "Central America", latitude: 9.9939, longitude: -84.2088 },
      { code: "LIR", name: "Daniel Oduber Quirós International Airport", city: "Liberia", country: "Costa Rica", region: "Central America", latitude: 10.5933, longitude: -85.5442 },
      { code: "PTY", name: "Tocumen International Airport", city: "Panama City", country: "Panama", region: "Central America", latitude: 9.0714, longitude: -79.3836 },
      { code: "SAL", name: "El Salvador International Airport", city: "San Salvador", country: "El Salvador", region: "Central America", latitude: 13.4409, longitude: -89.0558 },
      { code: "GUA", name: "La Aurora International Airport", city: "Guatemala City", country: "Guatemala", region: "Central America", latitude: 14.5833, longitude: -90.5275 },
      { code: "BZE", name: "Philip S. W. Goldson International Airport", city: "Belize City", country: "Belize", region: "Central America", latitude: 17.5391, longitude: -88.3082 },
      { code: "MGA", name: "Augusto C. Sandino International Airport", city: "Managua", country: "Nicaragua", region: "Central America", latitude: 12.1414, longitude: -86.1681 },
      { code: "SAP", name: "Ramón Villeda Morales International Airport", city: "San Pedro Sula", country: "Honduras", region: "Central America", latitude: 15.4527, longitude: -87.9234 },
      { code: "TGU", name: "Toncontín International Airport", city: "Tegucigalpa", country: "Honduras", region: "Central America", latitude: 14.0609, longitude: -87.2173 },
      
      // South America
      // Brazil
      { code: "GRU", name: "São Paulo–Guarulhos International Airport", city: "São Paulo", country: "Brazil", region: "South America", latitude: -23.4356, longitude: -46.4731 },
      { code: "GIG", name: "Rio de Janeiro–Galeão International Airport", city: "Rio de Janeiro", country: "Brazil", region: "South America", latitude: -22.8099, longitude: -43.2505 },
      { code: "BSB", name: "Brasília International Airport", city: "Brasília", country: "Brazil", region: "South America", latitude: -15.8711, longitude: -47.9172 },
      { code: "CNF", name: "Belo Horizonte International Airport", city: "Belo Horizonte", country: "Brazil", region: "South America", latitude: -19.6244, longitude: -43.9719 }, // Tancredo Neves/Confins
      { code: "SSA", name: "Salvador International Airport", city: "Salvador", country: "Brazil", region: "South America", latitude: -12.9086, longitude: -38.3310 },
      // Argentina
      { code: "EZE", name: "Ministro Pistarini International Airport", city: "Buenos Aires", country: "Argentina", region: "South America", latitude: -34.8222, longitude: -58.5358 },
      { code: "AEP", name: "Jorge Newbery Airfield", city: "Buenos Aires", country: "Argentina", region: "South America", latitude: -34.5592, longitude: -58.4156 },
      { code: "COR", name: "Ingeniero Aeronáutico Ambrosio L.V. Taravella International Airport", city: "Córdoba", country: "Argentina", region: "South America", latitude: -31.3236, longitude: -64.2080 },
      { code: "MDZ", name: "Governor Francisco Gabrielli International Airport", city: "Mendoza", country: "Argentina", region: "South America", latitude: -32.8317, longitude: -68.7929 },
      // Colombia
      { code: "BOG", name: "El Dorado International Airport", city: "Bogotá", country: "Colombia", region: "South America", latitude: 4.7016, longitude: -74.1469 },
      { code: "MDE", name: "José María Córdova International Airport", city: "Medellín", country: "Colombia", region: "South America", latitude: 6.1645, longitude: -75.4231 },
      { code: "CTG", name: "Rafael Núñez International Airport", city: "Cartagena", country: "Colombia", region: "South America", latitude: 10.4424, longitude: -75.5129 },
      // Peru
      { code: "LIM", name: "Jorge Chávez International Airport", city: "Lima", country: "Peru", region: "South America", latitude: -12.0219, longitude: -77.1143 },
      { code: "CUZ", name: "Alejandro Velasco Astete International Airport", city: "Cusco", country: "Peru", region: "South America", latitude: -13.5357, longitude: -71.9388 },
      // Chile
      { code: "SCL", name: "Arturo Merino Benítez International Airport", city: "Santiago", country: "Chile", region: "South America", latitude: -33.3930, longitude: -70.7858 },
      // Ecuador
      { code: "UIO", name: "Mariscal Sucre International Airport", city: "Quito", country: "Ecuador", region: "South America", latitude: -0.1408, longitude: -78.3575 },
      { code: "GYE", name: "José Joaquín de Olmedo International Airport", city: "Guayaquil", country: "Ecuador", region: "South America", latitude: -2.1575, longitude: -79.8836 },
      // Venezuela
      { code: "CCS", name: "Simón Bolívar International Airport", city: "Caracas", country: "Venezuela", region: "South America", latitude: 10.6031, longitude: -66.9906 },
      // Bolivia
      { code: "LPB", name: "El Alto International Airport", city: "La Paz", country: "Bolivia", region: "South America", latitude: -16.5133, longitude: -68.1923 },
      { code: "VVI", name: "Viru Viru International Airport", city: "Santa Cruz", country: "Bolivia", region: "South America", latitude: -17.6448, longitude: -63.1354 },
      // Paraguay
      { code: "ASU", name: "Silvio Pettirossi International Airport", city: "Asunción", country: "Paraguay", region: "South America", latitude: -25.2397, longitude: -57.5192 },
      // Uruguay
      { code: "MVD", name: "Carrasco International Airport", city: "Montevideo", country: "Uruguay", region: "South America", latitude: -34.8384, longitude: -56.0304 },
    ];

    airports.forEach(airport => this.createAirport(airport));

    // Add airlines
    const airlines: InsertAirline[] = [
      // North America
      // USA & Canada
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
      
      // Mexico
      { code: "AM", name: "Aeroméxico", logo: "aeromexico", region: "North America" },
      { code: "Y4", name: "Volaris", logo: "volaris", region: "North America" },
      { code: "VB", name: "VivaAerobus", logo: "vivaaerobus", region: "North America" },
      { code: "4O", name: "Interjet", logo: "interjet", region: "North America" },
      { code: "QA", name: "Calafia Airlines", logo: "calafia", region: "North America" },
      { code: "YQ", name: "TAR Aerolíneas", logo: "tar", region: "North America" },
      
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
      { code: "CM", name: "Copa Airlines", logo: "copa-airlines", region: "Central America" }, // Kept as CM for Central America
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
      { code: "LP", name: "LATAM Peru", logo: "latam-peru", region: "South America" }, // Example: LP could be LATAM Peru
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
      { code: "CM-SA", name: "Copa Airlines (South America)", logo: "copa-airlines", region: "South America" }, // Differentiated Copa for South America
    ];

    airlines.forEach(airline => this.createAirline(airline));

    // Add some flights
    const flights: Array<InsertFlight & { departureAirportCode: string; arrivalAirportCode: string }> = [
      { 
        flightNumber: "AA-2347", 
        airlineId: 1, 
        departureAirportCode: "JFK", 
        departureAirportId: this.airports.get(1)!.id, // Assuming JFK is ID 1
        arrivalAirportCode: "CDG", 
        arrivalAirportId: this.airports.get(19)!.id, // Assuming CDG is ID 19 (LHR, CDG, FRA, AMS...)
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
        departureAirportId: this.airports.get(1)!.id,
        arrivalAirportCode: "CDG", 
        arrivalAirportId: this.airports.get(19)!.id,
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
        departureAirportId: this.airports.get(1)!.id,
        arrivalAirportCode: "CDG", 
        arrivalAirportId: this.airports.get(19)!.id,
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
        departureAirportId: this.airports.get(2)!.id, // Assuming LAX is ID 2
        arrivalAirportCode: "JFK", 
        arrivalAirportId: this.airports.get(1)!.id,
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
        departureAirportId: this.airports.get(1)!.id,
        arrivalAirportCode: "DXB", 
        arrivalAirportId: this.airports.get(50)!.id, // Example ID for DXB, adjust based on actual order
        departureTime: "22:15", 
        arrivalTime: "19:10", 
        duration: "12h 55m", 
        price: "$899", 
        class: "Economy" 
      },
    ];

    flights.forEach(flightData => {
      // Find airport IDs dynamically based on codes to be more robust to ordering changes
      const depAirport = Array.from(this.airports.values()).find(a => a.code === flightData.departureAirportCode);
      const arrAirport = Array.from(this.airports.values()).find(a => a.code === flightData.arrivalAirportCode);
      const airline = Array.from(this.airlines.values())[flightData.airlineId-1]; // Assuming airlineId is 1-based index for sample

      if (depAirport && arrAirport && airline) {
        const { departureAirportCode, arrivalAirportCode, ...flightInsert } = flightData;
        this.createFlight({
          ...flightInsert,
          departureAirportId: depAirport.id,
          arrivalAirportId: arrAirport.id,
          airlineId: airline.id, // Use actual airline ID
        });
      } else {
        console.warn(`Could not create sample flight due to missing airport/airline: 
          Dep: ${flightData.departureAirportCode}, Arr: ${flightData.arrivalAirportCode}, AirlineID: ${flightData.airlineId}`);
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
          country: departureAirport.country,
          latitude: departureAirport.latitude,
          longitude: departureAirport.longitude
        },
        time: flight.departureTime
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
            country: departureAirport.country,
            latitude: departureAirport.latitude,
            longitude: departureAirport.longitude
          },
          time: flight.departureTime
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
