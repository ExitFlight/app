import { useState } from "react";
import { determineFlightPath, formatFlightPath, calculateArrivalTime } from "@/lib/layoverLogic";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ChevronRight, Plane } from "lucide-react";

export default function LayoverTester() {
  const [originCode, setOriginCode] = useState("LHR");
  const [destCode, setDestCode] = useState("JFK");
  const [airlineCode, setAirlineCode] = useState("BA");
  const [durationMinutes, setDurationMinutes] = useState(420); // 7 hours by default
  const [result, setResult] = useState<ReturnType<typeof determineFlightPath> | null>(null);

  const calculateLayovers = () => {
    const flightPath = determineFlightPath(
      originCode.toUpperCase(),
      destCode.toUpperCase(),
      airlineCode.toUpperCase(),
      durationMinutes
    );
    setResult(flightPath);
  };

  // Using fixed date for demonstration purposes
  const departureDate = new Date();
  
  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h2 className="text-2xl font-bold mb-6">Layover Logic Testing</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Flight Details</CardTitle>
            <CardDescription>Enter flight details to test the layover logic</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="originCode">Origin Airport</Label>
                  <Input
                    id="originCode"
                    placeholder="e.g. LHR"
                    value={originCode}
                    onChange={(e) => setOriginCode(e.target.value)}
                    className="uppercase"
                    maxLength={3}
                  />
                </div>
                <div>
                  <Label htmlFor="destCode">Destination Airport</Label>
                  <Input
                    id="destCode"
                    placeholder="e.g. JFK"
                    value={destCode}
                    onChange={(e) => setDestCode(e.target.value)}
                    className="uppercase"
                    maxLength={3}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="airlineCode">Airline Code</Label>
                <Input
                  id="airlineCode"
                  placeholder="e.g. BA"
                  value={airlineCode}
                  onChange={(e) => setAirlineCode(e.target.value)}
                  className="uppercase"
                  maxLength={2}
                />
              </div>
              
              <div>
                <Label htmlFor="durationMinutes">Flight Duration (minutes)</Label>
                <Input
                  id="durationMinutes"
                  type="number"
                  placeholder="e.g. 420"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={calculateLayovers} className="w-full">
              Calculate Flight Path
            </Button>
          </CardFooter>
        </Card>
        
        {result && (
          <Card>
            <CardHeader>
              <CardTitle>Flight Path Result</CardTitle>
              <CardDescription>
                {result.requiresLayover 
                  ? "This flight requires a layover" 
                  : "This is a direct flight"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-1">Flight Path:</p>
                  <p className="text-lg">{formatFlightPath(result)}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-1">Total Duration:</p>
                  <p>
                    {Math.floor(result.totalDurationMinutes / 60)}h {result.totalDurationMinutes % 60}m
                    {result.requiresLayover && result.layoverDurationMinutes && (
                      <span className="text-muted-foreground ml-2 text-sm">
                        (includes {Math.floor(result.layoverDurationMinutes / 60)}h {result.layoverDurationMinutes % 60}m layover)
                      </span>
                    )}
                  </p>
                </div>
                
                <div className="pt-2">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
                    <p>Departure:</p>
                    <p>{departureDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  
                  <div className="flex items-center">
                    {result.segments.map((segment, index) => (
                      <div key={index} className="flex items-center">
                        <div className="flex flex-col items-center">
                          <span className="font-medium">{segment.origin}</span>
                          <Plane className="text-primary h-6 w-6 my-2" />
                          <span className="text-xs">{Math.floor(segment.durationMinutes / 60)}h {segment.durationMinutes % 60}m</span>
                        </div>
                        
                        {/* Display layover if not the last segment */}
                        {index < result.segments.length - 1 && result.layoverDurationMinutes && (
                          <div className="mx-2 px-3 py-1 bg-muted rounded-full text-xs">
                            {Math.floor(result.layoverDurationMinutes / 60)}h {result.layoverDurationMinutes % 60}m
                          </div>
                        )}
                        
                        {/* Add arrow if not the last segment */}
                        {index < result.segments.length - 1 ? (
                          <ChevronRight className="mx-2 h-4 w-4 text-muted-foreground" />
                        ) : (
                          <div className="flex flex-col items-center ml-2">
                            <span className="font-medium">{segment.destination}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-2">
                    <p>Arrival:</p>
                    <p>{calculateArrivalTime(departureDate, result).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      <div className="bg-muted p-4 rounded-lg">
        <h3 className="font-medium mb-2">Testing Suggestions:</h3>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>Try <span className="font-mono bg-background px-1 rounded">SYD-LHR</span> (Sydney to London) - should always have a layover</li>
          <li>Try <span className="font-mono bg-background px-1 rounded">JFK-LAX</span> (New York to Los Angeles) - should be direct</li>
          <li>Try higher duration values (e.g., 900 minutes) to trigger the long-haul threshold</li>
          <li>Try airline codes like <span className="font-mono bg-background px-1 rounded">EK</span> (Emirates) which route through their hub (DXB)</li>
        </ul>
      </div>
    </div>
  );
}