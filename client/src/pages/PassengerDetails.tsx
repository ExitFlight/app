import { useEffect } from "react";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ArrowRight } from "lucide-react";
import ProgressStepper from "@/components/ProgressStepper";
import { useFlightContext } from "@/lib/context/FlightContext";
import { passengerDetailsSchema, type PassengerDetailsForm } from "@shared/schema";

const nationalities = [
  { value: "us", label: "United States" },
  { value: "ca", label: "Canada" },
  { value: "uk", label: "United Kingdom" },
  { value: "fr", label: "France" },
  { value: "de", label: "Germany" },
  { value: "au", label: "Australia" },
  { value: "es", label: "Spain" },
  { value: "it", label: "Italy" },
  { value: "jp", label: "Japan" },
  { value: "br", label: "Brazil" },
];

const PassengerDetails = () => {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const { selectedFlight, passengerDetails, setPassengerDetails } = useFlightContext();

  const form = useForm<PassengerDetailsForm>({
    resolver: zodResolver(passengerDetailsSchema),
    defaultValues: {
      firstName: passengerDetails?.firstName || "",
      lastName: passengerDetails?.lastName || "",
      email: passengerDetails?.email || "",
      phone: passengerDetails?.phone || "",
      passportNumber: passengerDetails?.passportNumber || "",
      nationality: passengerDetails?.nationality || "",
      birthdate: passengerDetails?.birthdate || "",
    },
  });

  useEffect(() => {
    document.title = "Passenger Details - FlightBack";
    
    if (!selectedFlight) {
      toast({
        title: "No flight selected",
        description: "Please select a flight first",
        variant: "destructive",
      });
      navigate("/select-flight");
    }
  }, [selectedFlight, navigate, toast]);
  
  const goBack = () => {
    navigate("/select-flight");
  };

  const onSubmit = async (data: PassengerDetailsForm) => {
    try {
      // Save passenger details to context
      setPassengerDetails(data);
      
      // Create passenger in database
      const response = await apiRequest("POST", "/api/passengers", data);
      const passenger = await response.json();
      
      // Navigate to preview with passenger ID
      navigate("/preview");
    } catch (error) {
      console.error("Failed to save passenger details:", error);
      toast({
        title: "Error",
        description: "Failed to save passenger details. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <ProgressStepper currentStep={2} />

      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6 text-neutral-800">Passenger Details</h2>
        
        <Card className="mb-8">
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-neutral-700 font-medium">First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} className="w-full p-3" />
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
                        <FormLabel className="text-neutral-700 font-medium">Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} className="w-full p-3" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-neutral-700 font-medium">Email Address</FormLabel>
                        <FormControl>
                          <Input placeholder="your@email.com" {...field} className="w-full p-3" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-neutral-700 font-medium">Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 (555) 123-4567" {...field} className="w-full p-3" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="passportNumber"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="text-neutral-700 font-medium">Passport/ID Number</FormLabel>
                        <FormControl>
                          <Input placeholder="A1234567" {...field} className="w-full p-3" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="nationality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-neutral-700 font-medium">Nationality</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select nationality" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {nationalities.map((nationality) => (
                              <SelectItem key={nationality.value} value={nationality.value}>
                                {nationality.label}
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
                    name="birthdate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-neutral-700 font-medium">Date of Birth</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            className="w-full p-3"
                            max={new Date().toISOString().split('T')[0]}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="mt-8 flex flex-col md:flex-row justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    className="mb-4 md:mb-0"
                    onClick={goBack}
                  >
                    <ArrowLeft className="mr-2" size={16} />
                    Back to Flights
                  </Button>
                  
                  <Button type="submit">
                    Continue to Preview
                    <ArrowRight className="ml-2" size={16} />
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PassengerDetails;
