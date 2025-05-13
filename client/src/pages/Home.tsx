import { useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Plane, ArrowRight, Users, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const Home = () => {
  const [_, navigate] = useLocation();

  useEffect(() => {
    document.title = "FlightBack - Ticket Generator";
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-3xl mx-auto text-center mb-10 md:mb-16">
        <h1 className="text-3xl md:text-5xl font-bold mb-4 text-foreground">
          Generate Flight Tickets Instantly
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          Create realistic flight tickets with our easy-to-use generator.
          Perfect for presentations and mockups.
        </p>
        <Button size="lg" onClick={() => navigate("/select-flight")} className="text-base md:text-lg px-6 md:px-8">
          Create Your Ticket <ArrowRight className="ml-2" size={18} />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-10 md:mb-16">
        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div className="bg-primary/10 text-primary rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Plane size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-foreground">Choose Your Flight</h3>
            <p className="text-muted-foreground">
              Select from a variety of airlines, routes, and times for your journey.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div className="bg-primary/10 text-primary rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Users size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-foreground">Add Passenger Details</h3>
            <p className="text-muted-foreground">
              Enter your passenger information for a personalized ticket experience.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div className="bg-primary/10 text-primary rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <FileText size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-foreground">Download & Share</h3>
            <p className="text-muted-foreground">
              Get your ticket as a PDF and have it emailed directly to you.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="max-w-4xl mx-auto">
        <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6 text-center text-foreground">Ready for your journey?</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
          <img 
            src="https://images.unsplash.com/photo-1536584754829-12214d404f32?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300" 
            alt="Airplane flying through clouds" 
            className="rounded-lg w-full h-28 md:h-48 object-cover" 
          />
          <img 
            src="https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300" 
            alt="View from airplane window" 
            className="rounded-lg w-full h-28 md:h-48 object-cover" 
          />
          <img 
            src="https://images.unsplash.com/photo-1582530072481-9be23de5a771?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300" 
            alt="Tropical villa in Bali, Indonesia" 
            className="rounded-lg w-full h-28 md:h-48 object-cover" 
          />
          <img 
            src="https://images.unsplash.com/photo-1573790387438-4da905039392?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300" 
            alt="Tropical island in Indonesia" 
            className="rounded-lg w-full h-28 md:h-48 object-cover" 
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
