import { cn } from "@/lib/utils";
import { useLocation } from "wouter";

type Step = {
  id: number;
  name: string;
  path: string;
};

interface ProgressStepperProps {
  currentStep: number;
}

const steps: Step[] = [
  { id: 1, name: "Select Flight", path: "/select-flight" },
  { id: 2, name: "Passenger Details", path: "/passenger-details" },
  { id: 3, name: "Preview & Generate", path: "/preview" },
];

const ProgressStepper = ({ currentStep }: ProgressStepperProps) => {
  const [location] = useLocation();

  return (
    <div className="mb-8 md:mb-12 max-w-3xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        {steps.map((step) => (
          <div
            key={step.id}
            className={cn(
              "flex items-center mb-4 md:mb-0 relative step-indicator",
              step.id < steps.length ? "w-full" : ""
            )}
          >
            <div
              className={cn(
                "rounded-full w-7 h-7 md:w-8 md:h-8 flex items-center justify-center font-bold mr-2",
                step.id === currentStep || (location === step.path && step.id <= currentStep)
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {step.id}
            </div>
            <span
              className={cn(
                "text-sm md:text-base",
                step.id === currentStep
                  ? "font-medium text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {step.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressStepper;
