import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { FlightProvider } from "./lib/context/FlightContext";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import EnhancedFlightSelection from "@/pages/EnhancedFlightSelection";
import PassengerDetails from "@/pages/PassengerDetails";
import TicketPreview from "@/pages/TicketPreview";
import Confirmation from "@/pages/Confirmation";
import About from "@/pages/About";
import Help from "@/pages/Help";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/select-flight" component={EnhancedFlightSelection} />
          <Route path="/passenger-details" component={PassengerDetails} />
          <Route path="/preview" component={TicketPreview} />
          <Route path="/confirmation" component={Confirmation} />
          <Route path="/about" component={About} />
          <Route path="/help" component={Help} />
          
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <FlightProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </FlightProvider>
    </QueryClientProvider>
  );
}

export default App;
