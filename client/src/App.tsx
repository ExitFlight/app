import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import FlightSelection from "./pages/FlightSelection";
import PassengerDetails from "./pages/PassengerDetails";
import ReviewAndGenerate from "./pages/ReviewAndGenerate";
import { useEffect, useState } from "react";

function Router() {
  // Check if this is the first load to redirect to home page
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  useEffect(() => {
    if (isFirstLoad) {
      setIsFirstLoad(false);
    }
  }, [isFirstLoad]);

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/flight-selection" component={FlightSelection} />
      <Route path="/passenger-details/:flightId" component={PassengerDetails} />
      <Route path="/review/:bookingId" component={ReviewAndGenerate} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-grow">
            <Router />
          </main>
          <Footer />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
