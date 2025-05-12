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
        return <FaPlane size={size} color="#0078D2" />;
      case "delta-airlines":
        return <MdFlight size={size} color="#E51937" />;
      case "british-airways":
        return <FaPlaneDeparture size={size} color="#125CA9" />;
      case "emirates":
        return <MdFlightTakeoff size={size} color="#D71A21" />;
      default:
        return <FaPlane size={size} color="#0078D2" />;
    }
  };

  return (
    <div className={`flex items-center justify-center ${className}`} title={airlineName}>
      {renderLogo()}
    </div>
  );
};

export default AirlineLogo;
