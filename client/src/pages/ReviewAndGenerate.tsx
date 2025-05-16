import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import ProgressTracker from '@/components/ProgressTracker';
import TicketPreview from '@/components/TicketPreview';
import SuccessModal from '@/components/SuccessModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Ticket } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useFlightContext } from '@/lib/context/FlightContext';
import { TicketWithDetails } from '@shared/schema';

export default function ReviewAndGenerate() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { selectedFlight, passengerDetails, setTicketId, resetFlightContext } = useFlightContext();

  const [emailDelivery, setEmailDelivery] = useState(true);
  const [pdfDownload, setPdfDownload] = useState(true);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [ticketPdfUrl, setTicketPdfUrl] = useState("");

  // Fetch booking details
  const { data: booking, isLoading: isLoadingBooking, isError: isBookingError } = useQuery({
    // This query is no longer needed in the new booking flow
    queryKey: ['unused-booking-query'],
    enabled: false, // Disable this query
  });

  // State to hold the generated ticket details
  const [ticket, setTicket] = useState<TicketWithDetails | null>(null);
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);

  // Mutation to create the passenger and the ticket
  const createTicketMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFlight || !passengerDetails) {
        // This case should be caught by the useEffect guard, but good defensive check
        throw new Error("Missing flight or passenger details in context");
      }

      setIsCreatingTicket(true);

      try {
        // 1. Create the passenger using data from context
        const passengerResponse = await apiRequest("POST", "/api/passengers", passengerDetails);
        const passenger = await passengerResponse.json();

        // 2. Create the ticket using the selected flight from context and the new passenger ID
        const ticketCreationData = {
          flightId: selectedFlight.id,
          passengerId: passenger.id,
          // Server should generate seatNumber, bookingReference, gate, boardingTime
        };

        const ticketResponse = await apiRequest("POST", "/api/tickets", ticketCreationData);
        const newTicket = await ticketResponse.json();

        // 3. Fetch the complete ticket details (including generated fields)
        const ticketDetailsResponse = await fetch(`/api/tickets/${newTicket.id}`);
        if (!ticketDetailsResponse.ok) {
          throw new Error("Failed to fetch generated ticket details");
        }
        const completeTicket: TicketWithDetails = await ticketDetailsResponse.json();

        return completeTicket;
      } catch (error) {
        console.error("Error creating ticket:", error);
        throw error; // Re-throw to be caught by onError
      } finally {
        setIsCreatingTicket(false);
      }
    },
    onSuccess: (data) => {
      setTicket(data); // Store the complete ticket details
      setTicketId(data.id); // Save ticket ID to context

      // Automatically trigger download if requested
      if (pdfDownload) {
         // Use the actual ticket ID for the PDF URL
        window.open(`/api/tickets/${data.id}/pdf`, "_blank");
      }

      // Show success modal regardless, maybe indicating email status
      toast({
        title: "Ticket generated successfully",
        description: emailDelivery 
          ? "Your ticket has been sent to your email" 
          : "Your ticket is ready to download",
      });
    },
    onError: (error) => {
      toast({
        title: "Error generating ticket",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  // Mutation to handle delivery options (if needed separately, e.g., just email)
  // Currently, email is handled during generation. This mutation could be for re-sending email.
  // Keeping it simple for now, assuming generation handles initial email.
  // If you need a separate "Send Email" button after generation, use this mutation.
  // const deliverTicketMutation = useMutation({
  //   mutationFn: async (data: { sendEmail: boolean }) => {
  //     if (!ticket) throw new Error("No ticket to deliver");
  //     // Assuming an endpoint like PUT /api/tickets/:id/delivery
  //     return apiRequest('PUT', `/api/tickets/${ticket.id}/delivery`, data);
  //   },
  //   onSuccess: () => {
  //     toast({ title: "Email sent", description: "Ticket emailed successfully." });
  //   },
  //   onError: (error) => {
  //     toast({ title: "Email failed", description: error.message || "Could not send email.", variant: "destructive" });
  //   }
  // });

  // Trigger ticket creation when the page loads, if data is available and ticket hasn't been created
  useEffect(() => {
    document.title = "Review & Generate - FlightBack";

    // Guard against direct access or missing data
    if (!selectedFlight || !passengerDetails) {
      toast({
        title: "Incomplete Information",
        description: "Please complete the previous steps first",
        variant: "destructive",
      });
      setLocation("/select-flight"); // Navigate back to the start
    } else if (!ticket && !isCreatingTicket && !createTicketMutation.isPending) {
       // If we have context data, but no ticket yet, and not already creating, trigger creation
      createTicketMutation.mutate();
    }
  }, [selectedFlight, passengerDetails, navigate, toast, createTicketMutation, ticket, isCreatingTicket, setLocation]); // Added setLocation to dependencies

  const handleBack = () => {
    // Navigate back to the passenger details page
    setLocation("/passenger-details");
  };

  const handleGenerateTicket = () => {
     // This function now primarily handles the delivery options after the ticket is created on load
     // If you want to trigger creation with this button instead of on load, move createTicketMutation.mutate() here

     // Check if ticket is already created
    if (!ticket) {
       // This case should ideally not happen if creation is triggered on load,
       // but as a fallback or if you change the flow to trigger creation via this button:
       if (!isCreatingTicket) {
          createTicketMutation.mutate(); // Trigger creation if not already happening
       }
       return; // Don't proceed with delivery options until ticket is created
    }

     // Handle delivery options (email is already handled during creation based on initial state)
     // If you add more delivery options or want to re-send email, use a separate mutation here.

    if (!emailDelivery && !pdfDownload) {
      toast({
        title: "Select delivery method",
        description: "Please select at least one delivery method",
        variant: "destructive",
      });
      return;
    }

    // If PDF download is selected, trigger it (it's also triggered on success of creation)
    if (pdfDownload && ticket) {
       window.open(`/api/tickets/${ticket.id}/pdf`, "_blank");
    }
  };

  if (isCreatingTicket || createTicketMutation.isPending) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProgressTracker currentStep={3} />
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-700"></div>
        </div>
      </div>
    );
  }

  if (createTicketMutation.isError || !ticket) { // Check mutation error or if ticket state is null
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProgressTracker currentStep={3} />
        <Alert variant="destructive" className="my-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading booking</AlertTitle>
          <AlertDescription>
            We couldn't load your booking details. Please go back and try again.
          </AlertDescription>
        </Alert>
        <div className="flex justify-start mt-6">
          <Button onClick={() => setLocation('/select-flight')} variant="outline"> {/* Corrected path */}
            Back to Flight Selection
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Progress Tracker */}
      <ProgressTracker currentStep={3} />

      {/* Ticket Preview */}
      <div className="mb-8">
        <h2 className="font-heading text-2xl font-semibold text-primary-800 mb-6">Review Your Flight Ticket</h2>
        <TicketPreview booking={ticket.passenger} flight={ticket.flight} /> {/* Pass data from the generated ticket */}
      </div>

      {/* Delivery Options */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <h3 className="font-heading text-xl font-semibold text-primary-800 mb-4">Delivery Options</h3>
          
          <div className="space-y-4">
             {/* Email Delivery Option */}
            <div className="flex items-start space-x-3">
              <Checkbox 
                id="emailDelivery" 
                checked={emailDelivery} 
                onCheckedChange={(checked) => setEmailDelivery(checked as boolean)} 
                disabled={isCreatingTicket || createTicketMutation.isPending} // Disable while creating
              />
              <div>
                <Label htmlFor="emailDelivery" className="text-base font-medium cursor-pointer">
                  Email Delivery
                </Label>
                <p className="text-sm text-muted-foreground">Send the ticket to my email address ({ticket.passenger.email})</p> {/* Show email from ticket data */}
              </div>
            </div>
            
             {/* PDF Download Option */}
            <div className="flex items-start space-x-3">
              <Checkbox 
                id="pdfDownload" 
                checked={pdfDownload} 
                onCheckedChange={(checked) => setPdfDownload(checked as boolean)} 
                disabled={isCreatingTicket || createTicketMutation.isPending} // Disable while creating
              />
              <div>
                <Label htmlFor="pdfDownload" className="text-base font-medium cursor-pointer">
                  PDF Download
                </Label>
                <p className="text-sm text-gray-500">Generate a PDF to download immediately</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between mt-6">
        <Button
          onClick={handleBack}
          variant="outline" // Use outline variant for back button
          disabled={generateTicketMutation.isPending}
        >
          Back
        </Button>
        
        <Button
          onClick={handleGenerateTicket}
          disabled={!ticket || generateTicketMutation.isPending} // Disable if ticket not created or still creating
          className="bg-primary hover:bg-primary/90 text-primary-foreground" // Use primary variant
        >
          {generateTicketMutation.isPending ? (
            <div className="flex items-center">
              <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              Generating...
            </div> // This loading state is now handled by the main component loading check
          ) : (
            <>
              <Ticket className="mr-2 h-4 w-4" />
              Generate Ticket
            </>
          )}
        </Button>
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)} // Close modal
        pdfUrl={ticket ? `/api/tickets/${ticket.id}/pdf` : ""} // Use generated ticket ID for PDF URL
        onCreateAnother={() => {
          setIsSuccessModalOpen(false);
          resetFlightContext(); // Reset context for new booking
          setLocation('/flight-selection');
        }}
      />
    </div>
  );
}
