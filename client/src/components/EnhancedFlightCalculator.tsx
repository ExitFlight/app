import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDistance } from "@/lib/utils";
import { calculateEnhancedFlightDetails } from "@/lib/enhancedFlightCalculator";
import { format } from "date-fns";
import { Plane, Calendar, Clock, Repeat, ArrowRight, MapPin } from "lucide-react";
import { useLocation } from "wouter"; // Import useLocation for navigation

// Major international airports by region
const majorAirports = {
  "North America": [
    { code: "JFK", name: "New York JFK" },
    { code: "LAX", name: "Los Angeles" },
    { code: "ORD", name: "Chicago O'Hare" },
    { code: "DFW", name: "Dallas/Fort Worth" },
    { code: "MIA", name: "Miami" },
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
    { code: "GRU", name: "São Paulo" },
    { code: "EZE", name: "Buenos Aires" },
    { code: "BOG", name: "Bogotá" },
    { code: "SCL", name: "Santiago" },
    { code: "LIM", name: "Lima" }
  ],
  "Africa": [
    { code: "JNB", name: "Johannesburg" },
    { code: "CPT", name: "Cape Town" },
    { code: "CAI", name: "Cairo" },
    { code: "NBO", name: "Nairobi" },
    { code: "LOS", name: "Lagos" },
    { code: "ACC", name: "Accra" }
  ]
};

// Flatten airport list for easy selection
const allAirports = Object.values(majorAirports).flat().sort((a, b) => a.code.localeCompare(b.code));

// Generate time options in 5-minute increments, 24-hour format
const generateTimeOptions = () => {
  const times = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 5) {
      const formattedHour = hour.toString().padStart(2, '0');
      const formattedMinute = minute.toString().padStart(2, '0');
      times.push(`${formattedHour}:${formattedMinute}`);
    }
  }
  return times;
};

const timeOptions = generateTimeOptions();

// For date selection (limit to next 365 days)
const generateDateOptions = () => {
  const dates = [];
  const today = new Date();
  
  for (let i = 0; i < 365; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push({
      value: format(date, 'yyyy-MM-dd'),
      label: format(date, 'EEE, MMM d, yyyy')
    });
  }
  
  return dates;
};

const dateOptions = generateDateOptions();

const EnhancedFlightCalculator = () => {
  const [originCode, setOriginCode] = useState<string>("");
  const [destCode, setDestCode] = useState<string>("");
  const [departureDate, setDepartureDate] = useState<string>(dateOptions[0].value);
  const [departureTime, setDepartureTime] = useState<string>("09:00");
  const [flightDetails, setFlightDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [, navigate] = useLocation(); // For navigation

  // Calculate flight details
  const handleCalculateFlightDetails = async () => {
    if (!originCode || !destCode) {
      setError("Please select origin and destination airports");
      return;
    }

    if (originCode === destCode) {
      setError("Origin and destination airports cannot be the same");
      return;
    }

    setIsLoading(true);
    setError("");
    setFlightDetails(null);

    try {
      const details = await calculateEnhancedFlightDetails(
        originCode,
        destCode,
        departureDate,
        departureTime
      );
      setFlightDetails(details);
    } catch (error) {
      console.error("Error calculating flight details:", error);
      setError(`Failed to calculate flight details: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear the selections
  const handleClear = () => {
    setOriginCode("");
    setDestCode("");
    setDepartureDate(dateOptions[0].value);
    setDepartureTime("09:00");
    setFlightDetails(null);
    setError("");
  };

  const handleGoToPassengerDetails = () => {
    if (flightDetails) {
      // Here you would typically pass the flightDetails to the next page,
      // e.g., via state management ( Zustand, Redux, Context) or query params / route state.
      navigate("/passenger-details"); // Navigate to the passenger details page
    }
  };
  // Get airport name from code
  const getAirportName = (code: string): string => {
    const airport = allAirports.find(airport => airport.code === code);
    return airport ? airport.name : code;
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
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Enhanced Flight Calculator</CardTitle>
            <CardDescription>
              Calculate realistic flight times using the Haversine formula
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Origin Airport */}
              <div>
                <Label htmlFor="originCode">Origin Airport</Label>
                <Select value={originCode} onValueChange={setOriginCode}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select origin airport" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(majorAirports).map(([region, airports]) => (
                      <div key={region}>
                        <div className="text-xs text-muted-foreground py-1.5 px-2 font-medium">
                          {region}
                        </div>
                        {airports.map(airport => (
                          <SelectItem key={airport.code} value={airport.code}>
                            {airport.code} - {airport.name}
                          </SelectItem>
                        ))}
                        {region !== "Africa" && <Separator className="my-1" />}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Destination Airport */}
              <div>
                <Label htmlFor="destCode">Destination Airport</Label>
                <Select value={destCode} onValueChange={setDestCode}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination airport" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(majorAirports).map(([region, airports]) => (
                      <div key={region}>
                        <div className="text-xs text-muted-foreground py-1.5 px-2 font-medium">
                          {region}
                        </div>
                        {airports.map(airport => (
                          <SelectItem key={airport.code} value={airport.code}>
                            {airport.code} - {airport.name}
                          </SelectItem>
                        ))}
                        {region !== "Africa" && <Separator className="my-1" />}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Departure Date */}
              <div>
                <Label htmlFor="departureDate">Departure Date</Label>
                <Select value={departureDate} onValueChange={setDepartureDate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select departure date" />
                  </SelectTrigger>
                  <SelectContent>
                    {dateOptions.map(date => (
                      <SelectItem key={date.value} value={date.value}>
                        {date.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Departure Time */}
              <div>
                <Label htmlFor="departureTime">Departure Time (24h)</Label>
                <Select value={departureTime} onValueChange={setDepartureTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select departure time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map(time => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2 pt-4">
                <Button
                  onClick={handleCalculateFlightDetails}
                  disabled={!originCode || !destCode || isLoading || !!flightDetails} // Disable if already calculated
                >
                  {isLoading ? "Calculating..." : flightDetails ? "Flight Details Generated" : "Generate Flight Preview"}
                </Button>
                <Button variant="outline" onClick={handleClear}>
                  Clear
                </Button>
                {flightDetails && !isLoading && (
                  <Button
                    onClick={handleGoToPassengerDetails}
                    variant="default"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Go to Passenger Details
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="text-red-500 text-sm mt-2">{error}</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Flight Details</CardTitle>
            {flightDetails && (
              <div className="flex flex-col gap-1">
                <div className="text-sm text-muted-foreground">
                  <MapPin className="inline-block h-4 w-4 mr-1" />
                  Distance: <Badge variant="outline">{formatDistance(flightDetails.distanceKm)}</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  <Clock className="inline-block h-4 w-4 mr-1" />
                  Flight Duration: <Badge variant="outline" className="bg-primary/10 font-medium">{flightDetails.durationFormatted}</Badge>
                </div>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : flightDetails ? (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div className="text-center">
                    <div className="text-3xl font-bold">{originCode}</div>
                    <div className="text-sm font-medium">{getAirportName(originCode)}</div>
                    <div className="text-xs text-muted-foreground">{getAirportRegion(originCode)}</div>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div className="text-xs text-muted-foreground mb-1">{flightDetails.durationFormatted}</div>
                    <div className="relative">
                      <div className="w-32 h-0.5 bg-primary"></div>
                      <Plane className="absolute -top-2 left-1/2 transform -translate-x-1/2 h-4 w-4 text-primary" />
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{formatDistance(flightDetails.distanceKm)}</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold">{destCode}</div>
                    <div className="text-sm font-medium">{getAirportName(destCode)}</div>
                    <div className="text-xs text-muted-foreground">{getAirportRegion(destCode)}</div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Departure */}
                  <div className="space-y-3">
                    <div className="text-sm font-medium flex items-center gap-1">
                      <Calendar className="h-4 w-4" /> Departure
                    </div>
                    <div className="border rounded-lg p-3 bg-muted/20">
                      <div className="text-2xl font-bold">{flightDetails.departureTimeLocal}</div>
                      <div className="text-sm">{flightDetails.departureDateLocal}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Local time in {getAirportName(originCode)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Arrival */}
                  <div className="space-y-3">
                    <div className="text-sm font-medium flex items-center gap-1">
                      <Calendar className="h-4 w-4" /> Arrival
                    </div>
                    <div className="border rounded-lg p-3 bg-muted/20">
                      <div className="text-2xl font-bold">{flightDetails.arrivalTimeLocal}</div>
                      <div className="text-sm">
                        {flightDetails.arrivalDateLocal}
                        {flightDetails.departureDateLocal !== flightDetails.arrivalDateLocal && (
                          <span className="ml-1 text-xs text-primary">
                            {flightDetails.departureDateLocal < flightDetails.arrivalDateLocal ? '+1' : '-1'}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Local time in {getAirportName(destCode)}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-2 border-t">
                  <div className="text-xs text-muted-foreground">
                    <div className="mb-1">• Flight times calculated based on great-circle distance using the Haversine formula</div>
                    <div className="mb-1">• Includes buffer time for taxiing, takeoff, landing, and routing contingency</div>
                    <div>• All times shown in local airport time zones</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground h-64 flex flex-col justify-center">
                <p>No flight details calculated yet.</p>
                <p className="text-sm">Select origin and destination airports, then click "Calculate Flight Time".</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EnhancedFlightCalculator;