// /home/jordan/Desktop/FlightBack/client/src/pages/PassengerDetails.tsx
import { useEffect } from "react";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, RefreshCcwIcon } from "lucide-react"; // Changed SaveIcon to RefreshCcwIcon
import ProgressStepper from "@/components/ProgressStepper";
import { useFlightContext } from "@/lib/context/FlightContext";
import { passengerDetailsSchema, type PassengerDetailsForm } from "@shared/schema"; // Ensure schema has no birthdate

const titles = [
  { value: "Mr", label: "Mr." }, { value: "Mrs", label: "Mrs." },
  { value: "Ms", label: "Ms." }, { value: "Miss", label: "Miss" },
  { value: "Dr", label: "Dr." }, { value: "Prof", label: "Prof." },
];

const nationalities = [ /* ... your full nationalities array ... */
  { value: "af", label: "Afghanistan" }, { value: "dz", label: "Algeria" },
  { value: "al", label: "Albania" }, { value: "ad", label: "Andorra" },
  { value: "ao", label: "Angola" }, { value: "ar", label: "Argentina" },
  { value: "am", label: "Armenia" }, { value: "au", label: "Australia" },
  { value: "at", label: "Austria" }, { value: "az", label: "Azerbaijan" },
  { value: "bh", label: "Bahrain" }, { value: "bd", label: "Bangladesh" },
  { value: "by", label: "Belarus" }, { value: "be", label: "Belgium" },
  { value: "bj", label: "Benin" }, { value: "bt", label: "Bhutan" },
  { value: "bo", label: "Bolivia" }, { value: "ba", label: "Bosnia and Herzegovina" },
  { value: "bw", label: "Botswana" }, { value: "br", label: "Brazil" },
  { value: "bn", label: "Brunei" }, { value: "bg", label: "Bulgaria" },
  { value: "bf", label: "Burkina Faso" }, { value: "bi", label: "Burundi" },
  { value: "cv", label: "Cabo Verde" }, { value: "kh", label: "Cambodia" },
  { value: "cm", label: "Cameroon" }, { value: "us", label: "United States" },
  { value: "ca", label: "Canada" }, { value: "cf", label: "Central African Republic" },
  { value: "td", label: "Chad" }, { value: "cl", label: "Chile" },
  { value: "cn", label: "China" }, { value: "co", label: "Colombia" },
  { value: "hr", label: "Croatia" }, { value: "cy", label: "Cyprus" },
  { value: "cz", label: "Czech Republic" }, { value: "dk", label: "Denmark" },
  { value: "dj", label: "Djibouti" }, { value: "ec", label: "Ecuador" },
  { value: "eg", label: "Egypt" }, { value: "gq", label: "Equatorial Guinea" },
  { value: "er", label: "Eritrea" }, { value: "ee", label: "Estonia" },
  { value: "sz", label: "Eswatini" }, { value: "et", label: "Ethiopia" },
  { value: "fj", label: "Fiji" }, { value: "fi", label: "Finland" },
  { value: "uk", label: "United Kingdom" }, { value: "fr", label: "France" },
  { value: "ga", label: "Gabon" }, { value: "gm", label: "Gambia" },
  { value: "ge", label: "Georgia" }, { value: "de", label: "Germany" },
  { value: "gh", label: "Ghana" }, { value: "gr", label: "Greece" },
  { value: "gy", label: "Guyana" }, { value: "hk", label: "Hong Kong" },
  { value: "hu", label: "Hungary" }, { value: "is", label: "Iceland" },
  { value: "in", label: "India" }, { value: "id", label: "Indonesia" },
  { value: "ir", label: "Iran" }, { value: "iq", label: "Iraq" },
  { value: "ie", label: "Ireland" }, { value: "il", label: "Israel" },
  { value: "es", label: "Spain" }, { value: "it", label: "Italy" },
  { value: "ci", label: "Ivory Coast" }, { value: "jp", label: "Japan" },
  { value: "jo", label: "Jordan" }, { value: "kz", label: "Kazakhstan" },
  { value: "xk", label: "Kosovo" }, { value: "kw", label: "Kuwait" },
  { value: "kg", label: "Kyrgyzstan" }, { value: "la", label: "Laos" },
  { value: "lv", label: "Latvia" }, { value: "lb", label: "Lebanon" },
  { value: "ls", label: "Lesotho" }, { value: "lr", label: "Liberia" },
  { value: "ly", label: "Libya" }, { value: "li", label: "Liechtenstein" },
  { value: "lt", label: "Lithuania" }, { value: "lu", label: "Luxembourg" },
  { value: "mo", label: "Macau" }, { value: "mg", label: "Madagascar" },
  { value: "mw", label: "Malawi" }, { value: "my", label: "Malaysia" },
  { value: "mv", label: "Maldives" }, { value: "ml", label: "Mali" },
  { value: "mt", label: "Malta" }, { value: "mr", label: "Mauritania" },
  { value: "mu", label: "Mauritius" }, { value: "md", label: "Moldova" },
  { value: "mc", label: "Monaco" }, { value: "me", label: "Montenegro" },
  { value: "ma", label: "Morocco" }, { value: "mz", label: "Mozambique" },
  { value: "na", label: "Namibia" }, { value: "nl", label: "Netherlands" },
  { value: "nz", label: "New Zealand" }, { value: "ne", label: "Niger" },
  { value: "ng", label: "Nigeria" }, { value: "mk", label: "North Macedonia" },
  { value: "no", label: "Norway" }, { value: "om", label: "Oman" },
  { value: "pk", label: "Pakistan" }, { value: "ps", label: "Palestine" },
  { value: "py", label: "Paraguay" }, { value: "pe", label: "Peru" },
  { value: "ph", label: "Philippines" }, { value: "pl", label: "Poland" },
  { value: "pt", label: "Portugal" }, { value: "qa", label: "Qatar" },
  { value: "cg", label: "Republic of the Congo" }, { value: "ro", label: "Romania" },
  { value: "ru", label: "Russia" }, { value: "rw", label: "Rwanda" },
  { value: "sm", label: "San Marino" }, { value: "sa", label: "Saudi Arabia" },
  { value: "rs", label: "Serbia" }, { value: "sc", label: "Seychelles" },
  { value: "sl", label: "Sierra Leone" }, { value: "sg", label: "Singapore" },
  { value: "sk", label: "Slovakia" }, { value: "si", label: "Slovenia" },
  { value: "so", label: "Somalia" }, { value: "za", label: "South Africa" },
  { value: "kr", label: "South Korea" }, { value: "ss", label: "South Sudan" },
  { value: "sr", label: "Suriname" }, { value: "se", label: "Sweden" },
  { value: "ch", label: "Switzerland" }, { value: "sy", label: "Syria" },
  { value: "tw", label: "Taiwan" }, { value: "tj", label: "Tajikistan" },
  { value: "th", label: "Thailand" }, { value: "tl", label: "Timor-Leste" },
  { value: "tg", label: "Togo" }, { value: "tr", label: "Turkey" },
  { value: "tm", label: "Turkmenistan" }, { value: "ug", label: "Uganda" },
  { value: "ua", label: "Ukraine" }, { value: "ae", label: "United Arab Emirates" },
  { value: "uy", label: "Uruguay" }, { value: "uz", label: "Uzbekistan" },
  { value: "va", label: "Vatican City" }, { value: "ve", label: "Venezuela" },
  { value: "vn", label: "Vietnam" }, { value: "ye", label: "Yemen" },
  { value: "zm", label: "Zambia" }, { value: "zw", label: "Zimbabwe" },
].sort((a, b) => a.label.localeCompare(b.label));

const LOCAL_STORAGE_KEY = "flightAppPassengerDetails";

const PassengerDetails = () => {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const { selectedFlight, passengerDetails: contextPassengerDetails, setPassengerDetails } = useFlightContext();

  const loadDetailsFromStorage = (): Partial<PassengerDetailsForm> | null => {
    try {
      const savedDetails = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedDetails) {
        const parsed = JSON.parse(savedDetails) as PassengerDetailsForm;
        if (parsed && typeof parsed === 'object' && parsed.firstName !== undefined) {
          // Ensure no old/removed fields like birthdate are loaded
          const { birthdate, passportNumber, ...relevantDetails } = parsed as any;
          return relevantDetails;
        }
      }
    } catch (error) {
      console.error("Error loading passenger details from localStorage:", error);
    }
    return null;
  };

  const saveDetailsToStorage = (details: PassengerDetailsForm) => {
    try {
      // Ensure no old/removed fields are saved
      const { birthdate, passportNumber, ...detailsToSave } = details as any;
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(detailsToSave));
    } catch (error) {
      console.error("Error saving passenger details to localStorage:", error);
    }
  };

  const emptyFormDefaults: Partial<PassengerDetailsForm> = {
    title: "", firstName: "", middleName: "", lastName: "", email: "", phone: "",
    nationality: "",
  };

  const getInitialFormValues = (): Partial<PassengerDetailsForm> => {
    let initialData = { ...emptyFormDefaults }; 

    const storedDetails = loadDetailsFromStorage();
    if (storedDetails) {
      console.log("Initializing form with details from localStorage");
      initialData = { ...initialData, ...storedDetails };
    }

    if (contextPassengerDetails && contextPassengerDetails.firstName) {
      console.log("Overriding/merging with details from context");
      const { birthdate, passportNumber, ...contextDataToUse } = contextPassengerDetails as any;
      initialData = { ...initialData, ...contextDataToUse };
    }
    
    if (!storedDetails && !(contextPassengerDetails && contextPassengerDetails.firstName)) {
        console.log("Initializing form with empty defaults (nothing in context or storage)");
    }
    return initialData;
  };
  
  const form = useForm<PassengerDetailsForm>({
    resolver: zodResolver(passengerDetailsSchema),
    defaultValues: getInitialFormValues(),
  });

  useEffect(() => {
    document.title = "Passenger Details - FlightBack";
    if (!selectedFlight) {
      toast({
        title: "No flight selected",
        description: "Please select a flight first",
        variant: "destructive",
      });
      navigate("/select-flight");
      return;
    }

    const initialValues = getInitialFormValues();
    if (JSON.stringify(form.getValues()) !== JSON.stringify(initialValues)) {
        form.reset(initialValues);
    }

  }, [selectedFlight, contextPassengerDetails, navigate, toast, form]);
  
  const goBack = () => {
    const currentValues = form.getValues();
    const { birthdate, passportNumber, ...valuesToSaveInContext } = currentValues as any;
    setPassengerDetails(valuesToSaveInContext);
    navigate("/select-flight");
  };

  const onSubmit = (data: PassengerDetailsForm) => {
   console.log("PassengerDetails onSubmit data:", JSON.stringify(data, null, 2));
    setPassengerDetails(data); 
    saveDetailsToStorage(data);
    toast({
        title: "Details Saved",
        description: "Your passenger details have been saved for next time.",
    });
    navigate("/preview");
  };

  const handleResetAllClick = () => {
    form.reset(emptyFormDefaults);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setPassengerDetails(null); // Clear context
    toast({ title: "Form Reset", description: "All passenger details have been cleared." });
  };

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <ProgressStepper currentStep={2} />
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-4 md:mb-6">
            <h2 className="text-xl md:text-2xl font-semibold text-foreground">Passenger Details</h2>
            <Button variant="outline" size="sm" onClick={handleResetAllClick} className="text-muted-foreground hover:text-destructive">
                <RefreshCcwIcon className="mr-2 h-4 w-4" /> Reset All
            </Button>
        </div>
        <Card className="mb-6 md:mb-8 border-border bg-card">
          <CardContent className="p-4 md:p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel className="text-foreground font-medium text-sm">Title (Optional)</FormLabel><Select onValueChange={field.onChange} value={field.value || ""}><FormControl><SelectTrigger className="w-full bg-background text-foreground"><SelectValue placeholder="Select title" /></SelectTrigger></FormControl><SelectContent className="bg-popover text-popover-foreground border-border">{titles.map((t) => (<SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>))}</SelectContent></Select><FormMessage className="text-xs" /></FormItem>)} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                  <FormField control={form.control} name="firstName" render={({ field }) => (<FormItem><FormLabel className="text-foreground font-medium text-sm">First Name *</FormLabel><FormControl><Input placeholder="Enter first name" {...field} className="w-full p-2 md:p-3 bg-background text-foreground" /></FormControl><FormMessage className="text-xs" /></FormItem>)} />
                  <FormField control={form.control} name="middleName" render={({ field }) => (<FormItem><FormLabel className="text-foreground font-medium text-sm">Middle Name/Initial (Optional)</FormLabel><FormControl><Input placeholder="Enter middle name or initial" {...field} className="w-full p-2 md:p-3 bg-background text-foreground" /></FormControl><FormMessage className="text-xs" /></FormItem>)} />
                </div>

                <FormField control={form.control} name="lastName" render={({ field }) => (<FormItem><FormLabel className="text-foreground font-medium text-sm">Last Name *</FormLabel><FormControl><Input placeholder="Enter last name" {...field} className="w-full p-2 md:p-3 bg-background text-foreground" /></FormControl><FormMessage className="text-xs" /></FormItem>)} />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                  <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel className="text-foreground font-medium text-sm">Email Address *</FormLabel><FormControl><Input type="email" placeholder="your@email.com" {...field} className="w-full p-2 md:p-3 bg-background text-foreground" /></FormControl><FormMessage className="text-xs" /></FormItem>)} />
                  <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel className="text-foreground font-medium text-sm">Phone Number (Optional)</FormLabel><FormControl><Input type="tel" placeholder="+1 (555) 123-4567" {...field} className="w-full p-2 md:p-3 bg-background text-foreground" /></FormControl><FormMessage className="text-xs" /></FormItem>)} />
                
                  <FormField
                    control={form.control}
                    name="nationality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground font-medium text-sm">Nationality *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full bg-background text-foreground">
                              <SelectValue placeholder="Select nationality" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-popover text-popover-foreground border-border">
                            {nationalities.map((n) => (
                              <SelectItem key={n.value} value={n.value}>
                                {n.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="mt-8 flex flex-col md:flex-row justify-between">
                  <Button type="button" variant="outline" className="mb-3 md:mb-0 bg-background border-border text-foreground" onClick={goBack}>
                    <ArrowLeft className="mr-2" size={16} /> Back to Flights
                  </Button>
                  <Button type="submit">
                    Continue to Preview <ArrowRight className="ml-2" size={16} />
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PassengerDetails;