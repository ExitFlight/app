import { useState } from 'react';
import { useLocation } from 'wouter';
import { useMutation, useQuery } from '@tanstack/react-query';
import ProgressTracker from '@/components/ProgressTracker';
import FlightCard from '@/components/FlightCard';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AlertCircle, Plane } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Define the form schema
const searchFormSchema = z.object({
  departureAirportCode: z.string().min(3, "Please select a departure airport"),
  arrivalAirportCode: z.string().min(3, "Please select an arrival airport").refine(
    (val, ctx) => {
      if (ctx.data && val === ctx.data.departureAirportCode) {
        return false;
      }
      return true;
    },
    {
      message: "Departure and arrival airports cannot be the same",
    }
  ),
  departureDate: z.string().min(1, "Please select a departure date"),
});

type SearchFormValues = z.infer<typeof searchFormSchema>;

export default function FlightSelection() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [flights, setFlights] = useState<any[]>([]);
  const [selectedFlightId, setSelectedFlightId] = useState<number | null>(null);

  // Fetch airports
  const { data: airports, isLoading: isLoadingAirports } = useQuery({
    queryKey: ['/api/airports'],
  });

  // Setup form
  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      departureAirportCode: '',
      arrivalAirportCode: '',
      departureDate: new Date().toISOString().split('T')[0], // Default to today
    },
  });

  // Search flights mutation
  const searchMutation = useMutation({
    mutationFn: async (data: SearchFormValues) => {
      const res = await apiRequest('POST', '/api/flights/search', data);
      return res.json();
    },
    onSuccess: (data) => {
      setFlights(data);
      if (data.length === 0) {
        toast({
          title: "No flights found",
          description: "Try different airports or dates",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error searching flights",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SearchFormValues) => {
    // Reset selected flight when search criteria changes
    setSelectedFlightId(null);
    searchMutation.mutate(data);
  };

  const handleFlightSelect = (flightId: number) => {
    setSelectedFlightId(flightId);
  };

  const handleContinue = () => {
    if (selectedFlightId) {
      setLocation(`/passenger-details/${selectedFlightId}`);
    } else {
      toast({
        title: "No flight selected",
        description: "Please select a flight to continue",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <section className="mb-12">
        <div className="relative rounded-xl overflow-hidden shadow-lg h-64 sm:h-80 md:h-96 mb-6">
          <img 
            src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=600&q=80" 
            alt="Airplane flying above clouds" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary-900/80 to-primary-800/60 flex flex-col justify-center px-6 sm:px-12">
            <h2 className="font-heading text-white text-2xl sm:text-3xl md:text-4xl font-bold mb-4 max-w-2xl">
              Generate realistic flight tickets for your school project
            </h2>
            <p className="text-white text-sm sm:text-base md:text-lg max-w-xl">
              Select your details, generate a PDF, and receive it via email in seconds
            </p>
          </div>
        </div>
      </section>

      {/* Progress Tracker */}
      <ProgressTracker currentStep={1} />

      {/* Flight Search Form */}
      <section className="mb-12">
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="font-heading text-2xl font-semibold text-primary-800 mb-6">Select Your Flight</h2>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="departureAirportCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Departure Airport</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        disabled={isLoadingAirports}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full py-3">
                            <SelectValue placeholder="Select departure airport" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {airports?.map((airport: any) => (
                            <SelectItem key={airport.code} value={airport.code}>
                              {airport.city} ({airport.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="arrivalAirportCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Arrival Airport</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        disabled={isLoadingAirports}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full py-3">
                            <SelectValue placeholder="Select arrival airport" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {airports?.map((airport: any) => (
                            <SelectItem key={airport.code} value={airport.code}>
                              {airport.city} ({airport.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="departureDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Departure Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        className="py-3"
                        min={new Date().toISOString().split('T')[0]}
                        max={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full md:w-auto"
                disabled={searchMutation.isPending}
              >
                <Plane className="mr-2 h-4 w-4" />
                Search Flights
              </Button>
            </form>
          </Form>
        </div>
        
        {/* Available Flights */}
        {searchMutation.isPending ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-700"></div>
          </div>
        ) : (
          <>
            {flights.length > 0 && (
              <>
                <h3 className="font-heading text-xl font-semibold text-primary-800 mb-4">Available Flights</h3>
                
                {flights.map((flight) => (
                  <FlightCard
                    key={flight.id}
                    flight={flight}
                    isSelected={selectedFlightId === flight.id}
                    onSelect={() => handleFlightSelect(flight.id)}
                  />
                ))}
                
                <div className="flex justify-end mt-6">
                  <Button 
                    onClick={handleContinue}
                    disabled={!selectedFlightId}
                    className="bg-primary-600 hover:bg-primary-700"
                  >
                    Continue
                  </Button>
                </div>
              </>
            )}
            
            {searchMutation.isSuccess && flights.length === 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No flights found</AlertTitle>
                <AlertDescription>
                  Try selecting different departure and arrival airports, or a different date.
                </AlertDescription>
              </Alert>
            )}
          </>
        )}
      </section>
    </div>
  );
}
