import { useEffect } from 'react';
import { useLocation } from 'wouter';

export default function Home() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Redirect to flight selection
    setLocation('/flight-selection');
  }, [setLocation]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <section className="mb-12">
        <div className="relative rounded-xl overflow-hidden shadow-lg h-64 sm:h-80 md:h-96 mb-6">
          <img 
            src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=600&q=80" 
            alt="Airplane flying above clouds" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary-900/80 to-primary-800/60 flex flex-col justify-center px-6 sm:px-12">
            <h2 className="font-heading text-white text-2xl sm:text-3xl md:text-4xl font-bold mb-4 max-w-2xl">
              Generate realistic flight tickets for your school project
            </h2>
            <p className="text-white text-sm sm:text-base md:text-lg max-w-xl">
              Select your details, generate a PDF, and receive it via email in seconds
            </p>
          </div>
        </div>
      </section>
      
      <div className="text-center">
        <div className="animate-pulse">
          Redirecting to flight selection...
        </div>
      </div>
    </div>
  );
}
