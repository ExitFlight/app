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
import ProgressStepper from "@/components/ProgressStepper";
import { type Airport } from "@shared/schema";
import { useFlightContext } from "@/lib/context/FlightContext";
import { calculateBasicFlightDetails } from "@/lib/flightTimeCalculator";

const FlightSelection = () => {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const { flightDetails, setFlightDetails } = useFlightContext();
  
  // Form State
  const [departureAirport, setDepartureAirport] = useState<string>(flightDetails?.departureAirport || "");
  const [arrivalAirport, setArrivalAirport] = useState<string>(flightDetails?.arrivalAirport || "");
  const [departureDate, setDepartureDate] = useState<string>(flightDetails?.departureDate || new Date().toISOString().split('T')[0]);
  
  // Custom time selection with 24-hour format
  const [departureHour, setDepartureHour] = useState<string>("09");
  const [departureMinute, setDepartureMinute] = useState<string>("00");
  
  // Flight arrival time state
  const [estimatedArrivalTime, setEstimatedArrivalTime] = useState<string>("");
  const [estimatedFlightDuration, setEstimatedFlightDuration] = useState<string>("");
  const [arrivalDateOffset, setArrivalDateOffset] = useState<number>(0);
  
  // Region and Country Selection State
  const [selectedDepartureRegion, setSelectedDepartureRegion] = useState<string>("all");
  const [selectedArrivalRegion, setSelectedArrivalRegion] = useState<string>("all");
  const [selectedDepartureCountry, setSelectedDepartureCountry] = useState<string>("");
  const [selectedArrivalCountry, setSelectedArrivalCountry] = useState<string>("");

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

  // Effect to calculate estimated arrival time when inputs change
  useEffect(() => {
    const calculateFlightEstimates = async () => {
      // Only calculate if we have both departure and arrival cities
      if (departureAirport && arrivalAirport) {
        try {
          // Get the airports data
          const originAirport = airports?.find(a => a.code === departureAirport);
          const destAirport = airports?.find(a => a.code === arrivalAirport);
          
          if (originAirport && destAirport) {
            // Calculate flight details
            const flightDetails = await calculateBasicFlightDetails(
              originAirport.city,
              destAirport.city
            );
            
            // Override the departure time with our selected time
            flightDetails.departureTimeLocal = `${departureHour}:${departureMinute}`;
            flightDetails.departureDateLocal = departureDate;
            
            // Update state with estimated arrival info
            setEstimatedArrivalTime(flightDetails.arrivalTimeLocal);
            setEstimatedFlightDuration(flightDetails.flightDurationFormatted);
            setArrivalDateOffset(flightDetails.arrivalDateOffset);
          }
        } catch (error) {
          console.error('Error calculating flight estimates:', error);
        }
      }
    };
    
    calculateFlightEstimates();
  }, [departureAirport, arrivalAirport, departureHour, departureMinute, departureDate, airports]);
  
  const handleContinue = () => {
    if (!departureAirport || !arrivalAirport || !departureDate) {
      toast({
        title: "Missing information",
        description: "Please select departure and arrival airports, and a date",
        variant: "destructive",
      });
      return;
    }
    
    // Format the time in 24-hour format
    const formattedTime = `${departureHour}:${departureMinute}`;
    
    // Save flight details
    setFlightDetails({
      departureAirport,
      arrivalAirport,
      departureDate,
      departureTime: formattedTime,
    });
    
    // Move to passenger details page
    navigate("/passenger-details");
  };

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <ProgressStepper currentStep={1} />
      
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">Flight Selection</h1>
        <p className="text-muted-foreground">Select your departure and arrival airports</p>
      </div>
      
      <Card className="mb-6 border-border bg-card">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">Departure</h3>
              
              <div>
                <label className="block text-foreground font-medium mb-2 text-sm">
                  Region
                </label>
                <div className="relative">
                  <Select value={selectedDepartureRegion} onValueChange={setSelectedDepartureRegion}>
                    <SelectTrigger className="w-full bg-background">
                      <SelectValue placeholder="Select a region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Regions</SelectItem>
                      {airportRegions && airportRegions.map((region) => (
                        <SelectItem key={region.region} value={region.region}>
                          {region.region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {selectedDepartureRegion !== "all" && departureCountries && departureCountries.length > 0 && (
                <div>
                  <label className="block text-foreground font-medium mb-2 text-sm">
                    Country
                  </label>
                  <div className="relative">
                    <Select value={selectedDepartureCountry} onValueChange={setSelectedDepartureCountry}>
                      <SelectTrigger className="w-full bg-background">
                        <SelectValue placeholder="Select a country" />
                      </SelectTrigger>
                      <SelectContent>
                        {departureCountries.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-foreground font-medium mb-2 text-sm">
                  Airport
                </label>
                <div className="relative">
                  <Select value={departureAirport} onValueChange={setDepartureAirport}>
                    <SelectTrigger className="w-full bg-background">
                      <SelectValue placeholder="Select departure airport" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedDepartureCountry && departureAirports ? (
                        departureAirports.map((airport) => (
                          <SelectItem key={airport.code} value={airport.code}>
                            {airport.name} ({airport.code}) - {airport.city}
                          </SelectItem>
                        ))
                      ) : airports ? (
                        airports.map((airport) => (
                          <SelectItem key={airport.code} value={airport.code}>
                            {airport.name} ({airport.code}) - {airport.city}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="loading" disabled>
                          Loading airports...
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">Arrival</h3>
              
              <div>
                <label className="block text-foreground font-medium mb-2 text-sm">
                  Region
                </label>
                <div className="relative">
                  <Select value={selectedArrivalRegion} onValueChange={setSelectedArrivalRegion}>
                    <SelectTrigger className="w-full bg-background">
                      <SelectValue placeholder="Select a region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Regions</SelectItem>
                      {airportRegions && airportRegions.map((region) => (
                        <SelectItem key={region.region} value={region.region}>
                          {region.region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {selectedArrivalRegion !== "all" && arrivalCountries && arrivalCountries.length > 0 && (
                <div>
                  <label className="block text-foreground font-medium mb-2 text-sm">
                    Country
                  </label>
                  <div className="relative">
                    <Select value={selectedArrivalCountry} onValueChange={setSelectedArrivalCountry}>
                      <SelectTrigger className="w-full bg-background">
                        <SelectValue placeholder="Select a country" />
                      </SelectTrigger>
                      <SelectContent>
                        {arrivalCountries.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-foreground font-medium mb-2 text-sm">
                  Airport
                </label>
                <div className="relative">
                  <Select value={arrivalAirport} onValueChange={setArrivalAirport}>
                    <SelectTrigger className="w-full bg-background">
                      <SelectValue placeholder="Select arrival airport" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedArrivalCountry && arrivalAirports ? (
                        arrivalAirports.map((airport) => (
                          <SelectItem key={airport.code} value={airport.code}>
                            {airport.name} ({airport.code}) - {airport.city}
                          </SelectItem>
                        ))
                      ) : airports ? (
                        airports.map((airport) => (
                          <SelectItem key={airport.code} value={airport.code}>
                            {airport.name} ({airport.code}) - {airport.city}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="loading" disabled>
                          Loading airports...
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
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
                  className="w-full p-2 border rounded-md bg-background text-foreground"
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-foreground font-medium mb-2 text-sm">
                Departure Time
              </label>
              <div className="flex items-center space-x-2">
                {/* Hour Selection (24-hour format) */}
                <div className="w-1/2">
                  <Select value={departureHour} onValueChange={setDepartureHour}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Hour" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => i).map(hour => (
                        <SelectItem key={hour} value={hour.toString().padStart(2, '0')}>
                          {hour.toString().padStart(2, '0')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Minute Selection */}
                <div className="w-1/2">
                  <Select value={departureMinute} onValueChange={setDepartureMinute}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Min" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => i * 5).map(minute => (
                        <SelectItem key={minute} value={minute.toString().padStart(2, '0')}>
                          {minute.toString().padStart(2, '0')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end mb-8">
        <Button 
          onClick={handleContinue}
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Continue to Passenger Details
        </Button>
      </div>
    </div>
  );
};

export default FlightSelection;