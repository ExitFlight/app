import { createContext, useContext, useState, ReactNode } from "react";
import { FlightWithDetails, FlightSearchForm, PassengerDetailsForm } from "@shared/schema";

interface FlightContextType {
  flightDetails: FlightSearchForm | null;
  selectedFlight: FlightWithDetails | null;
  passengerDetails: PassengerDetailsForm | null;
  ticketId: number | null;
  setFlightDetails: (details: FlightSearchForm) => void;
  setSelectedFlight: (flight: FlightWithDetails) => void;
  setPassengerDetails: (details: PassengerDetailsForm) => void;
  setTicketId: (id: number) => void;
  resetFlightContext: () => void;
}

const FlightContext = createContext<FlightContextType | undefined>(undefined);

export const FlightProvider = ({ children }: { children: ReactNode }) => {
  const [flightDetails, setFlightDetails] = useState<FlightSearchForm | null>(null);
  const [selectedFlight, setSelectedFlight] = useState<FlightWithDetails | null>(null);
  const [passengerDetails, setPassengerDetails] = useState<PassengerDetailsForm | null>(null);
  const [ticketId, setTicketId] = useState<number | null>(null);

  const resetFlightContext = () => {
    setFlightDetails(null);
    setSelectedFlight(null);
    setPassengerDetails(null);
    setTicketId(null);
  };

  return (
    <FlightContext.Provider
      value={{
        flightDetails,
        selectedFlight,
        passengerDetails,
        ticketId,
        setFlightDetails,
        setSelectedFlight,
        setPassengerDetails,
        setTicketId,
        resetFlightContext,
      }}
    >
      {children}
    </FlightContext.Provider>
  );
};

export const useFlightContext = () => {
  const context = useContext(FlightContext);
  if (context === undefined) {
    throw new Error("useFlightContext must be used within a FlightProvider");
  }
  return context;
};
