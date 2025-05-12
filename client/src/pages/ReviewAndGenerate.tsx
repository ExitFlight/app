import { useState } from 'react';
import { useLocation, useParams } from 'wouter';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import ProgressTracker from '@/components/ProgressTracker';
import TicketPreview from '@/components/TicketPreview';
import SuccessModal from '@/components/SuccessModal';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Download, Ticket } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function ReviewAndGenerate() {
  const params = useParams<{ bookingId: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const bookingId = parseInt(params.bookingId, 10);
  
  const [emailDelivery, setEmailDelivery] = useState(true);
  const [pdfDownload, setPdfDownload] = useState(true);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [ticketPdfUrl, setTicketPdfUrl] = useState("");

  // Fetch booking details
  const { data: booking, isLoading: isLoadingBooking, isError: isBookingError } = useQuery({
    queryKey: [`/api/bookings/${bookingId}`],
    enabled: !isNaN(bookingId),
  });

  // Fetch associated flight details
  const { data: flight, isLoading: isLoadingFlight, isError: isFlightError } = useQuery({
    queryKey: [`/api/flights/${booking?.flightId}`],
    enabled: !!booking?.flightId,
  });

  // Generate ticket mutation
  const generateTicketMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', `/api/bookings/${bookingId}/generate-ticket`, {
        sendEmail: emailDelivery,
      });
      return res.json();
    },
    onSuccess: (data) => {
      setTicketPdfUrl(`/api/bookings/${bookingId}/ticket.pdf`);
      setIsSuccessModalOpen(true);
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

  const handleBack = () => {
    setLocation(`/passenger-details/${booking?.flightId}`);
  };

  const handleGenerateTicket = () => {
    if (!emailDelivery && !pdfDownload) {
      toast({
        title: "Select delivery method",
        description: "Please select at least one delivery method",
        variant: "destructive",
      });
      return;
    }
    
    generateTicketMutation.mutate();
  };

  const isLoading = isLoadingBooking || isLoadingFlight;
  const isError = isBookingError || isFlightError;

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProgressTracker currentStep={3} />
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-700"></div>
        </div>
      </div>
    );
  }

  if (isError || !booking || !flight) {
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
          <Button onClick={() => setLocation('/flight-selection')} variant="outline">
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
        <TicketPreview booking={booking} flight={flight} />
      </div>

      {/* Delivery Options */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <h3 className="font-heading text-xl font-semibold text-primary-800 mb-4">Delivery Options</h3>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox 
                id="emailDelivery" 
                checked={emailDelivery} 
                onCheckedChange={(checked) => setEmailDelivery(checked as boolean)} 
              />
              <div>
                <Label htmlFor="emailDelivery" className="text-base font-medium cursor-pointer">
                  Email Delivery
                </Label>
                <p className="text-sm text-gray-500">Send the ticket to my email address</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Checkbox 
                id="pdfDownload" 
                checked={pdfDownload} 
                onCheckedChange={(checked) => setPdfDownload(checked as boolean)} 
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
          variant="outline"
          disabled={generateTicketMutation.isPending}
        >
          Back
        </Button>
        
        <Button
          onClick={handleGenerateTicket}
          disabled={generateTicketMutation.isPending}
          className="bg-accent-500 hover:bg-accent-600 text-white"
        >
          {generateTicketMutation.isPending ? (
            <div className="flex items-center">
              <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              Generating...
            </div>
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
        onClose={() => setIsSuccessModalOpen(false)}
        pdfUrl={ticketPdfUrl}
        onCreateAnother={() => {
          setIsSuccessModalOpen(false);
          setLocation('/flight-selection');
        }}
      />
    </div>
  );
}
