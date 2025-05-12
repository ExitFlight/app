import { FaPlaneDeparture, FaPlane } from "react-icons/fa";
import { MdFlight, MdFlightTakeoff } from "react-icons/md";

type AirlineLogoProps = {
  airlineLogo: string;
  airlineName: string;
  className?: string;
  size?: number;
};

const AirlineLogo = ({ airlineLogo, airlineName, className = "", size = 40 }: AirlineLogoProps) => {
  const renderLogo = () => {
    switch (airlineLogo) {
      case "american-airlines":
        return <FaPlane size={size} className="text-primary" />;
      case "delta-airlines":
        return <MdFlight size={size} className="text-primary" />;
      case "british-airways":
        return <FaPlaneDeparture size={size} className="text-primary" />;
      case "emirates":
        return <MdFlightTakeoff size={size} className="text-primary" />;
      default:
        return <FaPlane size={size} className="text-primary" />;
    }
  };

  return (
    <div className={`flex items-center justify-center ${className}`} title={airlineName}>
      {renderLogo()}
    </div>
  );
};

export default AirlineLogo;
