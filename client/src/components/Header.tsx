import { Plane, Home, Info } from "lucide-react";
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
        <nav className="flex items-center space-x-4">
          <Link href="/">
            <span className="flex items-center text-foreground hover:text-primary cursor-pointer font-medium">
              <Home className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Home</span>
            </span>
          </Link>
          <Link href="/about">
            <span className="flex items-center text-foreground hover:text-primary cursor-pointer font-medium">
              <Info className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">About</span>
            </span>
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
