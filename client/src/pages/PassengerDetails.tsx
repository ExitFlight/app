// /home/jordan/Desktop/FlightBack/client/src/pages/PassengerDetails.tsx
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, CalendarIcon, SaveIcon } from "lucide-react"; // Added SaveIcon
import ProgressStepper from "@/components/ProgressStepper";
import { useFlightContext } from "@/lib/context/FlightContext";
import { passengerDetailsSchema, type PassengerDetailsForm } from "@shared/schema";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format, isValid, parse } from "date-fns";

const nationalities = [
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

const LOCAL_STORAGE_KEY = "flightAppPassengerDetails"; // Key for storing passenger details

const PassengerDetails = () => {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const { selectedFlight, passengerDetails: contextPassengerDetails, setPassengerDetails } = useFlightContext();
  const [isBirthdatePopoverOpen, setIsBirthdatePopoverOpen] = useState(false);

  // Function to load details from localStorage
  const loadDetailsFromStorage = (): PassengerDetailsForm | null => {
    try {
      const savedDetails = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedDetails) {
        const parsed = JSON.parse(savedDetails) as PassengerDetailsForm;
        // Basic validation: ensure it's an object with at least one expected key
        if (parsed && typeof parsed === 'object' && parsed.firstName !== undefined) {
          return parsed;
        }
      }
    } catch (error) {
      console.error("Error loading passenger details from localStorage:", error);
    }
    return null;
  };

  // Function to save details to localStorage
  const saveDetailsToStorage = (details: PassengerDetailsForm) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(details));
    } catch (error) {
      console.error("Error saving passenger details to localStorage:", error);
    }
  };

  // Determine initial form values: Context > localStorage > Empty
  const getInitialFormValues = (): Partial<PassengerDetailsForm> => {
    if (contextPassengerDetails && contextPassengerDetails.firstName) { // Check a key field from context
      console.log("Initializing form with details from context");
      return contextPassengerDetails;
    }
    const storedDetails = loadDetailsFromStorage();
    if (storedDetails) {
      console.log("Initializing form with details from localStorage");
      return storedDetails;
    }
    console.log("Initializing form with empty defaults");
    return { // Default to empty if nothing found
      firstName: "", lastName: "", email: "", phone: "",
      passportNumber: "", nationality: "", birthdate: "",
    };
  };

  const form = useForm<PassengerDetailsForm>({
    resolver: zodResolver(passengerDetailsSchema),
    // Initialize with context data, or localStorage data, or empty strings
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
    }
    // Optionally, if context changes, you might want to reset the form
    // This ensures that if the user navigates back and context has updated info,
    // it overrides what might have been loaded from localStorage initially for this mount.
    // if (contextPassengerDetails && contextPassengerDetails.firstName) {
    //   form.reset(contextPassengerDetails);
    // }
  }, [selectedFlight, navigate, toast, contextPassengerDetails, form]); // Added form to dependencies if using form.reset
  
  const goBack = () => {
    // Before navigating back, save current form values to context
    // so if user returns, these partially filled details are available
    setPassengerDetails(form.getValues());
    navigate("/select-flight");
  };

  const onSubmit = (data: PassengerDetailsForm) => {
    setPassengerDetails(data); // Update context for current session
    saveDetailsToStorage(data); // Save to localStorage for future sessions
    toast({
        title: "Details Saved",
        description: "Your passenger details have been saved for next time.",
    });
    navigate("/preview");
  };

  const handleLoadMyDetailsClick = () => {
    const storedDetails = loadDetailsFromStorage();
    if (storedDetails) {
      form.reset(storedDetails); // Populate form with stored details
      toast({ title: "Details Loaded", description: "Your saved information has been loaded." });
    } else {
      toast({ title: "No Saved Details", description: "No previously saved information found.", variant: "info" });
    }
  };

  const getDefaultCalendarMonth = (fieldValue?: string) => {
    if (fieldValue) {
      const d = parse(fieldValue, "yyyy-MM-dd", new Date());
      if (isValid(d)) return d;
    }
    const thirtyYearsAgo = new Date();
    thirtyYearsAgo.setFullYear(thirtyYearsAgo.getFullYear() - 30);
    return thirtyYearsAgo;
  };

  const [birthdateInputText, setBirthdateInputText] = useState(() => {
    const initialBirthdate = form.getValues("birthdate"); // Get from RHF initial values
    return initialBirthdate && isValid(parse(initialBirthdate, "yyyy-MM-dd", new Date()))
        ? format(parse(initialBirthdate, "yyyy-MM-dd", new Date()), "dd-MM-yyyy")
        : "";
  });

  useEffect(() => {
    const formBirthdate = form.getValues("birthdate");
    if (formBirthdate && isValid(parse(formBirthdate, "yyyy-MM-dd", new Date()))) {
        setBirthdateInputText(format(parse(formBirthdate, "yyyy-MM-dd", new Date()), "dd-MM-yyyy"));
    } else if (formBirthdate) {
        setBirthdateInputText(formBirthdate);
    } else {
        setBirthdateInputText("");
    }
  }, [form.watch("birthdate")]);


  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <ProgressStepper currentStep={2} />
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-4 md:mb-6">
            <h2 className="text-xl md:text-2xl font-semibold text-foreground">Passenger Details</h2>
            {/* Button to explicitly load saved details */}
            <Button variant="outline" size="sm" onClick={handleLoadMyDetailsClick}>
                <SaveIcon className="mr-2 h-4 w-4" /> Load My Details
            </Button>
        </div>
        <Card className="mb-6 md:mb-8 border-border bg-card">
          <CardContent className="p-4 md:p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <FormField control={form.control} name="firstName" render={({ field }) => (<FormItem><FormLabel className="text-foreground font-medium text-sm">First Name</FormLabel><FormControl><Input placeholder="First" {...field} className="w-full p-2 md:p-3 bg-background text-foreground" /></FormControl><FormMessage className="text-xs" /></FormItem>)} />
                  <FormField control={form.control} name="lastName" render={({ field }) => (<FormItem><FormLabel className="text-foreground font-medium text-sm">Last Name</FormLabel><FormControl><Input placeholder="Last" {...field} className="w-full p-2 md:p-3 bg-background text-foreground" /></FormControl><FormMessage className="text-xs" /></FormItem>)} />
                  <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel className="text-foreground font-medium text-sm">Email Address</FormLabel><FormControl><Input type="email" placeholder="your@email.com" {...field} className="w-full p-2 md:p-3 bg-background text-foreground" /></FormControl><FormMessage className="text-xs" /></FormItem>)} />
                  <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel className="text-foreground font-medium text-sm">Phone Number</FormLabel><FormControl><Input type="tel" placeholder="+1 (555) 123-4567" {...field} className="w-full p-2 md:p-3 bg-background text-foreground" /></FormControl><FormMessage className="text-xs" /></FormItem>)} />
                  <FormField control={form.control} name="passportNumber" render={({ field }) => (<FormItem className="md:col-span-2"><FormLabel className="text-foreground font-medium text-sm">Passport/ID Number</FormLabel><FormControl><Input placeholder="A1234567" {...field} className="w-full p-2 md:p-3 bg-background text-foreground" /></FormControl><FormMessage className="text-xs" /></FormItem>)} />
                  
                  <FormField
                    control={form.control}
                    name="nationality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground font-medium text-sm">Nationality</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""} // Ensure it's controlled
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
                  
                  <FormField
                    control={form.control}
                    name="birthdate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-foreground font-medium text-sm mb-1">Date of Birth</FormLabel>
                        <div className="flex items-center space-x-2">
                          <Input
                            type="text"
                            placeholder="DD-MM-YYYY"
                            value={birthdateInputText}
                            onChange={(e) => {
                                let currentInput = e.target.value;
                                const digitsOnly = currentInput.replace(/[^\d/]/g, "");
                                let formattedInput = "";
                                if (digitsOnly.length > birthdateInputText.replace(/\//g, "").length && 
                                    (digitsOnly.replace(/\//g, "").length === 2 || digitsOnly.replace(/\//g, "").length === 4) &&
                                    !digitsOnly.endsWith('/')) {
                                    const existingSlashes = (digitsOnly.match(/\//g) || []).length;
                                    if ((digitsOnly.replace(/\//g, "").length === 2 && existingSlashes < 1) ||
                                        (digitsOnly.replace(/\//g, "").length === 4 && existingSlashes < 2)) {
                                      formattedInput = digitsOnly + "/";
                                    } else {
                                      formattedInput = digitsOnly;
                                    }
                                } else {
                                    formattedInput = digitsOnly;
                                }
                                formattedInput = formattedInput.substring(0, 10);
                                setBirthdateInputText(formattedInput);

                                const parsedFromDisplay = parse(formattedInput, "dd-MM-yyyy", new Date());
                                if (isValid(parsedFromDisplay)) {
                                    field.onChange(format(parsedFromDisplay, "yyyy-MM-dd"));
                                } else {
                                    field.onChange(formattedInput);
                                }
                            }}
                            onBlur={() => {
                                const finalInput = birthdateInputText;
                                const parsedAs_dd_MM_yyyy = parse(finalInput, "dd-MM-yyyy", new Date());
                                const parsedAs_MM_dd_yyyy = parse(finalInput, "MM/dd/yyyy", new Date());
                                const parsedAs_yyyy_MM_dd = parse(finalInput, "yyyy-MM-dd", new Date());

                                if (isValid(parsedAs_dd_MM_yyyy)) {
                                    field.onChange(format(parsedAs_dd_MM_yyyy, "yyyy-MM-dd"));
                                } else if (isValid(parsedAs_MM_dd_yyyy)) {
                                    field.onChange(format(parsedAs_MM_dd_yyyy, "yyyy-MM-dd"));
                                } else if (isValid(parsedAs_yyyy_MM_dd)) {
                                     field.onChange(format(parsedAs_yyyy_MM_dd, "yyyy-MM-dd"));
                                }
                            }}
                            className="w-full p-2 md:p-3 bg-background text-foreground"
                          />
                          <Popover open={isBirthdatePopoverOpen} onOpenChange={setIsBirthdatePopoverOpen}>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="px-3" aria-label="Open date picker">
                                <CalendarIcon className="h-4 w-4" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent 
                              className="w-auto p-0 bg-popover text-popover-foreground border-border"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={field.value && isValid(parse(field.value, "yyyy-MM-dd", new Date())) ? parse(field.value, "yyyy-MM-dd", new Date()) : undefined}
                                onSelect={(date) => {
                                  const newValue = date ? format(date, "yyyy-MM-dd") : "";
                                  field.onChange(newValue);
                                  setIsBirthdatePopoverOpen(false);
                                }}
                                disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                fromDate={new Date(1900, 0, 1)}
                                toDate={new Date()}
                                defaultMonth={getDefaultCalendarMonth(field.value)}
                                captionLayout="dropdown"
                                fromYear={1900}
                                toYear={new Date().getFullYear()}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="mt-6 md:mt-8 flex flex-col md:flex-row justify-between">
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