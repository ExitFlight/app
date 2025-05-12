import { Plane } from "lucide-react";
import { Link } from "wouter";

const Header = () => {
  return (
    <header className="bg-background shadow-md border-b border-border">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/">
          <div className="flex items-center cursor-pointer">
            <Plane className="text-primary text-2xl mr-2" />
            <h1 className="text-2xl font-bold text-foreground">
              Flight<span className="text-primary">Back</span>
            </h1>
          </div>
        </Link>
        <div className="flex items-center space-x-4">
          <p className="text-muted-foreground">Ticket Generator</p>
          <Link href="/itinerary-demo">
            <span className="text-primary hover:text-primary/80 cursor-pointer text-sm">
              Itinerary Demo
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
