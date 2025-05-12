import { Plane } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-background border-t border-border py-6 mt-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center">
              <Plane className="text-primary text-2xl mr-2" />
              <h2 className="text-xl font-bold text-foreground">
                Flight<span className="text-primary">Back</span>
              </h2>
            </div>
          </div>
          
          <div className="text-center md:text-right">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} FlightBack. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
