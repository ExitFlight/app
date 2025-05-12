import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { 
  filterAirlinesForRoute, 
  generateFlightItinerary, 
  formatItineraryForPreview,
  FlightSegment
} from "@/lib/flightItinerary";

const popularOrigins = [
  "New York",
  "London",
  "Paris",
  "Tokyo",
  "Sydney",
  "Singapore",
  "Dubai",
  "Hong Kong"
];

const popularDestinations = [
  "New York",
  "London",
  "Paris",
  "Tokyo",
  "Sydney",
  "Singapore",
  "Dubai",
  "Hong Kong"
];

const FlightItineraryDemo = () => {
  const [originCity, setOriginCity] = useState<string>("");
  const [destinationCity, setDestinationCity] = useState<string>("");
  const [customOrigin, setCustomOrigin] = useState<string>("");
  const [customDestination, setCustomDestination] = useState<string>("");
  const [availableAirlines, setAvailableAirlines] = useState<string[]>([]);
  const [selectedAirline, setSelectedAirline] = useState<string>("");
  const [itinerarySegments, setItinerarySegments] = useState<FlightSegment[]>([]);
  const [formattedItinerary, setFormattedItinerary] = useState<string>("");
  const [totalTravelTime, setTotalTravelTime] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Update available airlines when origin or destination changes
  useEffect(() => {
    const updateAirlines = async () => {
      if (originCity && destinationCity) {
        try {
          const airlines = filterAirlinesForRoute(originCity, destinationCity);
          setAvailableAirlines(airlines);
          
          // Clear the selected airline if it's not available for the new route
          if (selectedAirline && !airlines.includes(selectedAirline)) {
            setSelectedAirline("");
          }
        } catch (error) {
          console.error("Error filtering airlines:", error);
          setError("Failed to find airlines for this route");
          setAvailableAirlines([]);
        }
      } else {
        setAvailableAirlines([]);
      }
    };

    updateAirlines();
  }, [originCity, destinationCity]);

  // Handle city selection or custom input
  const handleOriginChange = (value: string) => {
    if (value === "custom") {
      setOriginCity(customOrigin);
    } else {
      setOriginCity(value);
      setCustomOrigin("");
    }
  };

  const handleDestinationChange = (value: string) => {
    if (value === "custom") {
      setDestinationCity(customDestination);
    } else {
      setDestinationCity(value);
      setCustomDestination("");
    }
  };

  // Handle custom city input
  const handleCustomOriginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomOrigin(e.target.value);
    setOriginCity(e.target.value);
  };

  const handleCustomDestinationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomDestination(e.target.value);
    setDestinationCity(e.target.value);
  };

  // Generate the itinerary
  const handleGenerateItinerary = async () => {
    if (!originCity || !destinationCity || !selectedAirline) {
      setError("Please select origin, destination, and airline");
      return;
    }

    setIsLoading(true);
    setError("");
    setItinerarySegments([]);
    setFormattedItinerary("");
    setTotalTravelTime("");

    try {
      // Generate the itinerary
      const segments = await generateFlightItinerary(originCity, destinationCity, selectedAirline);
      setItinerarySegments(segments);

      // Format the itinerary for display
      const formatted = formatItineraryForPreview(segments);
      setFormattedItinerary(formatted.formattedString);
      setTotalTravelTime(formatted.totalTravelTime);
    } catch (error) {
      console.error("Error generating itinerary:", error);
      setError(`Failed to generate itinerary: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear the form
  const handleClear = () => {
    setOriginCity("");
    setDestinationCity("");
    setCustomOrigin("");
    setCustomDestination("");
    setSelectedAirline("");
    setItinerarySegments([]);
    setFormattedItinerary("");
    setTotalTravelTime("");
    setError("");
  };

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle>Flight Itinerary Generator</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Origin City */}
              <div>
                <Label htmlFor="originCity">Origin City</Label>
                <Select value={originCity} onValueChange={handleOriginChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select origin city" />
                  </SelectTrigger>
                  <SelectContent>
                    {popularOrigins.map((city) => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
                {originCity === "custom" && (
                  <Input
                    id="customOrigin"
                    placeholder="Enter city name"
                    className="mt-2"
                    value={customOrigin}
                    onChange={handleCustomOriginChange}
                  />
                )}
              </div>

              {/* Destination City */}
              <div>
                <Label htmlFor="destinationCity">Destination City</Label>
                <Select value={destinationCity} onValueChange={handleDestinationChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination city" />
                  </SelectTrigger>
                  <SelectContent>
                    {popularDestinations.map((city) => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
                {destinationCity === "custom" && (
                  <Input
                    id="customDestination"
                    placeholder="Enter city name"
                    className="mt-2"
                    value={customDestination}
                    onChange={handleCustomDestinationChange}
                  />
                )}
              </div>

              {/* Airline Selection */}
              {availableAirlines.length > 0 && (
                <div>
                  <Label htmlFor="airline">Airline</Label>
                  <Select value={selectedAirline} onValueChange={setSelectedAirline}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select airline" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableAirlines.map((airline) => (
                        <SelectItem key={airline} value={airline}>{airline}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-2 pt-4">
                <Button
                  onClick={handleGenerateItinerary}
                  disabled={!originCity || !destinationCity || !selectedAirline || isLoading}
                >
                  {isLoading ? "Generating..." : "Generate Itinerary"}
                </Button>
                <Button variant="outline" onClick={handleClear}>
                  Clear
                </Button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="text-red-500 text-sm mt-2">{error}</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Itinerary Display */}
        <Card>
          <CardHeader>
            <CardTitle>Flight Itinerary</CardTitle>
            {totalTravelTime && (
              <div className="text-sm text-muted-foreground">
                Total Travel Time: <Badge variant="outline">{totalTravelTime}</Badge>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : formattedItinerary ? (
              <div className="whitespace-pre-line">{formattedItinerary}</div>
            ) : (
              <div className="text-center text-muted-foreground h-64 flex flex-col justify-center">
                <p>No itinerary generated yet.</p>
                <p className="text-sm">Select origin, destination, and airline to generate an itinerary.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FlightItineraryDemo;