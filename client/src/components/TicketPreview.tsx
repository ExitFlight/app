import { Card } from "@/components/ui/card";
import AirlineLogo from "./AirlineLogo";
import { Plane } from "lucide-react";
    import { type FlightWithDetails, type Passenger } from "@shared/schema"; // Adjust path if necessary

interface TicketPreviewProps {
      booking: Passenger & { // Or a more specific Booking type if you have one
        bookingReference: string;
        seatNumber: string;
        seatPreference?: string;
        // Add other booking-specific fields if they exist on the 'booking' prop
      };
      flight: FlightWithDetails;
}

export default function TicketPreview({ booking, flight }: TicketPreviewProps) {
  // Format date
  const dateObj = new Date(flight.departureDate || Date.now());
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <Card className="rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 relative">
        {/* Header section with airline logo and name */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <AirlineLogo
              airlineLogo={flight.airline.logo} // Directly use the logo string from your data
              airlineName={flight.airline.name}
              size={40}
              className="w-12 h-12 flex items-center justify-center"
            />
            <div>
              <span className="font-heading font-bold text-xl text-primary-800">{flight.airline.name}</span>
              <div className="text-xs text-gray-500">E-Ticket Confirmation</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">Booking Reference</div>
            <div className="font-medium text-primary-600">{booking.bookingReference}</div>
          </div>
        </div>
        
        {/* Flight Information */}
        <div className="mb-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">Flight</div>
              <div className="font-medium">{flight.flightNumber}</div>
            </div>
            <div className="border border-gray-200 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">Date</div>
              <div className="font-medium">{formattedDate}</div>
            </div>
            <div className="border border-gray-200 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">Class</div>
              <div className="font-medium">{flight.class}</div>
            </div>
          </div>
        </div>
        
        {/* Departure and Arrival */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div className="text-center mb-4 md:mb-0">
            <div className="text-3xl font-bold font-heading text-primary-800">{flight.departureTime}</div>
            <div className="text-sm font-medium mb-1">{flight.departureAirportCode}</div>
            <div className="text-xs text-gray-500">{flight.departureAirport?.city}, {flight.departureAirport?.country}</div>
          </div>
          
          <div className="flex flex-col items-center justify-center flex-1 mx-4">
            <div className="text-xs text-gray-500 mb-1">{flight.duration}</div>
            <div className="relative w-full flex items-center">
              <div className="h-0.5 bg-gray-300 w-full"></div>
              <div className="absolute w-3 h-3 rounded-full bg-primary-600 left-0 -ml-1.5"></div>
              <div className="absolute w-3 h-3 rounded-full bg-primary-600 right-0 -mr-1.5"></div>
            </div>
            <div className="text-xs text-gray-500 mt-1 flex items-center">
              <Plane className="text-primary-600 mr-1 w-3 h-3" />
              Direct
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold font-heading text-primary-800">{flight.arrivalTime}</div>
            <div className="text-sm font-medium mb-1">{flight.arrivalAirportCode}</div>
            <div className="text-xs text-gray-500">{flight.arrivalAirport?.city}, {flight.arrivalAirport?.country}</div>
          </div>
        </div>
        
        {/* Ticket perforation line */}
        <div className="ticket-perforation mb-6"></div>
        
        {/* Passenger Information */}
        <div className="mb-6">
          <h3 className="font-heading font-semibold text-gray-700 mb-3">Passenger Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-500 mb-1">Passenger Name</div>
              <div className="font-medium">{booking.firstName} {booking.lastName}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Seat</div>
              <div className="font-medium">{booking.seatNumber} ({booking.seatPreference || 'No preference'})</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Passport/ID</div>
              <div className="font-medium">{booking.passportNumber}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Boarding</div>
              <div className="font-medium">
                {/* Calculate boarding time (30 mins before departure) */}
                {(() => {
                  const [hour, minute] = flight.departureTime.split(':').map(Number);
                const departureDateTime = new Date(dateObj); // Use the flight's actual departure date
                departureDateTime.setHours(hour, minute, 0, 0); // Set H, M, S, MS
                departureDateTime.setMinutes(departureDateTime.getMinutes() - 30);
                return departureDateTime.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  });
                })()}
              </div>
            </div>
          </div>
        </div>
        
        {/* Barcode section */}
        <div className="text-center">
          <div className="inline-block bg-gray-100 px-8 py-4 rounded-lg">
            <div className="text-xs text-gray-500 mb-2">Scan QR code at airport</div>
            {/* Fake QR code - black square */}
            <div className="w-32 h-32 bg-gray-800 mx-auto mb-2"></div>
            <div className="text-xs text-gray-700 font-mono">
              {`${flight.flightNumber}${booking.firstName?.charAt(0)}${booking.lastName?.charAt(0)}${dateObj.getDate()}${dateObj.getMonth() + 1}${dateObj.getFullYear().toString().substr(-2)}${flight.arrivalAirportCode}`}
            </div>
          </div>
        </div>
        
        {/* Disclaimer */}
        <div className="mt-6 text-xs text-gray-500 text-center">
          <p>THIS IS A MOCK TICKET FOR PROJECT PURPOSES ONLY</p>
          <p>NOT VALID FOR ACTUAL TRAVEL</p>
        </div>
      </div>
    </Card>
  );
}
