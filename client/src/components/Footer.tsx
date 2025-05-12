import { Link } from 'wouter';

export default function Footer() {
  return (
    <footer className="bg-primary-900 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="h-8 w-8 bg-white rounded-full flex items-center justify-center">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="text-primary-700 transform -rotate-45 w-4 h-4"
                >
                  <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"></path>
                </svg>
              </div>
              <h2 className="font-heading font-bold text-xl">FlightBack</h2>
            </div>
            <p className="text-gray-300 text-sm mb-4">
              A simple web application for generating fake flight tickets for school projects.
            </p>
            <p className="text-gray-400 text-xs">
              © {new Date().getFullYear()} FlightBack. Not affiliated with any real airlines.
            </p>
          </div>
          
          <div>
            <h3 className="font-heading font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white transition">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/flight-selection" className="text-gray-300 hover:text-white transition">
                  Select Flight
                </Link>
              </li>
              <li><a href="#" className="text-gray-300 hover:text-white transition">About</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition">Contact</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition">Help Center</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-heading font-semibold text-lg mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white transition">Terms of Service</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition">Disclaimer</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
