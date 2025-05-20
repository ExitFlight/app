import { Plane } from "lucide-react"; // Assuming you might want to use an icon

interface FlightAirlineData {
  name: string;
  logoUrl: string; // Assuming this is always a URL
}
interface FlightDisplayData {
  airline: FlightAirlineData;
  flightNumber: string;
  departureTime: string;
  departureAirportCode: string;
  arrivalTime: string;
  arrivalAirportCode: string;
  duration: string;
  price: number; // Or string if it includes currency symbols
  class: string;
  isDirect?: boolean; // Optional: true if direct, false or undefined otherwise
}
interface FlightCardProps {
  flight: FlightDisplayData;
  isSelected: boolean;
  onSelect: () => void;
}

export default function FlightCard({ flight, isSelected, onSelect }: FlightCardProps) {
  return (
    <div 
      className={`bg-white rounded-xl shadow-md p-4 mb-4 hover:shadow-lg transition duration-200 cursor-pointer border-2 ${
        isSelected ? 'border-primary-500' : 'border-transparent hover:border-primary-500'
      }`}
      onClick={onSelect}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Airline Info */}
        <div className="flex items-center space-x-4">
          <img 
            src={flight.airline.logoUrl} 
            alt={`${flight.airline.name} Logo`} 
            className="w-12 h-12 object-contain rounded-lg"
          />
          <div>
            <div className="font-heading font-semibold text-primary-800">{flight.airline.name}</div>
            <div className="text-sm text-gray-500">Flight {flight.flightNumber}</div>
          </div>
        </div>
        
        {/* Flight Times */}
        <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
          <div className="text-center">
            <div className="font-heading font-semibold text-lg">{flight.departureTime}</div>
            <div className="text-xs text-gray-500">{flight.departureAirportCode}</div>
          </div>
          
          <div className="flex flex-col items-center justify-center flex-1">
            <div className="text-xs text-gray-500 mb-1">{flight.duration}</div>
            <div className="relative w-full flex items-center">
              <div className="h-0.5 bg-gray-300 w-full"></div>
              <div className="absolute right-0 -mr-1 w-2 h-2 rounded-full bg-gray-300"></div>
              <div className="absolute left-0 -ml-1 w-2 h-2 rounded-full bg-gray-300"></div>
            </div>
            <div className="text-xs text-gray-500 mt-1 flex items-center justify-center">
              {flight.isDirect !== false ? ( // Show "Direct" if isDirect is true or undefined
                <><Plane className="w-3 h-3 mr-1" /> Direct</>
              ) : (
                <span>Connecting</span> // Or display number of stops
              )}
            </div>
          </div>
          
          <div className="text-center">
            <div className="font-heading font-semibold text-lg">{flight.arrivalTime}</div>
            <div className="text-xs text-gray-500">{flight.arrivalAirportCode}</div>
          </div>
        </div>
        
        {/* Price */}
        <div className="text-right">
          <div className="font-heading font-semibold text-lg text-primary-700">${flight.price}</div>
          <div className="text-xs text-gray-500">{flight.class}</div>
        </div>
      </div>
    </div>
  );
}
