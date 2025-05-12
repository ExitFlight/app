import { useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Plane, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const Home = () => {
  const [_, navigate] = useLocation();

  useEffect(() => {
    document.title = "FlightBack - Fake Flight Ticket Generator";
  }, []);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-neutral-800">
          Generate Fake Flight Tickets for Your School Project
        </h1>
        <p className="text-lg text-neutral-600 mb-8">
          Create realistic flight tickets with our easy-to-use generator.
          Perfect for presentations, mockups, or school projects.
        </p>
        <Button size="lg" onClick={() => navigate("/select-flight")} className="text-lg px-8">
          Create Your Ticket <ArrowRight className="ml-2" size={18} />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <Card className="shadow-md">
          <CardContent className="pt-6">
            <div className="bg-primary/10 text-primary rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Plane size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Choose Your Flight</h3>
            <p className="text-neutral-600">
              Select from a variety of airlines, routes, and times for your journey.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardContent className="pt-6">
            <div className="bg-primary/10 text-primary rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Add Passenger Details</h3>
            <p className="text-neutral-600">
              Enter your passenger information for a personalized ticket experience.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardContent className="pt-6">
            <div className="bg-primary/10 text-primary rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Download & Share</h3>
            <p className="text-neutral-600">
              Get your ticket as a PDF and have it emailed directly to you.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6 text-center text-neutral-800">Ready for your journey?</h2>
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
  );
};

export default Home;
