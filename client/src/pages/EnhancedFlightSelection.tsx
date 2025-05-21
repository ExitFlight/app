// /home/jordan/Desktop/FlightBack/client/src/pages/EnhancedFlightSelection.tsx
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRight, Plane, Clock, CalendarIcon, Search, AlertTriangle, RefreshCcw, XIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDistance } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import ProgressStepper from "@/components/ProgressStepper";
import { useFlightContext } from "@/lib/context/FlightContext";
import { calculateEnhancedFlightDetails } from "@/lib/enhancedFlightCalculator";
// Import from airlineUtil.ts
import { allAirlines, airlinesGroupedByRegion, type Airline as UtilAirline } from "@/lib/airlineUtil"; // Import Airline type
import { directFlightExists } from "@/lib/flightData";

// Major international airports by region (ensure all have lat/long)
const majorAirports = {
  "North America": [
    { code: "JFK", name: "New York JFK", latitude: 40.6413, longitude: -73.7781 },
    { code: "LAX", name: "Los Angeles", latitude: 33.9416, longitude: -118.4085 },
    { code: "SFO", name: "San Francisco", latitude: 37.6213, longitude: -122.3790 },
    { code: "SEA", name: "Seattle-Tacoma", latitude: 47.4480, longitude: -122.3088 },
    { code: "ORD", name: "Chicago O'Hare", latitude: 41.9742, longitude: -87.9073 },
    { code: "DFW", name: "Dallas/Fort Worth", latitude: 32.8998, longitude: -97.0403 },
    { code: "MIA", name: "Miami", latitude: 25.7959, longitude: -80.2871 },
    { code: "ATL", name: "Atlanta", latitude: 33.6407, longitude: -84.4277 },
    { code: "DEN", name: "Denver", latitude: 39.8561, longitude: -104.6737 },
    { code: "LAS", name: "Las Vegas", latitude: 36.0840, longitude: -115.1537 },
    { code: "HNL", name: "Honolulu, Oahu", latitude: 21.3187, longitude: -157.9224 },
    { code: "KOA", name: "Kailua-Kona, Big Island", latitude: 19.7388, longitude: -156.0456 },
    { code: "OGG", name: "Kahului, Maui", latitude: 20.8987, longitude: -156.4305 },
    { code: "LIH", name: "Lihue, Kauai", latitude: 21.9760, longitude: -159.3388 },
    { code: "YYZ", name: "Toronto Pearson", latitude: 43.6777, longitude: -79.6248 },
    { code: "MEX", name: "Mexico City", latitude: 19.4363, longitude: -99.0721 }
  ],
  "Europe": [
    { code: "LHR", name: "London Heathrow", latitude: 51.4700, longitude: -0.4543 },
    { code: "LGW", name: "London Gatwick", latitude: 51.1537, longitude: -0.1821 },
    { code: "MAN", name: "Manchester", latitude: 53.3537, longitude: -2.2749 },
    { code: "DUB", name: "Dublin", latitude: 53.4264, longitude: -6.2499 },
    { code: "CDG", name: "Paris Charles de Gaulle", latitude: 49.0097, longitude: 2.5479 },
    { code: "ORY", name: "Paris Orly", latitude: 48.7233, longitude: 2.3794 },
    { code: "FRA", name: "Frankfurt", latitude: 50.0379, longitude: 8.5622 },
    { code: "MUC", name: "Munich", latitude: 48.3537, longitude: 11.7861 },
    { code: "AMS", name: "Amsterdam Schiphol", latitude: 52.3105, longitude: 4.7683 },
    { code: "BRU", name: "Brussels", latitude: 50.9014, longitude: 4.4844 },
    { code: "MAD", name: "Madrid Barajas", latitude: 40.4983, longitude: -3.5676 },
    { code: "BCN", name: "Barcelona El Prat", latitude: 41.2974, longitude: 2.0833 },
    { code: "LIS", name: "Lisbon", latitude: 38.7742, longitude: -9.1342 },
    { code: "FCO", name: "Rome Fiumicino", latitude: 41.8003, longitude: 12.2389 },
    { code: "MXP", name: "Milan Malpensa", latitude: 45.6306, longitude: 8.7281 },
    { code: "ATH", name: "Athens", latitude: 37.9364, longitude: 23.9444 },
    { code: "IST", name: "Istanbul", latitude: 41.2753, longitude: 28.7519 },
    { code: "CPH", name: "Copenhagen", latitude: 55.6180, longitude: 12.6508 },
    { code: "ARN", name: "Stockholm Arlanda", latitude: 59.6498, longitude: 17.9238 },
    { code: "OSL", name: "Oslo", latitude: 60.1976, longitude: 11.1004 },
    { code: "HEL", name: "Helsinki", latitude: 60.3172, longitude: 24.9633 },
    { code: "VIE", name: "Vienna", latitude: 48.1103, longitude: 16.5697 },
    { code: "ZRH", name: "Zurich", latitude: 47.4647, longitude: 8.5492 },
    { code: "WAW", name: "Warsaw", latitude: 52.1657, longitude: 20.9671 },
    { code: "BUD", name: "Budapest", latitude: 47.4369, longitude: 19.2617 },
    { code: "PRG", name: "Prague", latitude: 50.1008, longitude: 14.2600 },
    { code: "SVO", name: "Moscow Sheremetyevo", latitude: 55.9726, longitude: 37.4146 },
    { code: "DME", name: "Moscow Domodedovo", latitude: 55.4088, longitude: 37.9063 },
    { code: "LED", name: "St. Petersburg", latitude: 59.8003, longitude: 30.2625 },
    { code: "KZN", name: "Kazan", latitude: 55.6062, longitude: 49.2787 },
    { code: "AER", name: "Sochi", latitude: 43.4499, longitude: 39.9572 }
  ],
   "Asia": [
    { code: "HND", name: "Tokyo Haneda", latitude: 35.5494, longitude: 139.7798 },
    { code: "NRT", name: "Tokyo Narita", latitude: 35.7719, longitude: 140.3928 },
    { code: "KIX", name: "Osaka Kansai", latitude: 34.4347, longitude: 135.2440 },
    { code: "PEK", name: "Beijing Capital", latitude: 40.0801, longitude: 116.5846 },
    { code: "PKX", name: "Beijing Daxing", latitude: 39.5093, longitude: 116.4103 },
    { code: "PVG", name: "Shanghai Pudong", latitude: 31.1444, longitude: 121.8053 },
    { code: "HKG", name: "Hong Kong", latitude: 22.3080, longitude: 113.9185 },
    { code: "TPE", name: "Taipei Taoyuan", latitude: 25.0797, longitude: 121.2342 },
    { code: "TSA", name: "Taipei Songshan", latitude: 25.0691, longitude: 121.5526 },
    { code: "KHH", name: "Kaohsiung", latitude: 22.5771, longitude: 120.3499 },
    { code: "ICN", name: "Seoul Incheon", latitude: 37.4602, longitude: 126.4407 },
    { code: "GMP", name: "Seoul Gimpo", latitude: 37.5580, longitude: 126.7906 },
    { code: "SIN", name: "Singapore Changi", latitude: 1.3644, longitude: 103.9915 },
    { code: "BKK", name: "Bangkok Suvarnabhumi", latitude: 13.6900, longitude: 100.7501 },
    { code: "DMK", name: "Bangkok Don Mueang", latitude: 13.9126, longitude: 100.6068 },
    { code: "HKT", name: "Phuket", latitude: 8.1132, longitude: 98.3169 },
    { code: "CNX", name: "Chiang Mai", latitude: 18.7717, longitude: 98.9627 },
    { code: "USM", name: "Koh Samui", latitude: 9.5479, longitude: 100.0627 },
    { code: "KBV", name: "Krabi", latitude: 8.0950, longitude: 98.9850 },
    { code: "CEI", name: "Chiang Rai", latitude: 19.9525, longitude: 99.8828 },
    { code: "SGN", name: "Ho Chi Minh City", latitude: 10.8189, longitude: 106.6519 },
    { code: "HAN", name: "Hanoi", latitude: 21.2212, longitude: 105.7472 },
    { code: "DAD", name: "Da Nang", latitude: 16.0439, longitude: 108.1992 },
    { code: "PQC", name: "Phu Quoc", latitude: 10.1698, longitude: 103.9934 },
    { code: "CXR", name: "Nha Trang", latitude: 11.9981, longitude: 109.2193 },
    { code: "REP", name: "Siem Reap", latitude: 13.4108, longitude: 103.8128 },
    { code: "PNH", name: "Phnom Penh", latitude: 11.5465, longitude: 104.8441 },
    { code: "KOS", name: "Sihanoukville", latitude: 10.5798, longitude: 103.6347 },
    { code: "VTE", name: "Vientiane", latitude: 17.9884, longitude: 102.5633 },
    { code: "LPQ", name: "Luang Prabang", latitude: 19.8978, longitude: 102.1614 },
    { code: "RGN", name: "Yangon", latitude: 16.9073, longitude: 96.1332 },
    { code: "MDL", name: "Mandalay", latitude: 21.7022, longitude: 95.9780 },
    { code: "DPS", name: "Denpasar, Bali", latitude: -8.7485, longitude: 115.1671 },
    { code: "CGK", name: "Jakarta", latitude: -6.1256, longitude: 106.6559 },
    { code: "SUB", name: "Surabaya", latitude: -7.3797, longitude: 112.7868 },
    { code: "UPG", name: "Makassar", latitude: -5.0617, longitude: 119.5542 },
    { code: "DJJ", name: "Jayapura", latitude: -2.5769, longitude: 140.5169 },
    { code: "KUL", name: "Kuala Lumpur", latitude: 2.7456, longitude: 101.7099 },
    { code: "PEN", name: "Penang", latitude: 5.2971, longitude: 100.2767 },
    { code: "BKI", name: "Kota Kinabalu", latitude: 5.9351, longitude: 116.0500 },
    { code: "MNL", name: "Manila", latitude: 14.5086, longitude: 121.0194 },
    { code: "CEB", name: "Cebu", latitude: 10.3075, longitude: 123.9789 },
    { code: "DEL", name: "Delhi", latitude: 28.5562, longitude: 77.1000 },
    { code: "BOM", name: "Mumbai", latitude: 19.0896, longitude: 72.8656 },
    { code: "MAA", name: "Chennai", latitude: 12.9901, longitude: 80.1696 },
    { code: "MLE", name: "Malé", latitude: 4.2010, longitude: 73.5290 },
    { code: "GAN", name: "Gan", latitude: -0.6936, longitude: 73.1556 }
  ],
  "Oceania": [
    { code: "SYD", name: "Sydney", latitude: -33.9399, longitude: 151.1753 },
    { code: "MEL", name: "Melbourne", latitude: -37.6690, longitude: 144.8410 },
    { code: "BNE", name: "Brisbane", latitude: -27.3842, longitude: 153.1175 },
    { code: "PER", name: "Perth", latitude: -31.9403, longitude: 115.9669 },
    { code: "AKL", name: "Auckland", latitude: -37.0082, longitude: 174.7917 },
    { code: "CHC", name: "Christchurch", latitude: -43.4894, longitude: 172.5322 },
    { code: "NAN", name: "Fiji Nadi", latitude: -17.7550, longitude: 177.4436 },
    { code: "POM", name: "Port Moresby", latitude: -9.4433, longitude: 147.2100 }
  ],
  "Middle East": [
    { code: "DXB", name: "Dubai", latitude: 25.2532, longitude: 55.3657 },
    { code: "DOH", name: "Doha", latitude: 25.2732, longitude: 51.6139 },
    { code: "AUH", name: "Abu Dhabi", latitude: 24.4330, longitude: 54.6511 },
    { code: "RUH", name: "Riyadh", latitude: 24.9576, longitude: 46.6988 }
  ],
  "Central America": [
    { code: "PTY", name: "Panama City Tocumen", latitude: 9.0713, longitude: -79.3835 },
    { code: "PAC", name: "Panama City Albrook", latitude: 8.9730, longitude: -79.5555 },
    { code: "SJO", name: "San José, Costa Rica", latitude: 9.9939, longitude: -84.2088 },
    { code: "LIR", name: "Liberia, Costa Rica", latitude: 10.5931, longitude: -85.5442 },
    { code: "SAL", name: "San Salvador, El Salvador", latitude: 13.4409, longitude: -89.0558 },
    { code: "GUA", name: "Guatemala City", latitude: 14.5833, longitude: -90.5278 },
    { code: "TGU", name: "Tegucigalpa, Honduras", latitude: 14.0608, longitude: -87.2178 },
    { code: "SAP", name: "San Pedro Sula, Honduras", latitude: 15.4527, longitude: -87.9236 },
    { code: "RTB", name: "Roatán, Honduras", latitude: 16.3171, longitude: -86.5229 },
    { code: "MGA", name: "Managua, Nicaragua", latitude: 12.1413, longitude: -86.1681 },
    { code: "BZE", name: "Belize City", latitude: 17.5391, longitude: -88.3082 },
    { code: "SDQ", name: "Santo Domingo, Dominican Republic", latitude: 18.4296, longitude: -69.6688 },
    { code: "PUJ", name: "Punta Cana, Dominican Republic", latitude: 18.5675, longitude: -68.3634 },
    { code: "HAV", name: "Havana, Cuba", latitude: 22.9891, longitude: -82.4091 },
    { code: "VRA", name: "Varadero, Cuba", latitude: 23.0344, longitude: -81.4353 },
    { code: "GCM", name: "Grand Cayman", latitude: 19.2926, longitude: -81.3578 },
    { code: "MBJ", name: "Montego Bay, Jamaica", latitude: 18.5037, longitude: -77.9133 },
    { code: "KIN", name: "Kingston, Jamaica", latitude: 17.9357, longitude: -76.7870 },
    { code: "ANU", name: "Antigua", latitude: 17.1367, longitude: -61.7929 },
    { code: "SJU", name: "San Juan, Puerto Rico", latitude: 18.4394, longitude: -66.0018 }
  ],
  "South America": [
    { code: "GRU", name: "São Paulo Guarulhos", latitude: -23.4356, longitude: -46.4731 },
    { code: "CGH", name: "São Paulo Congonhas", latitude: -23.6261, longitude: -46.6564 },
    { code: "GIG", name: "Rio de Janeiro Galeão", latitude: -22.8100, longitude: -43.2505 },
    { code: "SDU", name: "Rio de Janeiro Santos Dumont", latitude: -22.9105, longitude: -43.1631 },
    { code: "EZE", name: "Buenos Aires Ezeiza", latitude: -34.8222, longitude: -58.5358 },
    { code: "AEP", name: "Buenos Aires Aeroparque", latitude: -34.5592, longitude: -58.4156 },
    { code: "BOG", name: "Bogotá", latitude: 4.7016, longitude: -74.1469 },
    { code: "SCL", name: "Santiago", latitude: -33.3930, longitude: -70.7858 },
    { code: "LIM", name: "Lima", latitude: -12.0219, longitude: -77.1143 },
    { code: "CCS", name: "Caracas", latitude: 10.6031, longitude: -66.9906 },
    { code: "UIO", name: "Quito", latitude: -0.1292, longitude: -78.3575 },
    { code: "GYE", name: "Guayaquil", latitude: -2.1575, longitude: -79.8836 },
    { code: "MVD", name: "Montevideo", latitude: -34.8383, longitude: -56.0308 },
    { code: "ASU", name: "Asunción", latitude: -25.2397, longitude: -57.5192 },
    { code: "VVI", name: "Santa Cruz", latitude: -17.6448, longitude: -63.1354 },
    { code: "LPB", name: "La Paz", latitude: -16.5134, longitude: -68.1724 },
    { code: "CUZ", name: "Cusco", latitude: -13.5357, longitude: -71.9388 },
    { code: "CTG", name: "Cartagena", latitude: 10.4424, longitude: -75.5129 },
    { code: "CNF", name: "Belo Horizonte", latitude: -19.6244, longitude: -43.9719 },
    { code: "FLN", name: "Florianópolis", latitude: -27.6706, longitude: -48.5470 }
  ],
  "Africa": [
    { code: "JNB", name: "Johannesburg O.R. Tambo", latitude: -26.1392, longitude: 28.2460 },
    { code: "DUR", name: "Durban King Shaka", latitude: -29.6142, longitude: 31.1194 },
    { code: "CPT", name: "Cape Town", latitude: -33.9648, longitude: 18.6017 },
    { code: "PLZ", name: "Port Elizabeth", latitude: -33.9849, longitude: 25.6173 },
    { code: "CMN", name: "Casablanca Mohammed V", latitude: 33.3675, longitude: -7.5899 },
    { code: "RAK", name: "Marrakesh Menara", latitude: 31.6069, longitude: -8.0363 },
    { code: "FEZ", name: "Fez", latitude: 33.9272, longitude: -4.9779 },
    { code: "AGA", name: "Agadir", latitude: 30.3250, longitude: -9.4130 },
    { code: "TNG", name: "Tangier Ibn Battouta", latitude: 35.7269, longitude: -5.9169 },
    { code: "CAI", name: "Cairo", latitude: 30.1219, longitude: 31.4056 },
    { code: "ALG", name: "Algiers", latitude: 36.6910, longitude: 3.2154 },
    { code: "TUN", name: "Tunis Carthage", latitude: 36.8510, longitude: 10.2272 },
    { code: "LOS", name: "Lagos", latitude: 6.5774, longitude: 3.3211 },
    { code: "ACC", name: "Accra", latitude: 5.6052, longitude: -0.1668 },
    { code: "DKR", name: "Dakar", latitude: 14.7397, longitude: -17.4901 },
    { code: "NBO", name: "Nairobi", latitude: -1.3192, longitude: 36.9278 },
    { code: "ADD", name: "Addis Ababa", latitude: 8.9779, longitude: 38.7993 },
    { code: "DAR", name: "Dar es Salaam", latitude: -6.8781, longitude: 39.2026 },
    { code: "EBB", name: "Entebbe", latitude: 0.0424, longitude: 32.4436 },
    { code: "SEZ", name: "Seychelles", latitude: -4.6744, longitude: 55.5219 },
    { code: "MRU", name: "Mauritius", latitude: -20.4302, longitude: 57.6830 }
  ]
};

// Flatten airport list for easy selection
const allAirportsFlat = Object.values(majorAirports).flat().sort((a, b) => a.code.localeCompare(b.code));

// Generate hour options
const hourOptions = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
// Generate minute options
const minuteOptions = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0'));

// Available cabin classes
const cabinClasses = [
  { value: "economy", label: "Economy" },
  { value: "premium_economy", label: "Premium Economy" },
  { value: "business", label: "Business" },
  { value: "first", label: "First Class" }
];

// Flight details interface
interface EnhancedFlightDetails {
  departureAirport: string;
  departureAirportName: string;
  arrivalAirport: string;
  arrivalAirportName: string;
  departureDate: string;
  departureTime: string; // This will be the user's input time
  arrivalDate: string;
  arrivalTime: string;
  flightNumber: string;
  airline: {
    id: number;
    code: string;
    name: string;
    logo?: string;
    region?: string;
  };
  duration: string;
  cabin: string;
  distanceKm: number;
  calculatedData: {
    timezoneDifference?: string;
    dayChange?: number;
    exitDay?: string;
    durationFormatted?: string;
    departureTimeLocal?: string; // Calculated local departure time
    arrivalTimeLocal?: string;
    departureDateLocal?: string;
    arrivalDateLocal?: string;
    durationMinutes?: number;
    departureUTC?: Date;
    arrivalUTC?: Date;
    distanceKm?: number;
  };
}

const EnhancedFlightSelection = () => {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const { flightDetails, setFlightDetails, setSelectedFlight } = useFlightContext();

  const loadCachedValue = (key: string, defaultValue: string): string => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(`flightCache_${key}`) || defaultValue;
    }
    return defaultValue;
  };

  const saveToCache = (key: string, value: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`flightCache_${key}`, value);
    }
  };

  const [departureRegion, setDepartureRegion] = useState<string>(loadCachedValue("departureRegion", ""));
  const [destinationRegion, setDestinationRegion] = useState<string>(loadCachedValue("destinationRegion", ""));
  const [departureAirport, setDepartureAirport] = useState<string>(
    flightDetails?.departureAirport || loadCachedValue("departureAirport", "")
  );
  const [destinationAirport, setDestinationAirport] = useState<string>(
    flightDetails?.arrivalAirport || loadCachedValue("destinationAirport", "")
  );
  const [departureDate, setDepartureDate] = useState<Date | undefined>(
    flightDetails?.departureDate ? new Date(flightDetails.departureDate) : new Date()
  );
  const [departureHour, setDepartureHour] = useState<string>(loadCachedValue("departureHour", "09"));
  const [departureMinute, setDepartureMinute] = useState<string>(loadCachedValue("departureMinute", "00"));
  const [selectedAirline, setSelectedAirline] = useState<string>(loadCachedValue("selectedAirline", ""));
  const [selectedCabin, setSelectedCabin] = useState<string>(loadCachedValue("selectedCabin", "economy"));
  const [airlineRegionFilter, setAirlineRegionFilter] = useState<string>(loadCachedValue("airlineRegionFilter", "All Regions"));
  
  const [airlinesForDropdown, setAirlinesForDropdown] = useState<UtilAirline[]>(() => {
    return allAirlines.map(a => ({
        id: a.id,
        code: a.code,
        name: a.name,
        region: a.region,
        logo: a.logo
    }));
  });


  type AirportSearchResult = { code: string; name: string; region: string; latitude?: number; longitude?: number };
  type AirlineSearchResult = {
    id: number;
    code: string;
    name: string;
    region?: string;
    logo?: string;
  };

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchResults, setSearchResults] = useState<{ airports: AirportSearchResult[], airlines: AirlineSearchResult[] }>({
    airports: [],
    airlines: []
  });
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const allAirportsList = Object.entries(majorAirports).flatMap(([region, airports]) =>
    airports.map(airport => ({ ...airport, region }))
  ).sort((a, b) => a.code.localeCompare(b.code));

  const [flightData, setFlightData] = useState<EnhancedFlightDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [hasDirectFlight, setHasDirectFlight] = useState<boolean>(true);
  const [isDepartureCalendarOpen, setIsDepartureCalendarOpen] = useState(false);

  useEffect(() => {
    document.title = "Select Flight - FlightBack";
  }, []);

  const setCachedDepartureRegion = (value: string) => { saveToCache("departureRegion", value); setDepartureRegion(value); };
  const setCachedDestinationRegion = (value: string) => { saveToCache("destinationRegion", value); setDestinationRegion(value); };
  const setCachedDepartureAirport = (value: string) => { saveToCache("departureAirport", value); setDepartureAirport(value); };
  const setCachedDestinationAirport = (value: string) => { saveToCache("destinationAirport", value); setDestinationAirport(value); };
  const setCachedDepartureHour = (value: string) => { saveToCache("departureHour", value); setDepartureHour(value); };
  const setCachedDepartureMinute = (value: string) => { saveToCache("departureMinute", value); setDepartureMinute(value); };
  const setCachedSelectedAirline = (value: string) => { saveToCache("selectedAirline", value); setSelectedAirline(value); };
  const setCachedSelectedCabin = (value: string) => { saveToCache("selectedCabin", value); setSelectedCabin(value); };
  const setCachedAirlineRegionFilter = (value: string) => { saveToCache("airlineRegionFilter", value); setAirlineRegionFilter(value); };

  const resetAll = () => {
    ["departureRegion", "destinationRegion", "departureAirport", "destinationAirport",
      "departureHour", "departureMinute", "selectedAirline", "selectedCabin", "airlineRegionFilter"]
      .forEach(key => localStorage.removeItem(`flightCache_${key}`));
    setDepartureRegion(""); setDestinationRegion(""); setDepartureAirport(""); setDestinationAirport("");
    setDepartureHour("09"); setDepartureMinute("00"); setSelectedAirline(""); setSelectedCabin("economy");
    setAirlineRegionFilter("All Regions"); setFlightData(null); setDepartureDate(new Date()); setError("");
  };

  useEffect(() => {
    if (airlineRegionFilter === "All Regions") {
        setAirlinesForDropdown(allAirlines.sort((a,b) => a.name.localeCompare(b.name)));
    } else {
        const regionGroup = airlinesGroupedByRegion.find(group => group.regionName === airlineRegionFilter);
        setAirlinesForDropdown(
            regionGroup ? regionGroup.airlines.sort((a,b) => a.name.localeCompare(b.name)) : []
        );
    }
  }, [airlineRegionFilter]);


  useEffect(() => {
    if (departureAirport) {
      const region = Object.entries(majorAirports).find(([_, airports]) =>
        airports.some(airport => airport.code === departureAirport)
      )?.[0];
      if (region && Object.keys(majorAirports).includes(region)) { 
        setCachedAirlineRegionFilter(region);
      } else {
        setCachedAirlineRegionFilter("All Regions");
      }
    } else {
        setCachedAirlineRegionFilter("All Regions");
    }
  }, [departureAirport]);

  useEffect(() => {
    if (departureAirport && destinationAirport) {
      const directFlightAvailable = directFlightExists(departureAirport, destinationAirport);
      setHasDirectFlight(directFlightAvailable);
    } else {
      setHasDirectFlight(true);
    }
  }, [departureAirport, destinationAirport]);

  const handleSearch = (search: string) => {
    setSearchTerm(search);
    setIsSearching(true);
    if (!search || search.length < 1) {
      const popularAirports = allAirportsList
        .filter(a => ['JFK', 'LAX', 'SFO', 'LHR', 'CDG', 'SIN', 'HKG', 'DXB', 'SYD'].includes(a.code))
        .sort((a, b) => a.code.localeCompare(b.code));
      setSearchResults({ airports: popularAirports, airlines: [] });
      return;
    }
    const searchLower = search.toLowerCase().trim();
    let airportResults = allAirportsList.filter(airport =>
      airport.code.toLowerCase().includes(searchLower) || airport.name.toLowerCase().includes(searchLower)
    );
    airportResults.sort((a, b) => {
      if (a.code.toLowerCase() === searchLower) return -1; if (b.code.toLowerCase() === searchLower) return 1;
      const aCodeStarts = a.code.toLowerCase().startsWith(searchLower); const bCodeStarts = b.code.toLowerCase().startsWith(searchLower);
      if (aCodeStarts && !bCodeStarts) return -1; if (!aCodeStarts && bCodeStarts) return 1;
      const aNameStarts = a.name.toLowerCase().startsWith(searchLower); const bNameStarts = b.name.toLowerCase().startsWith(searchLower);
      if (aNameStarts && !bNameStarts) return -1; if (!aNameStarts && bNameStarts) return 1;
      return a.code.localeCompare(b.code);
    });
    airportResults = airportResults.slice(0, 15);

    const airlineResultsRaw = allAirlines.filter(airline => {
      const codeMatch = airline.code.toLowerCase().includes(searchLower);
      const nameMatch = airline.name.toLowerCase().includes(searchLower);
      const isQantasSearch = searchLower.includes("quant") && airline.code === "QF";
      return codeMatch || nameMatch || isQantasSearch;
    });

    let airlineFormattedResults: AirlineSearchResult[] = airlineResultsRaw.map(ar => ({
      id: ar.id,
      code: ar.code,
      name: ar.name,
      logo: ar.logo,
      region: ar.region
    }));

    airlineFormattedResults.sort((a, b) => {
      if (a.code.toLowerCase() === searchLower) return -1; if (b.code.toLowerCase() === searchLower) return 1;
      const aCodeStarts = a.code.toLowerCase().startsWith(searchLower); const bCodeStarts = b.code.toLowerCase().startsWith(searchLower);
      if (aCodeStarts && !bCodeStarts) return -1; if (!aCodeStarts && bCodeStarts) return 1;
      return a.name.localeCompare(b.name);
    });
    airlineFormattedResults = airlineFormattedResults.slice(0, 10);
    setSearchResults({ airports: airportResults, airlines: airlineFormattedResults });
  };

  const handleSelectAirportFromSearch = (airport: AirportSearchResult) => {
    const selectedRegion = airport.region;
    if (!departureAirport) {
      setCachedDepartureRegion(selectedRegion); setCachedDepartureAirport(airport.code); setIsSearching(false);
    } else if (!destinationAirport) {
      setCachedDestinationRegion(selectedRegion); setCachedDestinationAirport(airport.code); setIsSearching(false);
    } else { 
      setCachedDepartureRegion(selectedRegion); setCachedDepartureAirport(airport.code);
    }
    setSearchTerm("");
  };

  const handleSelectAirlineFromSearch = (airline: AirlineSearchResult) => {
    setCachedSelectedAirline(airline.code);
    if (airline.region) {
        setCachedAirlineRegionFilter(airline.region);
    }
    setSearchTerm("");
    setIsSearching(false);
  };

  const generateFlightNumber = (airlineCode: string): string => {
    const number = Math.floor(Math.random() * 9999) + 1;
    return `${airlineCode}${number.toString().padStart(3, '0')}`;
  };

  const handleGenerateFlight = async () => {
    if (!departureAirport || !destinationAirport) {
      toast({ title: "Missing information", description: "Please select both departure and destination airports", variant: "destructive" }); return;
    }
    if (departureAirport === destinationAirport) {
      toast({ title: "Invalid selection", description: "Departure and destination airports cannot be the same", variant: "destructive" }); return;
    }
    if (!selectedAirline) {
      toast({ title: "Missing information", description: "Please select an airline", variant: "destructive" }); return;
    }

    setIsLoading(true); setError(""); setFlightData(null);

    try {
      const formattedDate = departureDate ? format(departureDate, "yyyy-MM-dd") : "";
      const departureTimeInput = `${departureHour}:${departureMinute}`;

      const calculatedData = await calculateEnhancedFlightDetails(
        departureAirport, destinationAirport, formattedDate, departureTimeInput
      );

      const airlineInfo = allAirlines.find(a => a.code === selectedAirline);
      if (!airlineInfo) {
        throw new Error(`Airline information not found for code: ${selectedAirline}.`);
      }

      const departureAirportInfo = allAirportsFlat.find(a => a.code === departureAirport);
      const destinationAirportInfo = allAirportsFlat.find(a => a.code === destinationAirport);
      if (!departureAirportInfo || !destinationAirportInfo) throw new Error("Airport information not found");

      if (!calculatedData.departureDateLocal || !calculatedData.arrivalTimeLocal || !calculatedData.arrivalDateLocal || !calculatedData.departureTimeLocal || !calculatedData.durationFormatted || typeof calculatedData.distanceKm === 'undefined') {
        throw new Error("Flight calculation failed to return complete data.");
      }

      const enhancedFlightData: EnhancedFlightDetails = {
        departureAirport,
        departureAirportName: departureAirportInfo.name,
        arrivalAirport: destinationAirport,
        arrivalAirportName: destinationAirportInfo.name,
        departureDate: calculatedData.departureDateLocal,
        departureTime: departureTimeInput,
        arrivalDate: calculatedData.arrivalDateLocal,
        arrivalTime: calculatedData.arrivalTimeLocal,
        flightNumber: generateFlightNumber(selectedAirline),
        airline: {
          id: airlineInfo.id,
          code: airlineInfo.code,
          name: airlineInfo.name,
          logo: airlineInfo.logo,
          region: airlineInfo.region
        },
        duration: calculatedData.durationFormatted,
        cabin: selectedCabin,
        distanceKm: calculatedData.distanceKm,
        calculatedData
      };
      setFlightData(enhancedFlightData);
    } catch (error) {
      console.error("Error generating flight:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setError(`Failed to generate flight: ${errorMessage}`);
      toast({ title: "Error", description: `Failed to generate flight: ${errorMessage}`, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    if (!flightData) {
      toast({ title: "No flight selected", description: "Please generate a flight first", variant: "destructive" }); return;
    }
    const contextDepartureDate = departureDate ? format(departureDate, "yyyy-MM-dd") : flightData.departureDate;
    setFlightDetails({
      departureAirport: flightData.departureAirport,
      arrivalAirport: flightData.arrivalAirport,
      departureDate: contextDepartureDate,
      departureTime: flightData.departureTime,
      calculatedFlightData: flightData
    });

    const mockFlight = {
      id: 1, // This ID is a placeholder and not used for backend flight lookup anymore
      flightNumber: flightData.flightNumber,
      airline: {
        id: flightData.airline.id,
        code: flightData.airline.code,
        name: flightData.airline.name,
        logo: flightData.airline.logo || "",
        region: flightData.airline.region || ""
      },
      departure: {
        airport: {
            id: 1, // Placeholder, backend will use code
            code: flightData.departureAirport,
            name: flightData.departureAirportName,
            city: flightData.departureAirportName.split(" ")[0],
            country: getAirportRegion(flightData.departureAirport),
            latitude: allAirportsFlat.find(a => a.code === flightData.departureAirport)?.latitude,
            longitude: allAirportsFlat.find(a => a.code === flightData.departureAirport)?.longitude,
        },
        time: flightData.departureTime,
        date: flightData.departureDate
      },
      arrival: {
        airport: {
            id: 2, // Placeholder, backend will use code
            code: flightData.arrivalAirport,
            name: flightData.arrivalAirportName,
            city: flightData.arrivalAirportName.split(" ")[0],
            country: getAirportRegion(flightData.arrivalAirport),
            latitude: allAirportsFlat.find(a => a.code === flightData.arrivalAirport)?.latitude,
            longitude: allAirportsFlat.find(a => a.code === flightData.arrivalAirport)?.longitude,
        },
        time: flightData.arrivalTime,
        date: flightData.arrivalDate
      },
      duration: flightData.duration,
      // price: `$${Math.floor(Math.random() * 1000) + 200}`, // REMOVED
      class: flightData.cabin
    };
    setSelectedFlight(mockFlight);
    navigate("/passenger-details");
  };

  const getAirportRegion = (code: string): string => {
    for (const [region, airports] of Object.entries(majorAirports)) {
      if (airports.some(airport => airport.code === code)) return region;
    }
    return "Unknown";
  };

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <ProgressStepper currentStep={1} />
      <div className="max-w-4xl mx-auto">
        <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6 text-foreground">Select Your Flight</h2>
        <Card className="mb-6 md:mb-6 border-border bg-card">
          <CardContent className="p-4 md:p-6">
            <div className="relative">
              <div className="flex items-center">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={
                    !departureAirport ? "Search departure: e.g., LAX or Los Angeles" :
                    !destinationAirport ? "Search destination: e.g., JFK or New York" :
                    !selectedAirline ? "Search airline: e.g., AA or American" :
                    "Search airports or airlines..."
                  }
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  onFocus={() => setIsSearching(true)}
                  className="flex-1 pl-10 pr-10"
                />
                {searchTerm && isSearching && (
                  <Button variant="ghost" size="icon" className="absolute right-10 top-1/2 transform -translate-y-1/2 h-7 w-7" onClick={() => {setSearchTerm(""); setSearchResults({airports:[], airlines:[]});}}>
                    <XIcon className="h-4 w-4" />
                  </Button>
                )}
                {isSearching ? (
                  <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7" onClick={() => setIsSearching(false)}>
                     <XIcon className="h-4 w-4 text-muted-foreground" />
                  </Button>
                ) : (
                  <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7" onClick={() => setIsSearching(true)}>
                    <Search className="h-4 w-4 opacity-0" />
                  </Button>
                )}
              </div>
              {isSearching && (
                <div className="absolute z-10 mt-1 w-full bg-background border border-border rounded-md shadow-lg max-h-80 overflow-y-auto">
                  <Command>
                    <div className="flex justify-between items-center p-2 border-b border-border sticky top-0 bg-background z-10">
                      <span className="text-sm font-medium">
                        {!departureAirport ? "Select Departure Airport" :
                         !destinationAirport ? "Select Destination Airport" :
                         !selectedAirline ? "Select Airline" : "Search Results"}
                      </span>
                      <Button variant="ghost" size="sm" className="h-6 px-2" onClick={() => setIsSearching(false)}>Close</Button>
                    </div>
                    <CommandList>
                      {searchResults.airports.length === 0 && searchResults.airlines.length === 0 && searchTerm && (
                        <CommandEmpty>No results for "{searchTerm}"</CommandEmpty>
                      )}
                       {searchResults.airports.length === 0 && searchResults.airlines.length === 0 && !searchTerm && (
                        <CommandEmpty>Type to search airports or airlines.</CommandEmpty>
                      )}
                      {searchResults.airports.length > 0 && (
                        <CommandGroup heading="Airports">
                          {searchResults.airports.map((airport) => (
                            <CommandItem key={airport.code} onSelect={() => handleSelectAirportFromSearch(airport)} className="cursor-pointer">
                              <span className="font-medium">{airport.code}</span> - {airport.name} <span className="text-xs text-muted-foreground ml-2">({airport.region})</span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      )}
                      {searchResults.airlines.length > 0 && (
                        <CommandGroup heading="Airlines">
                          {searchResults.airlines.map((airline) => (
                            <CommandItem key={airline.id} onSelect={() => handleSelectAirlineFromSearch(airline)} className="cursor-pointer">
                              {airline.name} ({airline.code})
                              {airline.region && <span className="text-xs text-muted-foreground ml-2">({airline.region})</span>}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      )}
                    </CommandList>
                  </Command>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        <Card className="mb-6 md:mb-8 border-border bg-card">
          <CardContent className="p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-4">
                <div><label className="block text-foreground font-medium mb-2 text-sm">Departure Region</label>
                  <Select value={departureRegion} onValueChange={setCachedDepartureRegion}>
                    <SelectTrigger className="w-full bg-background"><SelectValue placeholder="Select region" /></SelectTrigger>
                    <SelectContent><SelectItem value="All Regions">All Regions</SelectItem>{Object.keys(majorAirports).map((r) => (<SelectItem key={r} value={r}>{r}</SelectItem>))}</SelectContent>
                  </Select></div>
                <div><label className="block text-foreground font-medium mb-2 text-sm">Departure Airport</label>
                  <Select value={departureAirport} onValueChange={setCachedDepartureAirport} disabled={!departureRegion && departureRegion !== "All Regions"}>
                    <SelectTrigger className="w-full bg-background"><SelectValue placeholder="Select airport" /></SelectTrigger>
                    <SelectContent>{(departureRegion === "All Regions" || !departureRegion ? allAirportsList : majorAirports[departureRegion as keyof typeof majorAirports] || []).map((a) => (<SelectItem key={a.code} value={a.code}>{a.code} - {a.name}</SelectItem>))}</SelectContent>
                  </Select></div>
                <div><label className="block text-foreground font-medium mb-2 text-sm">Departure Date</label>
                  <Popover open={isDepartureCalendarOpen} onOpenChange={setIsDepartureCalendarOpen}>
                    <PopoverTrigger asChild><Button variant="outline" className="w-full justify-start text-left font-normal bg-background"><CalendarIcon className="mr-2 h-4 w-4" />{departureDate ? format(departureDate, "PPP") : <span>Pick a date</span>}</Button></PopoverTrigger>
                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={departureDate} onSelect={(d) => { setDepartureDate(d); setIsDepartureCalendarOpen(false); }} initialFocus disabled={(d) => d < new Date(new Date().setHours(0,0,0,0))}/></PopoverContent>
                  </Popover></div>
                <div><label className="block text-foreground font-medium mb-2 text-sm">Departure Time</label>
                  <div className="flex space-x-2">
                    <div className="w-1/2"><Select value={departureHour} onValueChange={setCachedDepartureHour}><SelectTrigger className="w-full bg-background"><SelectValue placeholder="Hour" /></SelectTrigger><SelectContent>{hourOptions.map((h) => (<SelectItem key={h} value={h}>{h}</SelectItem>))}</SelectContent></Select></div>
                    <div className="w-1/2"><Select value={departureMinute} onValueChange={setCachedDepartureMinute}><SelectTrigger className="w-full bg-background"><SelectValue placeholder="Minute" /></SelectTrigger><SelectContent>{minuteOptions.map((m) => (<SelectItem key={m} value={m}>{m}</SelectItem>))}</SelectContent></Select></div>
                  </div></div>
              </div>
              <div className="space-y-4">
                <div><label className="block text-foreground font-medium mb-2 text-sm">Destination Region</label>
                  <Select value={destinationRegion} onValueChange={setCachedDestinationRegion}>
                    <SelectTrigger className="w-full bg-background"><SelectValue placeholder="Select region" /></SelectTrigger>
                    <SelectContent><SelectItem value="All Regions">All Regions</SelectItem>{Object.keys(majorAirports).map((r) => (<SelectItem key={r} value={r}>{r}</SelectItem>))}</SelectContent>
                  </Select></div>
                <div><label className="block text-foreground font-medium mb-2 text-sm">Destination Airport</label>
                  <Select value={destinationAirport} onValueChange={setCachedDestinationAirport} disabled={!destinationRegion && destinationRegion !== "All Regions"}>
                    <SelectTrigger className="w-full bg-background"><SelectValue placeholder="Select airport" /></SelectTrigger>
                    <SelectContent>{(destinationRegion === "All Regions" || !destinationRegion ? allAirportsList : majorAirports[destinationRegion as keyof typeof majorAirports] || []).map((a) => (<SelectItem key={a.code} value={a.code}>{a.code} - {a.name}</SelectItem>))}</SelectContent>
                  </Select></div>
                {departureAirport && destinationAirport && !hasDirectFlight && (<Alert variant="destructive" className="bg-destructive/10 text-destructive"><AlertTriangle className="h-4 w-4" /> <AlertTitle>No Direct Flights Known</AlertTitle><AlertDescription>No direct flights known between {departureAirport} and {destinationAirport}. A theoretical direct flight will be generated.</AlertDescription></Alert>)}
                <div className="space-y-4">
                  <div><label className="block text-foreground font-medium mb-2 text-sm">Airline Region Filter (Optional)</label>
                    <Select value={airlineRegionFilter} onValueChange={setCachedAirlineRegionFilter}>
                      <SelectTrigger className="w-full bg-background"><SelectValue placeholder="All Regions" /></SelectTrigger>
                      <SelectContent><SelectItem value="All Regions">All Regions</SelectItem>{Object.keys(majorAirports).map((r) => (<SelectItem key={r} value={r}>{r}</SelectItem>))}</SelectContent>
                    </Select>
                    {departureAirport && airlineRegionFilter !== getAirportRegion(departureAirport) && getAirportRegion(departureAirport) !== "Unknown" && (<p className="text-xs text-muted-foreground mt-1">Tip: Airlines from {getAirportRegion(departureAirport)} are common for {departureAirport}.</p>)}</div>
                  <div><label className="block text-foreground font-medium mb-2 text-sm">Airline</label>
                    <Select value={selectedAirline} onValueChange={setCachedSelectedAirline}>
                      <SelectTrigger className="w-full bg-background"><SelectValue placeholder="Select airline" /></SelectTrigger>
                      <SelectContent>{airlinesForDropdown.map((a) => (<SelectItem key={a.id} value={a.code}>{a.code} - {a.name}</SelectItem>))}</SelectContent>
                    </Select></div>
                </div>
                <div><label className="block text-foreground font-medium mb-2 text-sm">Cabin Class</label>
                  <Select value={selectedCabin} onValueChange={setCachedSelectedCabin}>
                    <SelectTrigger className="w-full bg-background"><SelectValue placeholder="Select cabin class" /></SelectTrigger>
                    <SelectContent>{cabinClasses.map((c) => (<SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>))}</SelectContent>
                  </Select></div>
              </div>
            </div>
            <div className="mt-6 flex justify-between items-center flex-wrap gap-4">
              <Button variant="outline" onClick={resetAll} className="text-muted-foreground hover:text-destructive border-muted-foreground"><RefreshCcw className="mr-2 h-4 w-4" /> Reset All</Button>
              <Button onClick={handleGenerateFlight} disabled={isLoading || !departureAirport || !destinationAirport || !selectedAirline} className="w-full md:w-auto">{isLoading ? "Generating Preview..." : "Preview Ticket"}</Button>
            </div>
            {error && (<div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-md text-sm">{error}</div>)}
          </CardContent>
        </Card>
        {flightData && (
          <Card className="mb-6 md:mb-8 border-border bg-card">
            <CardContent className="p-4 md:p-6">
              <div className="mb-4 flex justify-between items-center">
                <div className="flex items-center">
                  {flightData.airline.logo && (
                    <img src={flightData.airline.logo} alt={`${flightData.airline.name} logo`} className="w-10 h-10 rounded-full mr-3 object-contain" />
                  )}
                  {!flightData.airline.logo && (
                    <div className="w-10 h-10 flex items-center justify-center bg-primary/10 rounded-full mr-3"><Plane className="h-5 w-5 text-primary" /></div>
                  )}
                  <div><h3 className="text-lg font-bold">{flightData.airline.code} {flightData.flightNumber}</h3><p className="text-sm text-muted-foreground">{flightData.airline.name}</p></div>
                </div>
                <div className="text-right"><Badge variant="outline" className="bg-primary/10">{flightData.cabin.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</Badge></div>
              </div>
              <Separator className="my-4" />
              <div className="flex justify-between items-center mb-4">
                <div className="space-y-1 text-center"><div className="text-3xl font-bold">{flightData.departureTime}</div><div className="text-sm font-medium">{flightData.departureDate}</div><div className="text-sm">{flightData.departureAirport}</div><div className="text-xs text-muted-foreground">{flightData.departureAirportName}</div></div>
                <div className="flex flex-col items-center px-4">
                  <div className="text-xs text-muted-foreground mb-1">{flightData.duration}</div>
                  <div className="relative w-32 md:w-48"><div className="h-0.5 bg-primary w-full"></div><Plane className="absolute -top-2 right-0 h-4 w-4 text-primary rotate-90" /></div>
                  <div className="text-xs text-muted-foreground mt-1">{formatDistance(flightData.distanceKm)}</div>
                </div>
                <div className="space-y-1 text-center">
                  <div className="text-3xl font-bold">{flightData.arrivalTime}</div>
                  <div className="text-sm font-medium">{flightData.arrivalDate}
                    {flightData.calculatedData?.dayChange && flightData.calculatedData.dayChange !== 0 && (<span className="ml-1 text-xs text-primary">{flightData.calculatedData.dayChange > 0 ? `+${flightData.calculatedData.dayChange}` : flightData.calculatedData.dayChange}</span>)}
                  </div><div className="text-sm">{flightData.arrivalAirport}</div><div className="text-xs text-muted-foreground">{flightData.arrivalAirportName}</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                <div className="bg-muted/40 rounded-md px-3 py-1.5 text-xs flex items-center"><Clock className="h-3.5 w-3.5 mr-1.5" /> Flight Duration: {flightData.duration}</div>
                {flightData.calculatedData?.timezoneDifference && (<div className="bg-muted/40 rounded-md px-3 py-1.5 text-xs flex items-center"><Clock className="h-3.5 w-3.5 mr-1.5" /> Time Zone Diff: {flightData.calculatedData.timezoneDifference}</div>)}
              </div>
              <div className="mt-6 flex justify-end"><Button onClick={handleContinue}>Continue to Passenger Details <ArrowRight className="ml-2 h-4 w-4" /></Button></div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default EnhancedFlightSelection;
