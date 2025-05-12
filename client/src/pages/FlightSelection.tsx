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
  const { data: airports, isLoading: isLoadingAirports } = useQuery({
    queryKey: ["/api/airports"],
  });

  // Fetch flights based on search criteria
  const { data: flights, isLoading: isLoadingFlights } = useQuery({
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

    const selected = flights?.find((flight: FlightWithDetails) => flight.id === selectedFlightId);
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
    <div className="container mx-auto px-4 py-8">
      <ProgressStepper currentStep={1} />

      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6 text-neutral-800">Select Your Flight</h2>
        
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-neutral-700 font-medium mb-2" htmlFor="departure">
                  Departure City
                </label>
                <div className="relative">
                  <Select
                    value={departureAirport}
                    onValueChange={setDepartureAirport}
                    disabled={isLoadingAirports}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select departure city" />
                    </SelectTrigger>
                    <SelectContent>
                      {airports?.map((airport: Airport) => (
                        <SelectItem key={airport.code} value={airport.code}>
                          {airport.city} ({airport.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <label className="block text-neutral-700 font-medium mb-2" htmlFor="destination">
                  Destination City
                </label>
                <div className="relative">
                  <Select
                    value={arrivalAirport}
                    onValueChange={setArrivalAirport}
                    disabled={isLoadingAirports}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select destination city" />
                    </SelectTrigger>
                    <SelectContent>
                      {airports?.map((airport: Airport) => (
                        <SelectItem key={airport.code} value={airport.code}>
                          {airport.city} ({airport.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <label className="block text-neutral-700 font-medium mb-2" htmlFor="date">
                  Departure Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    id="date"
                    className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-neutral-700 font-medium mb-2" htmlFor="time">
                  Departure Time
                </label>
                <div className="relative">
                  <Select value={departureTime} onValueChange={setDepartureTime}>
                    <SelectTrigger className="w-full">
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
        
        <h3 className="text-xl font-semibold mb-4 text-neutral-800">Available Flights</h3>
        
        {isLoadingFlights ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-neutral-600">Searching for flights...</p>
          </div>
        ) : !flights || flights.length === 0 ? (
          <Card className="shadow-md mb-4">
            <CardContent className="p-6">
              <div className="text-center py-8">
                <p className="text-neutral-600 mb-2">No flights found for this route and date.</p>
                <p className="text-neutral-500">Try changing your search criteria.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          flights.map((flight: FlightWithDetails) => (
            <div key={flight.id} className="mb-4">
              <Card 
                className={`overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer ${
                  selectedFlightId === flight.id ? "border-2 border-primary" : ""
                }`}
                onClick={() => selectFlight(flight.id)}
              >
                <CardContent className="p-5">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div className="flex items-center mb-4 md:mb-0">
                      <AirlineLogo 
                        airlineLogo={flight.airline.logo} 
                        airlineName={flight.airline.name} 
                        className="mr-4" 
                      />
                      <div>
                        <h4 className="font-semibold text-lg text-neutral-800">
                          {flight.airline.name}
                        </h4>
                        <p className="text-neutral-500 font-medium">
                          Flight <span className="font-medium text-primary">{flight.flightNumber}</span>
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-8 md:space-x-16">
                      <div className="text-center">
                        <p className="text-xl font-semibold text-neutral-800">{flight.departure.time}</p>
                        <p className="text-sm text-neutral-500">{flight.departure.airport.code}</p>
                      </div>
                      
                      <div className="flex flex-col items-center">
                        <div className="text-neutral-400 text-sm">{flight.duration}</div>
                        <div className="flex items-center w-24 md:w-32">
                          <div className="h-0.5 w-full bg-neutral-300 relative">
                            <div className="absolute -top-1.5 right-0">
                              <PlaneIcon className="text-primary" size={16} />
                            </div>
                          </div>
                        </div>
                        <div className="text-neutral-400 text-xs">Direct</div>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-xl font-semibold text-neutral-800">{flight.arrival.time}</p>
                        <p className="text-sm text-neutral-500">{flight.arrival.airport.code}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 md:mt-0 md:ml-4 text-right">
                      <p className="text-accent font-semibold text-lg">{flight.price}</p>
                      <p className="text-neutral-500 text-sm">{flight.class}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))
        )}
        
        <div className="mt-8 flex justify-end">
          <Button onClick={handleContinue} className="px-6">
            Continue
            <ArrowRight className="ml-2" size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FlightSelection;
