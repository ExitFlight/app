import { Plane } from "lucide-react";
import { Link } from "wouter";

const Header = () => {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/">
          <a className="flex items-center">
            <Plane className="text-primary text-2xl mr-2" />
            <h1 className="text-2xl font-bold text-neutral-800">
              Flight<span className="text-primary">Back</span>
            </h1>
          </a>
        </Link>
        <div className="hidden md:block">
          <p className="text-neutral-600 italic">Fake Flight Ticket Generator</p>
        </div>
      </div>
    </header>
  );
};

export default Header;
