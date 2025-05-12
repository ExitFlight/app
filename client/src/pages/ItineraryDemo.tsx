import { useEffect } from "react";
import FlightItineraryDemo from "@/components/FlightItineraryDemo";

export default function ItineraryDemo() {
  useEffect(() => {
    document.title = "Flight Itinerary Demo - FlightBack";
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Flight Itinerary Generator</h1>
        <p className="text-muted-foreground">
          Generate realistic flight itineraries with proper time zone calculations
        </p>
      </div>
      
      <FlightItineraryDemo />
      
      <div className="mt-10 text-sm text-center text-muted-foreground">
        <p>
          This demo shows how the flight itinerary calculator works with timezone calculations.
          Select an origin and destination to see available airlines, then generate a realistic itinerary.
        </p>
      </div>
    </div>
  );
}