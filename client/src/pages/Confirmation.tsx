import { useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Download, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFlightContext } from "@/lib/context/FlightContext";

const Confirmation = () => {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const { ticketId, resetFlightContext } = useFlightContext();

  useEffect(() => {
    document.title = "Ticket Generated - FlightBack";
    
    if (!ticketId) {
      toast({
        title: "No ticket found",
        description: "Please go through the booking process first",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [ticketId, navigate, toast]);

  const handleDownloadTicket = () => {
    if (!ticketId) return;
    
    // Open the PDF in a new window
    window.open(`/api/tickets/${ticketId}/pdf`, "_blank");
  };

  const handleCreateNew = () => {
    // Reset the context and navigate to the first step
    resetFlightContext();
    navigate("/select-flight");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto text-center">
        <Card className="shadow-md mb-12">
          <CardContent className="p-8">
            <div className="flex justify-center mb-6">
              <div className="bg-success/10 text-success rounded-full w-20 h-20 flex items-center justify-center">
                <CheckCircle className="h-10 w-10" />
              </div>
            </div>
            
            <h2 className="text-2xl font-semibold mb-2 text-neutral-800">Ticket Generated Successfully!</h2>
            <p className="text-neutral-600 mb-6">
              Your fake flight ticket has been generated and delivered according to your preferences.
            </p>
            
            <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-4">
              <Button
                className="flex items-center justify-center"
                onClick={handleDownloadTicket}
              >
                <Download className="mr-2" size={16} />
                Download Ticket
              </Button>
              
              <Button
                variant="outline"
                className="flex items-center justify-center"
                onClick={handleCreateNew}
              >
                <Plus className="mr-2" size={16} />
                Create New Ticket
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Flight images gallery */}
        <div>
          <h3 className="text-xl font-semibold mb-6 text-neutral-800">Ready for your next adventure?</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <img 
              src="https://images.unsplash.com/photo-1536584754829-12214d404f32?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300" 
              alt="Airplane flying through clouds" 
              className="rounded-lg shadow-md w-full h-48 object-cover" 
            />
            <img 
              src="https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300" 
              alt="View from airplane window" 
              className="rounded-lg shadow-md w-full h-48 object-cover" 
            />
            <img 
              src="https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300" 
              alt="Airplane taking off at sunset" 
              className="rounded-lg shadow-md w-full h-48 object-cover" 
            />
            <img 
              src="https://images.unsplash.com/photo-1540339832862-474599807836?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300" 
              alt="Airplane interior cabin" 
              className="rounded-lg shadow-md w-full h-48 object-cover" 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Confirmation;
