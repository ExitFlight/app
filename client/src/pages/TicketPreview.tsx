// /home/jordan/Desktop/FlightBack/client/src/pages/TicketPreview.tsx
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Ticket, Plane } from "lucide-react";
import ProgressStepper from "@/components/ProgressStepper";
import AirlineLogo from "@/components/AirlineLogo";
import { useFlightContext } from "@/lib/context/FlightContext";
import {
  TicketWithDetails,
  ticketDeliverySchema,
  type TicketDeliveryForm,
  type ApiCreateTicketPayload,
  type ApiCreateTicketFlightDetails
} from "@shared/schema";

// Helper function to calculate boarding time for display
function calculateDisplayBoardingTime(departureTime: string): string {
  if (!departureTime || !departureTime.includes(':')) {
    console.warn("Invalid departure time for boarding calculation:", departureTime);
    return "N/A";
  }
  const parts = departureTime.split(':');
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);

  if (isNaN(hours) || isNaN(minutes)) {
    console.warn("Could not parse hours/minutes for boarding calculation:", departureTime);
    return "N/A";
  }

  const randomOffsetMinutes = Math.floor(Math.random() * (45 - 30 + 1)) + 30;

  const departureDateObj = new Date();
  departureDateObj.setHours(hours, minutes, 0, 0);
  departureDateObj.setMinutes(departureDateObj.getMinutes() - randomOffsetMinutes);

  return departureDateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

const TicketPreview = () => {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const { selectedFlight, passengerDetails, setTicketId } = useFlightContext();
  const [ticket, setTicket] = useState<TicketWithDetails | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);

  const form = useForm<TicketDeliveryForm>({
    resolver: zodResolver(ticketDeliverySchema),
    defaultValues: {
      sendEmail: true,
      downloadPdf: true,
    },
  });

  const createTicketMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFlight || !passengerDetails) {
        throw new Error("Missing flight or passenger details");
      }

      try {
        const passengerResponse = await apiRequest("POST", "/api/passengers", passengerDetails);
        const passenger = await passengerResponse.json();

        const flightDetailsForApi: ApiCreateTicketFlightDetails = {
          flightNumber: selectedFlight.flightNumber,
          airline: {
            code: selectedFlight.airline.code,
            name: selectedFlight.airline.name,
            logo: selectedFlight.airline.logo,
            region: selectedFlight.airline.region,
          },
          departure: {
            airport: selectedFlight.departure.airport,
            time: selectedFlight.departure.time,
            date: selectedFlight.departure.date,
          },
          arrival: {
            airport: selectedFlight.arrival.airport,
            time: selectedFlight.arrival.time,
            date: selectedFlight.arrival.date,
          },
          duration: selectedFlight.duration,
          // price: selectedFlight.price, // REMOVED
          class: selectedFlight.class,
        };

        const ticketPayload: ApiCreateTicketPayload = {
          passengerId: passenger.id,
          flightDetails: flightDetailsForApi,
        };

        const ticketResponse = await apiRequest("POST", "/api/tickets", ticketPayload);
        const newTicket = await ticketResponse.json();
        console.log("New ticket created on backend:", newTicket);

        const ticketDetailsResponse = await fetch(`/api/tickets/${newTicket.id}`);
        if (!ticketDetailsResponse.ok) {
          throw new Error("Failed to fetch ticket details");
        }

        return await ticketDetailsResponse.json();
      } catch (error) {
        console.error("Error creating ticket:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      setTicket(data);
      setTicketId(data.id);
      setIsCreating(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create ticket. Please try again.",
        variant: "destructive",
      });
      setIsCreating(false);
    },
  });

  useEffect(() => {
    document.title = "Preview Ticket - FlightBack";
    
    if (!selectedFlight || !passengerDetails) {
      toast({
        title: "Incomplete Information",
        description: "Please complete the previous steps first",
        variant: "destructive",
      });
      navigate("/select-flight");
      return;
    }

    if (!ticket && !isCreating) {
      setIsCreating(true);
      createTicketMutation.mutate();
    }
  }, [selectedFlight, passengerDetails, navigate, toast, createTicketMutation, ticket, isCreating]);

  const goBack = () => {
    navigate("/passenger-details");
  };

  const deliverTicketMutation = useMutation({
    mutationFn: async (data: TicketDeliveryForm) => {
       console.log("TicketPreview - passengerDetails from context:", JSON.stringify(passengerDetails, null, 2));

      if (!ticket) {
        throw new Error("No ticket to deliver");
      }
      return await apiRequest("POST", `/api/tickets/${ticket.id}/deliver`, data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Ticket delivery processed successfully",
      });
      navigate("/confirmation");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to process ticket delivery. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TicketDeliveryForm) => {
    if (data.downloadPdf && ticket) {
      window.open(`/api/tickets/${ticket.id}/pdf`, "_blank");
    }
    deliverTicketMutation.mutate(data);
  };

  if (isCreating || !ticket) {
    return (
      <div className="container mx-auto px-4 py-6 md:py-8">
        <ProgressStepper currentStep={3} />
        <div className="max-w-3xl mx-auto text-center py-8 md:py-12">
          <div className="animate-spin w-10 h-10 md:w-12 md:h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <h3 className="text-lg md:text-xl font-semibold text-foreground">Generating your ticket...</h3>
          <p className="text-muted-foreground text-sm mt-2">Please wait while we create your flight ticket.</p>
        </div>
      </div>
    );
  }

  const displayFlight = selectedFlight;
  const displayPassenger = passengerDetails;

  if (!displayFlight || !displayPassenger) {
    return (
      <div className="container mx-auto px-4 py-6 md:py-8">
        <ProgressStepper currentStep={3} />
        <div className="max-w-3xl mx-auto text-center py-8 md:py-12">
          <p className="text-lg md:text-xl font-semibold text-foreground">Loading preview data...</p>
        </div>
      </div>
    );
  }
  const displayBoardingTime = calculateDisplayBoardingTime(displayFlight.departure.time);

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <ProgressStepper currentStep={3} />
      <div className="max-w-4xl mx-auto">
        <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6 text-foreground">Preview Your Ticket</h2>
        <div className="mb-6 md:mb-8 rotate-ticket">
          <Card className="border-border bg-card boarding-pass">
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col sm:flex-row">
                <div className="flex-1 pb-6 sm:pb-0 sm:pr-6">
                  <div className="flex justify-between items-start mb-4">
                    <AirlineLogo
                      airlineLogo={displayFlight.airline.logo}
                      airlineName={displayFlight.airline.name}
                      size={40}
                    />
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Boarding Pass</p>
                      <p className="font-medium text-base md:text-lg text-primary">
                        {displayFlight.class.replace("_", " ").toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <div className="mb-4">
                    <h3 className="font-semibold text-lg md:text-xl text-foreground">
                      {displayPassenger.firstName} {displayPassenger.lastName}
                    </h3>
                    <p className="text-muted-foreground text-xs md:text-sm">Passenger</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-muted-foreground text-xs">From</p>
                      <p className="font-semibold text-foreground">{displayFlight.departure.airport.city}</p>
                      <p className="text-xs md:text-sm text-muted-foreground">{displayFlight.departure.airport.code}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">To</p>
                      <p className="font-semibold text-foreground">{displayFlight.arrival.airport.city}</p>
                      <p className="text-xs md:text-sm text-muted-foreground">{displayFlight.arrival.airport.code}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-muted-foreground text-xs">Flight</p>
                      <p className="font-medium text-foreground">{displayFlight.flightNumber}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Date</p>
                      <p className="font-semibold text-foreground">{new Date(displayFlight.departure.date).toLocaleDateString("en-US", { 
                        day: "2-digit", 
                        month: "short", 
                        year: "numeric"
                      })}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Boarding</p>
                      <p className="font-semibold text-foreground">{displayBoardingTime}</p>
                    </div>
                  </div>
                </div>
                <div className="flex-1 pt-6 sm:pt-0 sm:pl-6 border-t sm:border-t-0 border-dashed border-border sm:border-l">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="text-muted-foreground text-xs">Flight</p>
                      <p className="font-medium text-foreground">{displayFlight.flightNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-muted-foreground text-xs">Gate</p>
                      <p className="font-semibold text-foreground">{ticket.gate}</p>
                    </div>
                  </div>
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-1">
                      <div className="text-center">
                        <p className="font-semibold text-base md:text-xl text-foreground">{displayFlight.departure.time}</p>
                        <p className="text-xs md:text-sm text-muted-foreground">{displayFlight.departure.airport.code}</p>
                      </div>
                      <div className="flex-1 mx-2 md:mx-4">
                        <div className="flex items-center">
                          <div className="h-0.5 flex-1 bg-muted relative">
                            <div className="absolute -top-1.5 right-1/2 transform translate-x-1/2">
                              <Plane className="text-primary" size={14} />
                            </div>
                          </div>
                        </div>
                        <div className="text-center text-muted-foreground text-xs mt-1">{displayFlight.duration}</div>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-base md:text-xl text-foreground">{displayFlight.arrival.time}</p>
                        <p className="text-xs md:text-sm text-muted-foreground">{displayFlight.arrival.airport.code}</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-muted-foreground text-xs">Seat</p>
                      <p className="font-semibold text-base md:text-lg text-foreground">{ticket.seatNumber}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Class</p>
                      <p className="font-semibold text-base md:text-lg text-foreground">{displayFlight.class}</p>
                    </div>
                  </div>
                  <div className="text-center mt-4">
                    <div 
                      className="h-10 md:h-12 mx-auto mb-2 bg-muted-foreground" 
                      style={{ 
                        backgroundImage: "repeating-linear-gradient(90deg, rgba(255,255,255,0.3), rgba(255,255,255,0.3) 2px, transparent 2px, transparent 5px)" 
                      }}
                    ></div>
                    <p className="font-mono text-xs text-muted-foreground">{ticket.bookingReference}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <Card className="mb-6 md:mb-8 border-border bg-card">
          <CardContent className="p-4 md:p-6">
            <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-foreground">Delivery Options</h3>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="sendEmail"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="font-medium text-foreground">Email the ticket</FormLabel>
                        <FormDescription className="text-xs text-muted-foreground">
                          Receive your ticket at {displayPassenger.email}
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="downloadPdf"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="font-medium text-foreground">Download as PDF</FormLabel>
                        <FormDescription className="text-xs text-muted-foreground">
                          Save your ticket to your device
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                <div className="mt-6 md:mt-8 flex flex-col md:flex-row justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    className="mb-3 md:mb-0 bg-background border-border text-foreground"
                    onClick={goBack}
                  >
                    <ArrowLeft className="mr-2" size={16} />
                    Back to Details
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-accent hover:bg-accent/90 text-accent-foreground"
                    disabled={deliverTicketMutation.isPending}
                  >
                    {deliverTicketMutation.isPending ? (
                      <>Processing...</>
                    ) : (
                      <>
                    Confirm & Proceed
                        <Ticket className="ml-2" size={16} />
                      </>
                    )}
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

export default TicketPreview;
