interface ProgressTrackerProps {
  currentStep: number;
}

export default function ProgressTracker({ currentStep }: ProgressTrackerProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between max-w-3xl mx-auto">
        <div className="flex flex-col items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${
            currentStep >= 1 ? 'bg-primary-600' : 'bg-gray-200 text-gray-500'
          }`}>
            1
          </div>
          <span className={`text-xs font-medium mt-2 ${
            currentStep >= 1 ? 'text-primary-700' : 'text-gray-500'
          }`}>
            Select Flight
          </span>
        </div>
        
        <div className="flex-1 h-1 mx-2">
          <div className={`h-full bg-primary-600 transition-all duration-300 ease-in-out ${
            currentStep >= 2 ? 'w-full' : 'w-0'
          }`}></div>
        </div>
        
        <div className="flex flex-col items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${
            currentStep >= 2 ? 'bg-primary-600' : 'bg-gray-200 text-gray-500'
          }`}>
            2
          </div>
          <span className={`text-xs font-medium mt-2 ${
            currentStep >= 2 ? 'text-primary-700' : 'text-gray-500'
          }`}>
            Passenger Details
          </span>
        </div>
        
        <div className="flex-1 h-1 mx-2">
          <div className={`h-full bg-primary-600 transition-all duration-300 ease-in-out ${
            currentStep >= 3 ? 'w-full' : 'w-0'
          }`}></div>
        </div>
        
        <div className="flex flex-col items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${
            currentStep >= 3 ? 'bg-primary-600' : 'bg-gray-200 text-gray-500'
          }`}>
            3
          </div>
          <span className={`text-xs font-medium mt-2 ${
            currentStep >= 3 ? 'text-primary-700' : 'text-gray-500'
          }`}>
            Review & Generate
          </span>
        </div>
      </div>
    </div>
  );
}
