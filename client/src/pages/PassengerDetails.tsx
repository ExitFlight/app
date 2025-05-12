import { useEffect } from 'react';
import { useLocation, useParams } from 'wouter';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import ProgressTracker from '@/components/ProgressTracker';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Define form schema
const passengerDetailsSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  passportNumber: z.string().min(1, "Passport/ID number is required"),
  seatPreference: z.string().optional(),
  specialRequests: z.string().optional(),
});

type PassengerDetailsFormValues = z.infer<typeof passengerDetailsSchema>;

export default function PassengerDetails() {
  const params = useParams<{ flightId: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const flightId = parseInt(params.flightId, 10);

  // Fetch flight details
  const { data: flight, isLoading, isError } = useQuery({
    queryKey: [`/api/flights/${flightId}`],
    enabled: !isNaN(flightId),
  });

  // Setup form
  const form = useForm<PassengerDetailsFormValues>({
    resolver: zodResolver(passengerDetailsSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      passportNumber: '',
      seatPreference: 'no_preference',
      specialRequests: '',
    },
  });

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: async (data: PassengerDetailsFormValues) => {
      const res = await apiRequest('POST', '/api/bookings', {
        ...data,
        flightId,
      });
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Passenger details saved",
        description: "Proceeding to ticket review",
      });
      setLocation(`/review/${data.id}`);
    },
    onError: (error) => {
      toast({
        title: "Error saving passenger details",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PassengerDetailsFormValues) => {
    createBookingMutation.mutate(data);
  };

  const handleBack = () => {
    setLocation('/flight-selection');
  };

  // Redirect if invalid flight ID
  useEffect(() => {
    if (isNaN(flightId)) {
      toast({
        title: "Invalid flight selection",
        description: "Please select a flight first",
        variant: "destructive",
      });
      setLocation('/flight-selection');
    }
  }, [flightId, setLocation, toast]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProgressTracker currentStep={2} />
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-700"></div>
        </div>
      </div>
    );
  }

  if (isError || !flight) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProgressTracker currentStep={2} />
        <Alert variant="destructive" className="my-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading flight</AlertTitle>
          <AlertDescription>
            We couldn't load the flight details. Please go back and try again.
          </AlertDescription>
        </Alert>
        <div className="flex justify-start mt-6">
          <Button onClick={handleBack} variant="outline">
            Back to Flight Selection
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Progress Tracker */}
      <ProgressTracker currentStep={2} />

      {/* Selected Flight Summary */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <h3 className="font-heading text-lg font-semibold text-primary-800 mb-4">Selected Flight</h3>
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Airline</p>
              <p className="font-semibold">{flight.airline.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Flight</p>
              <p className="font-semibold">{flight.flightNumber}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Route</p>
              <p className="font-semibold">{flight.departureAirportCode} → {flight.arrivalAirportCode}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Date</p>
              <p className="font-semibold">{new Date(form.getValues().departureDate || Date.now()).toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Passenger Details Form */}
      <section className="mb-12">
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="font-heading text-2xl font-semibold text-primary-800 mb-6">Passenger Details</h2>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter first name" className="py-3" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter last name" className="py-3" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="Your email address for ticket delivery" 
                        className="py-3" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="passportNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Passport/ID Number</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="For identification only" 
                          className="py-3" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="seatPreference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Seat Preference</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="py-3">
                            <SelectValue placeholder="Select seat preference" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="window">Window</SelectItem>
                          <SelectItem value="aisle">Aisle</SelectItem>
                          <SelectItem value="middle">Middle</SelectItem>
                          <SelectItem value="no_preference">No Preference</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="specialRequests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Special Requests (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Any special needs or requests" 
                        className="resize-none h-24" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-between pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleBack}
                >
                  Back
                </Button>
                
                <Button 
                  type="submit"
                  disabled={createBookingMutation.isPending}
                >
                  {createBookingMutation.isPending ? 'Saving...' : 'Continue'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </section>
    </div>
  );
}
