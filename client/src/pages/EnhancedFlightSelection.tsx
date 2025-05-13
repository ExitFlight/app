import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
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
import { ArrowRight, Plane, Clock, CalendarIcon } from "lucide-react";
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
import ProgressStepper from "@/components/ProgressStepper";
import AirlineLogo from "@/components/AirlineLogo";
import { type Airport } from "@shared/schema";
import { useFlightContext } from "@/lib/context/FlightContext";
import { calculateEnhancedFlightDetails } from "@/lib/enhancedFlightCalculator";

// Major international airports by region
const majorAirports = {
  "North America": [
    { code: "JFK", name: "New York JFK" },
    { code: "LAX", name: "Los Angeles" },
    { code: "SFO", name: "San Francisco" },
    { code: "SEA", name: "Seattle-Tacoma" },
    { code: "ORD", name: "Chicago O'Hare" },
    { code: "DFW", name: "Dallas/Fort Worth" },
    { code: "MIA", name: "Miami" },
    { code: "ATL", name: "Atlanta" },
    { code: "DEN", name: "Denver" },
    { code: "LAS", name: "Las Vegas" },
    { code: "HNL", name: "Honolulu, Oahu" },
    { code: "KOA", name: "Kailua-Kona, Big Island" },
    { code: "OGG", name: "Kahului, Maui" },
    { code: "LIH", name: "Lihue, Kauai" },
    { code: "YYZ", name: "Toronto Pearson" },
    { code: "MEX", name: "Mexico City" }
  ],
  "Europe": [
    { code: "LHR", name: "London Heathrow" },
    { code: "CDG", name: "Paris Charles de Gaulle" },
    { code: "FRA", name: "Frankfurt" },
    { code: "AMS", name: "Amsterdam Schiphol" },
    { code: "MAD", name: "Madrid Barajas" },
    { code: "FCO", name: "Rome Fiumicino" },
    { code: "ZRH", name: "Zurich" }
  ],
  "Asia": [
    { code: "HND", name: "Tokyo Haneda" },
    { code: "NRT", name: "Tokyo Narita" },
    { code: "PEK", name: "Beijing" },
    { code: "PVG", name: "Shanghai Pudong" },
    { code: "HKG", name: "Hong Kong" },
    { code: "SIN", name: "Singapore Changi" },
    { code: "BKK", name: "Bangkok Suvarnabhumi" },
    { code: "DMK", name: "Bangkok Don Mueang" },
    { code: "HKT", name: "Phuket" },
    { code: "CNX", name: "Chiang Mai" },
    { code: "USM", name: "Koh Samui" },
    { code: "KBV", name: "Krabi" },
    { code: "CEI", name: "Chiang Rai" },
    { code: "ICN", name: "Seoul Incheon" },
    { code: "DEL", name: "Delhi" },
    { code: "BOM", name: "Mumbai" }
  ],
  "Oceania": [
    { code: "SYD", name: "Sydney" },
    { code: "MEL", name: "Melbourne" },
    { code: "BNE", name: "Brisbane" },
    { code: "PER", name: "Perth" },
    { code: "AKL", name: "Auckland" },
    { code: "CHC", name: "Christchurch" },
    { code: "NAN", name: "Fiji Nadi" },
    { code: "POM", name: "Port Moresby" }
  ],
  "Middle East": [
    { code: "DXB", name: "Dubai" },
    { code: "DOH", name: "Doha" },
    { code: "AUH", name: "Abu Dhabi" },
    { code: "RUH", name: "Riyadh" }
  ],
  "South America": [
    { code: "GRU", name: "São Paulo Guarulhos" },
    { code: "CGH", name: "São Paulo Congonhas" },
    { code: "GIG", name: "Rio de Janeiro Galeão" },
    { code: "SDU", name: "Rio de Janeiro Santos Dumont" },
    { code: "EZE", name: "Buenos Aires Ezeiza" },
    { code: "AEP", name: "Buenos Aires Aeroparque" },
    { code: "BOG", name: "Bogotá" },
    { code: "SCL", name: "Santiago" },
    { code: "LIM", name: "Lima" },
    { code: "CCS", name: "Caracas" },
    { code: "UIO", name: "Quito" },
    { code: "GYE", name: "Guayaquil" },
    { code: "MVD", name: "Montevideo" },
    { code: "ASU", name: "Asunción" },
    { code: "VVI", name: "Santa Cruz" },
    { code: "LPB", name: "La Paz" },
    { code: "CUZ", name: "Cusco" },
    { code: "CTG", name: "Cartagena" },
    { code: "CNF", name: "Belo Horizonte" },
    { code: "FLN", name: "Florianópolis" }
  ],
  "Africa": [
    // South Africa
    { code: "JNB", name: "Johannesburg O.R. Tambo" },
    { code: "DUR", name: "Durban King Shaka" },
    { code: "CPT", name: "Cape Town" },
    { code: "PLZ", name: "Port Elizabeth" },
    // Morocco
    { code: "CMN", name: "Casablanca Mohammed V" },
    { code: "RAK", name: "Marrakesh Menara" },
    { code: "FEZ", name: "Fez" },
    { code: "AGA", name: "Agadir" },
    { code: "TNG", name: "Tangier Ibn Battouta" },
    // North Africa
    { code: "CAI", name: "Cairo" },
    { code: "ALG", name: "Algiers" },
    { code: "TUN", name: "Tunis Carthage" },
    // West Africa
    { code: "NBO", name: "Nairobi" },
    { code: "LOS", name: "Lagos" },
    { code: "ACC", name: "Accra" },
    { code: "DKR", name: "Dakar" },
    // East Africa
    { code: "ADD", name: "Addis Ababa" },
    { code: "DAR", name: "Dar es Salaam" },
    { code: "EBB", name: "Entebbe" },
    // Islands
    { code: "SEZ", name: "Seychelles" },
    { code: "MRU", name: "Mauritius" }
  ]
};

// Flatten airport list for easy selection
const allAirports = Object.values(majorAirports).flat().sort((a, b) => a.code.localeCompare(b.code));

// List of airline codes and names
const airlines = [
  { code: "AA", name: "American Airlines", region: "North America", logo: "https://www.aa.com/favicon.ico" },
  { code: "DL", name: "Delta Air Lines", region: "North America", logo: "https://www.delta.com/favicon.ico" },
  { code: "UA", name: "United Airlines", region: "North America", logo: "https://www.united.com/favicon.ico" },
  { code: "BA", name: "British Airways", region: "Europe", logo: "https://www.britishairways.com/favicon.ico" },
  { code: "LH", name: "Lufthansa", region: "Europe", logo: "https://www.lufthansa.com/favicon.ico" },
  { code: "AF", name: "Air France", region: "Europe", logo: "https://www.airfrance.com/favicon.ico" },
  { code: "EK", name: "Emirates", region: "Middle East", logo: "https://www.emirates.com/favicon.ico" },
  { code: "QR", name: "Qatar Airways", region: "Middle East", logo: "https://www.qatarairways.com/favicon.ico" },
  { code: "SQ", name: "Singapore Airlines", region: "Asia", logo: "https://www.singaporeair.com/favicon.ico" },
  { code: "CX", name: "Cathay Pacific", region: "Asia", logo: "https://www.cathaypacific.com/favicon.ico" },
  { code: "JL", name: "Japan Airlines", region: "Asia", logo: "https://www.jal.com/favicon.ico" },
  { code: "QF", name: "Qantas", region: "Oceania", logo: "https://www.qantas.com/favicon.ico" },
  { code: "TG", name: "Thai Airways", region: "Asia", logo: "https://www.thaiairways.com/favicon.ico" },
  { code: "MH", name: "Malaysia Airlines", region: "Asia", logo: "https://www.malaysiaairlines.com/favicon.ico" }
];

// Generate hour options in 24-hour format
const generateHourOptions = () => {
  const hours = [];
  for (let hour = 0; hour < 24; hour++) {
    const formattedHour = hour.toString().padStart(2, '0');
    hours.push(formattedHour);
  }
  return hours;
};

// Generate minute options in 5-minute increments
const generateMinuteOptions = () => {
  const minutes = [];
  for (let minute = 0; minute < 60; minute += 5) {
    const formattedMinute = minute.toString().padStart(2, '0');
    minutes.push(formattedMinute);
  }
  return minutes;
};

const hourOptions = generateHourOptions();
const minuteOptions = generateMinuteOptions();

// Generate date options (next 365 days)
const generateDateOptions = () => {
  const dates = [];
  const today = new Date();
  
  for (let i = 0; i < 365; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    dates.push({
      value: `${year}-${month}-${day}`,
      label: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
    });
  }
  
  return dates;
};

const dateOptions = generateDateOptions();

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
  departureTime: string;
  arrivalDate: string;
  arrivalTime: string;
  flightNumber: string;
  airline: { code: string; name: string };
  duration: string;
  cabin: string;
  distanceKm: number;
  calculatedData: any;
}

const EnhancedFlightSelection = () => {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const { flightDetails, setFlightDetails, setSelectedFlight } = useFlightContext();
  
  // Form State
  const [departureRegion, setDepartureRegion] = useState<string>("");
  const [destinationRegion, setDestinationRegion] = useState<string>("");
  const [departureAirport, setDepartureAirport] = useState<string>(flightDetails?.departureAirport || "");
  const [destinationAirport, setDestinationAirport] = useState<string>(flightDetails?.arrivalAirport || "");
  const [departureDate, setDepartureDate] = useState<Date | undefined>(
    flightDetails?.departureDate ? new Date(flightDetails.departureDate) : new Date()
  );
  const [departureHour, setDepartureHour] = useState<string>("09");
  const [departureMinute, setDepartureMinute] = useState<string>("00");
  const [selectedAirline, setSelectedAirline] = useState<string>("");
  const [selectedCabin, setSelectedCabin] = useState<string>("economy");
  
  // Generated flight state
  const [flightData, setFlightData] = useState<EnhancedFlightDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    document.title = "Select Flight - FlightBack";
  }, []);
  
  // Generate flight number
  const generateFlightNumber = (airlineCode: string): string => {
    // Most airlines use numbers between 1 and 9999
    const number = Math.floor(Math.random() * 9999) + 1;
    return `${airlineCode}${number.toString().padStart(3, '0')}`;
  };

  // Calculate flight details
  const handleGenerateFlight = async () => {
    if (!departureAirport || !destinationAirport) {
      toast({
        title: "Missing information",
        description: "Please select both departure and destination airports",
        variant: "destructive",
      });
      return;
    }

    if (departureAirport === destinationAirport) {
      toast({
        title: "Invalid selection",
        description: "Departure and destination airports cannot be the same",
        variant: "destructive",
      });
      return;
    }

    if (!selectedAirline) {
      toast({
        title: "Missing information",
        description: "Please select an airline",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError("");
    setFlightData(null);

    try {
      // Format date to YYYY-MM-DD
      const formattedDate = departureDate ? format(departureDate, "yyyy-MM-dd") : "";
      
      // Combine hour and minute for departure time
      const departureTime = `${departureHour}:${departureMinute}`;
      
      // Calculate enhanced flight details
      const calculatedData = await calculateEnhancedFlightDetails(
        departureAirport,
        destinationAirport,
        formattedDate,
        departureTime
      );
      
      // Find the airline information
      const airlineInfo = airlines.find(a => a.code === selectedAirline);
      if (!airlineInfo) throw new Error("Airline information not found");
      
      // Find airport names
      const departureAirportInfo = allAirports.find(a => a.code === departureAirport);
      const destinationAirportInfo = allAirports.find(a => a.code === destinationAirport);
      
      if (!departureAirportInfo || !destinationAirportInfo) {
        throw new Error("Airport information not found");
      }
      
      // Generate flight data
      const enhancedFlightData: EnhancedFlightDetails = {
        departureAirport: departureAirport,
        departureAirportName: departureAirportInfo.name,
        arrivalAirport: destinationAirport,
        arrivalAirportName: destinationAirportInfo.name,
        departureDate: calculatedData.departureDateLocal,
        departureTime: calculatedData.departureTimeLocal,
        arrivalDate: calculatedData.arrivalDateLocal,
        arrivalTime: calculatedData.arrivalTimeLocal,
        flightNumber: generateFlightNumber(selectedAirline),
        airline: {
          code: airlineInfo.code,
          name: airlineInfo.name
        },
        duration: calculatedData.durationFormatted,
        cabin: selectedCabin,
        distanceKm: calculatedData.distanceKm,
        calculatedData
      };
      
      setFlightData(enhancedFlightData);
    } catch (error) {
      console.error("Error generating flight:", error);
      setError(`Failed to generate flight: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    if (!flightData) {
      toast({
        title: "No flight selected",
        description: "Please generate a flight first",
        variant: "destructive",
      });
      return;
    }
    
    // Format date to YYYY-MM-DD
    const formattedDate = departureDate ? format(departureDate, "yyyy-MM-dd") : "";
    
    // Combine hour and minute for departure time
    const departureTime = `${departureHour}:${departureMinute}`;
    
    // Save flight details to context
    setFlightDetails({
      departureAirport: flightData.departureAirport,
      arrivalAirport: flightData.arrivalAirport,
      departureDate: formattedDate,
      departureTime: flightData.departureTime,
      calculatedFlightData: flightData
    });
    
    // Mock flight for the selected flight context
    const mockFlight = {
      id: 1,
      flightNumber: flightData.flightNumber,
      airline: {
        id: 1,
        code: flightData.airline.code,
        name: flightData.airline.name,
        logo: airlines.find(a => a.code === flightData.airline.code)?.logo || "",
        region: airlines.find(a => a.code === flightData.airline.code)?.region || ""
      },
      departure: {
        airport: {
          id: 1,
          code: flightData.departureAirport,
          name: flightData.departureAirportName,
          city: flightData.departureAirportName.split(" ")[0], // Simple extraction
          country: getAirportRegion(flightData.departureAirport)
        },
        time: flightData.departureTime
      },
      arrival: {
        airport: {
          id: 2,
          code: flightData.arrivalAirport,
          name: flightData.arrivalAirportName,
          city: flightData.arrivalAirportName.split(" ")[0], // Simple extraction
          country: getAirportRegion(flightData.arrivalAirport)
        },
        time: flightData.arrivalTime
      },
      duration: flightData.duration,
      price: `$${Math.floor(Math.random() * 1000) + 200}`,
      class: flightData.cabin
    };
    
    setSelectedFlight(mockFlight);
    
    // Navigate to next step
    navigate("/passenger-details");
  };

  // Get region from airport code
  const getAirportRegion = (code: string): string => {
    for (const [region, airports] of Object.entries(majorAirports)) {
      if (airports.some(airport => airport.code === code)) {
        return region;
      }
    }
    return "Unknown";
  };

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <ProgressStepper currentStep={1} />

      <div className="max-w-4xl mx-auto">
        <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6 text-foreground">Select Your Flight</h2>
        
        <Card className="mb-6 md:mb-8 border-border bg-card">
          <CardContent className="p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-foreground font-medium mb-2 text-sm">
                    Departure Region
                  </label>
                  <Select value={departureRegion} onValueChange={setDepartureRegion}>
                    <SelectTrigger className="w-full bg-background">
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(majorAirports).map((region) => (
                        <SelectItem key={region} value={region}>
                          {region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-foreground font-medium mb-2 text-sm">
                    Departure Airport
                  </label>
                  <Select 
                    value={departureAirport} 
                    onValueChange={setDepartureAirport}
                    disabled={!departureRegion}
                  >
                    <SelectTrigger className="w-full bg-background">
                      <SelectValue placeholder="Select departure airport" />
                    </SelectTrigger>
                    <SelectContent>
                      {departureRegion && majorAirports[departureRegion as keyof typeof majorAirports].map((airport) => (
                        <SelectItem key={airport.code} value={airport.code}>
                          {airport.code} - {airport.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-foreground font-medium mb-2 text-sm">
                    Departure Date
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal bg-background"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {departureDate ? (
                          format(departureDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={departureDate}
                        onSelect={setDepartureDate}
                        initialFocus
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div>
                  <label className="block text-foreground font-medium mb-2 text-sm">
                    Departure Time
                  </label>
                  <div className="flex space-x-2">
                    <div className="w-1/2">
                      <Select value={departureHour} onValueChange={setDepartureHour}>
                        <SelectTrigger className="w-full bg-background">
                          <SelectValue placeholder="Hour" />
                        </SelectTrigger>
                        <SelectContent>
                          {hourOptions.map((hour) => (
                            <SelectItem key={hour} value={hour}>
                              {hour}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-1/2">
                      <Select value={departureMinute} onValueChange={setDepartureMinute}>
                        <SelectTrigger className="w-full bg-background">
                          <SelectValue placeholder="Minute" />
                        </SelectTrigger>
                        <SelectContent>
                          {minuteOptions.map((minute) => (
                            <SelectItem key={minute} value={minute}>
                              {minute}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-foreground font-medium mb-2 text-sm">
                    Destination Region
                  </label>
                  <Select value={destinationRegion} onValueChange={setDestinationRegion}>
                    <SelectTrigger className="w-full bg-background">
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(majorAirports).map((region) => (
                        <SelectItem key={region} value={region}>
                          {region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-foreground font-medium mb-2 text-sm">
                    Destination Airport
                  </label>
                  <Select 
                    value={destinationAirport} 
                    onValueChange={setDestinationAirport}
                    disabled={!destinationRegion}
                  >
                    <SelectTrigger className="w-full bg-background">
                      <SelectValue placeholder="Select destination airport" />
                    </SelectTrigger>
                    <SelectContent>
                      {destinationRegion && majorAirports[destinationRegion as keyof typeof majorAirports].map((airport) => (
                        <SelectItem key={airport.code} value={airport.code}>
                          {airport.code} - {airport.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-foreground font-medium mb-2 text-sm">
                    Airline
                  </label>
                  <Select 
                    value={selectedAirline} 
                    onValueChange={setSelectedAirline}
                    disabled={!departureAirport}
                  >
                    <SelectTrigger className="w-full bg-background">
                      <SelectValue placeholder="Select airline" />
                    </SelectTrigger>
                    <SelectContent>
                      {departureAirport && (
                        <>
                          {/* First show airlines from the departure region */}
                          <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
                            Based in {getAirportRegion(departureAirport)}
                          </div>
                          {airlines
                            .filter(airline => airline.region === getAirportRegion(departureAirport))
                            .map((airline) => (
                              <SelectItem key={airline.code} value={airline.code}>
                                {airline.code} - {airline.name}
                              </SelectItem>
                            ))
                          }
                          
                          {/* Then show other airlines */}
                          <div className="px-2 py-1.5 mt-2 text-sm font-medium text-muted-foreground">
                            Other Airlines
                          </div>
                          {airlines
                            .filter(airline => airline.region !== getAirportRegion(departureAirport))
                            .map((airline) => (
                              <SelectItem key={airline.code} value={airline.code}>
                                {airline.code} - {airline.name}
                              </SelectItem>
                            ))
                          }
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-foreground font-medium mb-2 text-sm">
                    Cabin Class
                  </label>
                  <Select value={selectedCabin} onValueChange={setSelectedCabin}>
                    <SelectTrigger className="w-full bg-background">
                      <SelectValue placeholder="Select cabin class" />
                    </SelectTrigger>
                    <SelectContent>
                      {cabinClasses.map((cabin) => (
                        <SelectItem key={cabin.value} value={cabin.value}>
                          {cabin.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-center">
              <Button 
                onClick={handleGenerateFlight}
                disabled={!departureAirport || !destinationAirport || !selectedAirline || isLoading}
                className="w-full md:w-auto"
              >
                {isLoading ? "Generating Flight..." : "Generate Flight"}
              </Button>
            </div>
            
            {error && (
              <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                {error}
              </div>
            )}
          </CardContent>
        </Card>
        
        {flightData && (
          <Card className="mb-6 md:mb-8 border-border bg-card">
            <CardContent className="p-4 md:p-6">
              <div className="mb-4 flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-12 h-12 flex items-center justify-center bg-primary/10 rounded-full mr-3">
                    <Plane className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{flightData.airline.code} {flightData.flightNumber}</h3>
                    <p className="text-sm text-muted-foreground">{flightData.airline.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="bg-primary/10">
                    {flightData.cabin.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Badge>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="flex justify-between items-center mb-4">
                <div className="space-y-1 text-center">
                  <div className="text-3xl font-bold">{flightData.departureTime}</div>
                  <div className="text-sm font-medium">{flightData.departureDate}</div>
                  <div className="text-sm">{flightData.departureAirport}</div>
                  <div className="text-xs text-muted-foreground">{flightData.departureAirportName}</div>
                </div>
                
                <div className="flex flex-col items-center px-4">
                  <div className="text-xs text-muted-foreground mb-1">{flightData.duration}</div>
                  <div className="relative w-32 md:w-48">
                    <div className="h-0.5 bg-primary w-full"></div>
                    <Plane className="absolute -top-2 right-0 h-4 w-4 text-primary rotate-90" />
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatDistance(flightData.distanceKm)}
                  </div>
                </div>
                
                <div className="space-y-1 text-center">
                  <div className="text-3xl font-bold">{flightData.arrivalTime}</div>
                  <div className="text-sm font-medium">
                    {flightData.arrivalDate}
                    {flightData.departureDate !== flightData.arrivalDate && (
                      <span className="ml-1 text-xs text-primary">
                        {flightData.departureDate < flightData.arrivalDate ? '+1' : '-1'}
                      </span>
                    )}
                  </div>
                  <div className="text-sm">{flightData.arrivalAirport}</div>
                  <div className="text-xs text-muted-foreground">{flightData.arrivalAirportName}</div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-4">
                <div className="bg-muted/40 rounded-md px-3 py-1.5 text-xs flex items-center">
                  <Clock className="h-3.5 w-3.5 mr-1.5" />
                  Flight Duration: {flightData.duration}
                </div>
                <div className="bg-muted/40 rounded-md px-3 py-1.5 text-xs flex items-center">
                  <Calendar className="h-3.5 w-3.5 mr-1.5" />
                  {flightData.departureDate}
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <Button onClick={handleContinue}>
                  Continue to Passenger Details
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default EnhancedFlightSelection;