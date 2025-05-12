import { Plane } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-neutral-800 text-neutral-300 py-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center">
              <Plane className="text-primary text-2xl mr-2" />
              <h2 className="text-xl font-bold text-white">
                Flight<span className="text-primary">Back</span>
              </h2>
            </div>
            <p className="text-sm text-neutral-400 mt-1">Fake Flight Ticket Generator</p>
          </div>
          
          <div className="text-center md:text-right">
            <p className="text-sm">School Project - Not for commercial use</p>
            <p className="text-xs text-neutral-400 mt-1">
              &copy; {new Date().getFullYear()} FlightBack. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
