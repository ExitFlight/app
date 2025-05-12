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
  
  const [departureAirport, setDepartureAirport] = useState<string>(flightDetails?.departureAirport || "");
  const [arrivalAirport, setArrivalAirport] = useState<string>(flightDetails?.arrivalAirport || "");
  const [departureDate, setDepartureDate] = useState<string>(flightDetails?.departureDate || new Date().toISOString().split('T')[0]);
  const [departureTime, setDepartureTime] = useState<string>(flightDetails?.departureTime || "");
  const [selectedFlightId, setSelectedFlightId] = useState<number | null>(null);

  // Fetch airports
  const { data: airports, isLoading: isLoadingAirports } = useQuery<Airport[]>({
    queryKey: ["/api/airports"],
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
              <div>
                <label className="block text-foreground font-medium mb-2 text-sm" htmlFor="departure">
                  Departure City
                </label>
                <div className="relative">
                  <Select
                    value={departureAirport}
                    onValueChange={setDepartureAirport}
                    disabled={isLoadingAirports}
                  >
                    <SelectTrigger className="w-full bg-background">
                      <SelectValue placeholder="Select departure city" />
                    </SelectTrigger>
                    <SelectContent>
                      {airports && airports.map((airport) => (
                        <SelectItem key={airport.code} value={airport.code}>
                          {airport.city} ({airport.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <label className="block text-foreground font-medium mb-2 text-sm" htmlFor="destination">
                  Destination City
                </label>
                <div className="relative">
                  <Select
                    value={arrivalAirport}
                    onValueChange={setArrivalAirport}
                    disabled={isLoadingAirports}
                  >
                    <SelectTrigger className="w-full bg-background">
                      <SelectValue placeholder="Select destination city" />
                    </SelectTrigger>
                    <SelectContent>
                      {airports && airports.map((airport) => (
                        <SelectItem key={airport.code} value={airport.code}>
                          {airport.city} ({airport.code})
                        </SelectItem>
                      ))}
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
        
        <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-foreground">Available Flights</h3>
        
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
          flights.map((flight) => (
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
        
        <div className="mt-6 md:mt-8 flex justify-end">
          <Button onClick={handleContinue} className="px-4 md:px-6">
            Continue
            <ArrowRight className="ml-2" size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FlightSelection;
