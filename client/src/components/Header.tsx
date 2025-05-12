import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <div className="h-8 w-8 bg-primary-600 rounded-full flex items-center justify-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="text-white transform -rotate-45 w-4 h-4"
            >
              <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"></path>
            </svg>
          </div>
          <h1 className="font-heading font-bold text-xl text-primary-800">FlightBack</h1>
        </Link>
        
        <nav className="hidden md:flex space-x-6 items-center">
          <Link href="/" className="font-medium text-primary-700 hover:text-primary-800">
            Home
          </Link>
          <Link href="/flight-selection" className="font-medium text-gray-500 hover:text-primary-700">
            Select Flight
          </Link>
          <a href="#" className="font-medium text-gray-500 hover:text-primary-700">About</a>
          <a href="#" className="font-medium text-gray-500 hover:text-primary-700">Contact</a>
          <a href="#" className="font-medium text-gray-500 hover:text-primary-700">Help</a>
        </nav>
        
        <div className="md:hidden">
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex flex-col space-y-4 mt-8">
                <Link 
                  href="/" 
                  className="font-medium text-primary-700 hover:text-primary-800 py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>
                <Link 
                  href="/flight-selection" 
                  className="font-medium text-gray-500 hover:text-primary-700 py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Select Flight
                </Link>
                <a href="#" className="font-medium text-gray-500 hover:text-primary-700 py-2">About</a>
                <a href="#" className="font-medium text-gray-500 hover:text-primary-700 py-2">Contact</a>
                <a href="#" className="font-medium text-gray-500 hover:text-primary-700 py-2">Help</a>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
