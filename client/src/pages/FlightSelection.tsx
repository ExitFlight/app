import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, PlaneIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ProgressStepper from "@/components/ProgressStepper";
import AirlineLogo from "@/components/AirlineLogo";
import { type Airport, type FlightWithDetails } from "@shared/schema";
import { useFlightContext } from "@/lib/context/FlightContext";

const FlightSelection = () => {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const { flightDetails, setFlightDetails, setSelectedFlight } = useFlightContext();
  
  // Form State
  const [departureAirport, setDepartureAirport] = useState<string>(flightDetails?.departureAirport || "");
  const [arrivalAirport, setArrivalAirport] = useState<string>(flightDetails?.arrivalAirport || "");
  const [departureDate, setDepartureDate] = useState<string>(flightDetails?.departureDate || new Date().toISOString().split('T')[0]);
  const [departureTime, setDepartureTime] = useState<string>(flightDetails?.departureTime || "");
  const [selectedFlightId, setSelectedFlightId] = useState<number | null>(null);
  
  // Region and Country Selection State
  const [selectedDepartureRegion, setSelectedDepartureRegion] = useState<string>("all");
  const [selectedArrivalRegion, setSelectedArrivalRegion] = useState<string>("all");
  const [selectedDepartureCountry, setSelectedDepartureCountry] = useState<string>("");
  const [selectedArrivalCountry, setSelectedArrivalCountry] = useState<string>("");
  const [selectedAirlineRegion, setSelectedAirlineRegion] = useState<string>("");

  // Fetch all airports
  const { data: airports, isLoading: isLoadingAirports } = useQuery<Airport[]>({
    queryKey: ["/api/airports"],
  });
  
  // Fetch airport regions
  const { data: airportRegions } = useQuery<{region: string, airports: Airport[]}[]>({
    queryKey: ["/api/airports/regions"],
  });
  
  // Fetch departure countries based on selected region
  const { data: departureCountries } = useQuery<string[]>({
    queryKey: ["/api/countries/by-region", selectedDepartureRegion],
    queryFn: async () => {
      return fetch(`/api/countries/by-region/${selectedDepartureRegion}`).then(res => res.json());
    },
    enabled: !!selectedDepartureRegion,
  });
  
  // Fetch arrival countries based on selected region
  const { data: arrivalCountries } = useQuery<string[]>({
    queryKey: ["/api/countries/by-region", selectedArrivalRegion],
    queryFn: async () => {
      return fetch(`/api/countries/by-region/${selectedArrivalRegion}`).then(res => res.json());
    },
    enabled: !!selectedArrivalRegion,
  });
  
  // Fetch departure airports based on selected country
  const { data: departureAirports } = useQuery<Airport[]>({
    queryKey: ["/api/airports/by-country", selectedDepartureCountry],
    queryFn: async () => {
      return fetch(`/api/airports/by-country/${encodeURIComponent(selectedDepartureCountry)}`).then(res => res.json());
    },
    enabled: !!selectedDepartureCountry,
  });
  
  // Fetch arrival airports based on selected country
  const { data: arrivalAirports } = useQuery<Airport[]>({
    queryKey: ["/api/airports/by-country", selectedArrivalCountry],
    queryFn: async () => {
      return fetch(`/api/airports/by-country/${encodeURIComponent(selectedArrivalCountry)}`).then(res => res.json());
    },
    enabled: !!selectedArrivalCountry,
  });
  
  // Fetch airline regions
  const { data: airlineRegions } = useQuery<{region: string, airlines: any[]}[]>({
    queryKey: ["/api/airlines/regions"],
  });

  // Fetch flights based on search criteria
  const { data: flights, isLoading: isLoadingFlights } = useQuery<FlightWithDetails[]>({
    queryKey: [
      "/api/flights/search",
      departureAirport,
      arrivalAirport,
      departureDate,
      departureTime,
    ],
    enabled: !!(departureAirport && arrivalAirport && departureDate),
  });

  // Reset country when region changes
  useEffect(() => {
    setSelectedDepartureCountry("");
    setDepartureAirport("");
  }, [selectedDepartureRegion]);

  useEffect(() => {
    setSelectedArrivalCountry("");
    setArrivalAirport("");
  }, [selectedArrivalRegion]);

  useEffect(() => {
    document.title = "Select Flight - FlightBack";
  }, []);

  const handleContinue = () => {
    if (!selectedFlightId) {
      toast({
        title: "No flight selected",
        description: "Please select a flight to continue",
        variant: "destructive",
      });
      return;
    }

    const selected = flights && flights.find((flight) => flight.id === selectedFlightId);
    if (selected) {
      // Save flight search details
      setFlightDetails({
        departureAirport,
        arrivalAirport,
        departureDate,
        departureTime,
      });
      
      // Save selected flight
      setSelectedFlight(selected);
      
      // Navigate to passenger details
      navigate("/passenger-details");
    }
  };

  const selectFlight = (flightId: number) => {
    setSelectedFlightId(flightId);
  };

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <ProgressStepper currentStep={1} />

      <div className="max-w-4xl mx-auto">
        <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6 text-foreground">Select Your Flight</h2>
        
        <Card className="mb-6 md:mb-8 border-border bg-card">
          <CardContent className="p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {/* Departure Selection */}
              <div>
                <div className="mb-4">
                  <label className="block text-foreground font-medium mb-2 text-sm">
                    Departure Region
                  </label>
                  <Select
                    value={selectedDepartureRegion}
                    onValueChange={setSelectedDepartureRegion}
                  >
                    <SelectTrigger className="w-full bg-background">
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Regions</SelectItem>
                      {airportRegions && airportRegions.map((regionData) => (
                        <SelectItem key={regionData.region} value={regionData.region}>
                          {regionData.region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedDepartureRegion && selectedDepartureRegion !== "all" && (
                  <div className="mb-4">
                    <label className="block text-foreground font-medium mb-2 text-sm">
                      Departure Country
                    </label>
                    <Select
                      value={selectedDepartureCountry}
                      onValueChange={setSelectedDepartureCountry}
                    >
                      <SelectTrigger className="w-full bg-background">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {departureCountries && departureCountries.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <div>
                  <label className="block text-foreground font-medium mb-2 text-sm" htmlFor="departure">
                    Departure Airport
                  </label>
                  <Select
                    value={departureAirport}
                    onValueChange={setDepartureAirport}
                    disabled={isLoadingAirports || (selectedDepartureRegion !== "all" && !selectedDepartureCountry)}
                  >
                    <SelectTrigger className="w-full bg-background">
                      <SelectValue placeholder="Select airport" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedDepartureRegion === "all" && airports && airports.map((airport) => (
                        <SelectItem key={airport.code} value={airport.code}>
                          {airport.city} - {airport.name} ({airport.code})
                        </SelectItem>
                      ))}
                      
                      {selectedDepartureRegion !== "all" && selectedDepartureCountry && departureAirports && 
                        departureAirports.map((airport) => (
                          <SelectItem key={airport.code} value={airport.code}>
                            {airport.city} - {airport.name} ({airport.code})
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Arrival Selection */}
              <div>
                <div className="mb-4">
                  <label className="block text-foreground font-medium mb-2 text-sm">
                    Arrival Region
                  </label>
                  <Select
                    value={selectedArrivalRegion}
                    onValueChange={setSelectedArrivalRegion}
                  >
                    <SelectTrigger className="w-full bg-background">
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Regions</SelectItem>
                      {airportRegions && airportRegions.map((regionData) => (
                        <SelectItem key={regionData.region} value={regionData.region}>
                          {regionData.region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedArrivalRegion && selectedArrivalRegion !== "all" && (
                  <div className="mb-4">
                    <label className="block text-foreground font-medium mb-2 text-sm">
                      Arrival Country
                    </label>
                    <Select
                      value={selectedArrivalCountry}
                      onValueChange={setSelectedArrivalCountry}
                    >
                      <SelectTrigger className="w-full bg-background">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {arrivalCountries && arrivalCountries.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <div>
                  <label className="block text-foreground font-medium mb-2 text-sm" htmlFor="arrival">
                    Arrival Airport
                  </label>
                  <Select
                    value={arrivalAirport}
                    onValueChange={setArrivalAirport}
                    disabled={isLoadingAirports || (selectedArrivalRegion !== "all" && !selectedArrivalCountry)}
                  >
                    <SelectTrigger className="w-full bg-background">
                      <SelectValue placeholder="Select airport" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedArrivalRegion === "all" && airports && airports.map((airport) => (
                        <SelectItem key={airport.code} value={airport.code}>
                          {airport.city} - {airport.name} ({airport.code})
                        </SelectItem>
                      ))}
                      
                      {selectedArrivalRegion !== "all" && selectedArrivalCountry && arrivalAirports && 
                        arrivalAirports.map((airport) => (
                          <SelectItem key={airport.code} value={airport.code}>
                            {airport.city} - {airport.name} ({airport.code})
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <label className="block text-foreground font-medium mb-2 text-sm" htmlFor="date">
                  Departure Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    id="date"
                    className="w-full p-2 md:p-3 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-foreground font-medium mb-2 text-sm" htmlFor="time">
                  Departure Time
                </label>
                <div className="relative">
                  <Select value={departureTime} onValueChange={setDepartureTime}>
                    <SelectTrigger className="w-full bg-background">
                      <SelectValue placeholder="Select departure time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Morning (6 AM - 12 PM)</SelectItem>
                      <SelectItem value="afternoon">Afternoon (12 PM - 6 PM)</SelectItem>
                      <SelectItem value="evening">Evening (6 PM - 12 AM)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3 md:mb-4">
          <h3 className="text-lg md:text-xl font-semibold text-foreground">Available Flights</h3>
          
          {airlineRegions && flights && flights.length > 0 && (
            <div>
              <label className="block text-foreground font-medium mb-2 text-sm">
                Filter by Airline Region
              </label>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant={selectedAirlineRegion === "" ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => setSelectedAirlineRegion("")}
                  className="text-xs"
                >
                  All
                </Button>
                {airlineRegions.map((regionData) => (
                  <Button 
                    key={regionData.region} 
                    variant={selectedAirlineRegion === regionData.region ? "default" : "outline"} 
                    size="sm" 
                    onClick={() => setSelectedAirlineRegion(regionData.region)}
                    className="text-xs"
                  >
                    {regionData.region}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {isLoadingFlights ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Searching for flights...</p>
          </div>
        ) : !flights || flights.length === 0 ? (
          <Card className="mb-4 border-border bg-card">
            <CardContent className="p-6">
              <div className="text-center py-6 md:py-8">
                <p className="text-foreground mb-2">No flights found for this route and date.</p>
                <p className="text-muted-foreground">Try changing your search criteria.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          flights
            .filter(flight => selectedAirlineRegion ? flight.airline.region === selectedAirlineRegion : true)
            .map((flight) => (
            <div key={flight.id} className="mb-4">
              <Card 
                className={`overflow-hidden hover:shadow-md transition-shadow duration-300 cursor-pointer border-border bg-card ${
                  selectedFlightId === flight.id ? "border-2 border-primary" : ""
                }`}
                onClick={() => selectFlight(flight.id)}
              >
                <CardContent className="p-4 md:p-5">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div className="flex items-center mb-4 md:mb-0">
                      <AirlineLogo 
                        airlineLogo={flight.airline.logo} 
                        airlineName={flight.airline.name} 
                        className="mr-3 md:mr-4" 
                        size={32}
                      />
                      <div>
                        <h4 className="font-semibold text-base md:text-lg text-foreground">
                          {flight.airline.name}
                        </h4>
                        <p className="text-muted-foreground text-sm font-medium">
                          Flight <span className="font-medium text-primary">{flight.flightNumber}</span>
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 md:space-x-16 mt-2 md:mt-0">
                      <div className="text-center">
                        <p className="text-lg md:text-xl font-semibold text-foreground">{flight.departure.time}</p>
                        <p className="text-xs md:text-sm text-muted-foreground">{flight.departure.airport.code}</p>
                      </div>
                      
                      <div className="flex flex-col items-center">
                        <div className="text-muted-foreground text-xs md:text-sm">{flight.duration}</div>
                        <div className="flex items-center w-16 md:w-32">
                          <div className="h-0.5 w-full bg-muted relative">
                            <div className="absolute -top-1.5 right-0">
                              <PlaneIcon className="text-primary" size={14} />
                            </div>
                          </div>
                        </div>
                        <div className="text-muted-foreground text-xs">Direct</div>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-lg md:text-xl font-semibold text-foreground">{flight.arrival.time}</p>
                        <p className="text-xs md:text-sm text-muted-foreground">{flight.arrival.airport.code}</p>
                      </div>
                    </div>
                    
                    <div className="mt-3 md:mt-0 md:ml-4 text-right">
                      <p className="text-accent font-semibold text-base md:text-lg">{flight.price}</p>
                      <p className="text-muted-foreground text-xs md:text-sm">{flight.class}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))
        )}
        
        <div className="flex justify-end mt-6 md:mt-8">
          <Button
            variant="default"
            size="lg"
            onClick={handleContinue}
            disabled={!selectedFlightId}
            className="w-full md:w-auto"
          >
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FlightSelection;