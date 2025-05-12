import { SiAmericanAirlines, SiDelta, SiBritishairways, SiEmirates } from "react-icons/si";

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
        return <SiAmericanAirlines size={size} />;
      case "delta-airlines":
        return <SiDelta size={size} />;
      case "british-airways":
        return <SiBritishairways size={size} />;
      case "emirates":
        return <SiEmirates size={size} />;
      default:
        return <SiAmericanAirlines size={size} />;
    }
  };

  return (
    <div className={`flex items-center justify-center ${className}`} title={airlineName}>
      {renderLogo()}
    </div>
  );
};

export default AirlineLogo;
