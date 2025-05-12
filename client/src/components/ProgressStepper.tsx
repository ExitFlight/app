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
    <div className="mb-12 max-w-3xl mx-auto">
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
                "rounded-full w-8 h-8 flex items-center justify-center font-bold mr-2",
                step.id === currentStep || (location === step.path && step.id <= currentStep)
                  ? "bg-primary text-white"
                  : "bg-neutral-200 text-neutral-600"
              )}
            >
              {step.id}
            </div>
            <span
              className={cn(
                step.id === currentStep
                  ? "font-medium text-neutral-800"
                  : "text-neutral-500"
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
