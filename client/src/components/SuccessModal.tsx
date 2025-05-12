import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Plus, X } from "lucide-react";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string;
  onCreateAnother: () => void;
}

export default function SuccessModal({ isOpen, onClose, pdfUrl, onCreateAnother }: SuccessModalProps) {
  const handleDownload = () => {
    // Open the PDF URL in a new tab or trigger download
    window.open(pdfUrl, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-8 w-8 text-green-600" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
          </div>
          <DialogTitle className="text-center text-xl">Ticket Generated Successfully!</DialogTitle>
          <DialogDescription className="text-center">
            Your flight ticket has been generated and sent to your email address.
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="flex flex-col sm:flex-col gap-2 mt-4">
          <Button 
            className="w-full" 
            onClick={handleDownload}
            variant="default"
          >
            <Download className="mr-2 h-4 w-4" />
            Download PDF Ticket
          </Button>
          
          <Button 
            className="w-full" 
            onClick={onCreateAnother}
            variant="outline"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Another Ticket
          </Button>
          
          <Button 
            className="w-full text-gray-600" 
            onClick={onClose}
            variant="ghost"
          >
            <X className="mr-2 h-4 w-4" />
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
