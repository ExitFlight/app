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
import { ArrowLeft, ArrowRight, CalendarIcon } from "lucide-react";
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
  { value: "us", label: "United States" },
  { value: "ca", label: "Canada" },
  { value: "uk", label: "United Kingdom" },
  { value: "fr", label: "France" },
  { value: "de", label: "Germany" },
  { value: "au", label: "Australia" },
  { value: "es", label: "Spain" },
  { value: "it", label: "Italy" },
  { value: "jp", label: "Japan" },
  { value: "br", label: "Brazil" },
];

const PassengerDetails = () => {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const { selectedFlight, passengerDetails, setPassengerDetails } = useFlightContext();
  const [isBirthdatePopoverOpen, setIsBirthdatePopoverOpen] = useState(false);

  const form = useForm<PassengerDetailsForm>({
    resolver: zodResolver(passengerDetailsSchema),
    defaultValues: {
      firstName: passengerDetails?.firstName || "",
      lastName: passengerDetails?.lastName || "",
      email: passengerDetails?.email || "",
      phone: passengerDetails?.phone || "",
      passportNumber: passengerDetails?.passportNumber || "",
      nationality: passengerDetails?.nationality || "",
      birthdate: passengerDetails?.birthdate 
        ? (typeof passengerDetails.birthdate === 'string' 
            ? passengerDetails.birthdate // Assume it's already yyyy-MM-dd if string
            : format(new Date(passengerDetails.birthdate), "yyyy-MM-dd")) 
        : "", // Stored as yyyy-MM-dd
    },
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
  }, [selectedFlight, navigate, toast]);
  
  const goBack = () => {
    navigate("/select-flight");
  };

  const onSubmit = (data: PassengerDetailsForm) => {
    // data.birthdate will be in "yyyy-MM-dd" format here
    setPassengerDetails(data);
    navigate("/preview");
  };

  const getDefaultCalendarMonth = (fieldValue?: string) => {
    if (fieldValue) { // fieldValue is yyyy-MM-dd
      const d = parse(fieldValue, "yyyy-MM-dd", new Date());
      if (isValid(d)) return d;
    }
    const thirtyYearsAgo = new Date();
    thirtyYearsAgo.setFullYear(thirtyYearsAgo.getFullYear() - 30);
    return thirtyYearsAgo;
  };

  // State for the text input to allow free typing before parsing
  const [birthdateInputText, setBirthdateInputText] = useState(() => {
    const initialBirthdate = passengerDetails?.birthdate 
        ? (typeof passengerDetails.birthdate === 'string' 
            ? passengerDetails.birthdate 
            : format(new Date(passengerDetails.birthdate), "yyyy-MM-dd")) 
        : "";
    return initialBirthdate ? format(parse(initialBirthdate, "yyyy-MM-dd", new Date()), "dd-MM-yyyy") : "";
  });

  // Sync react-hook-form state with local input text state when form value changes (e.g. from calendar)
  useEffect(() => {
    const formBirthdate = form.getValues("birthdate"); // This is yyyy-MM-dd
    if (formBirthdate) {
        const parsedForDisplay = parse(formBirthdate, "yyyy-MM-dd", new Date());
        if (isValid(parsedForDisplay)) {
            setBirthdateInputText(format(parsedForDisplay, "dd-MM-yyyy"));
        } else {
            setBirthdateInputText(formBirthdate); // Or "" if it's invalid
        }
    } else {
        setBirthdateInputText("");
    }
  }, [form.watch("birthdate")]);


  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <ProgressStepper currentStep={2} />
      <div className="max-w-3xl mx-auto">
        <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6 text-foreground">Passenger Details</h2>
        <Card className="mb-6 md:mb-8 border-border bg-card"> {/* Ensure card itself is dark */}
          <CardContent className="p-4 md:p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {/* Other fields ... */}
                  <FormField control={form.control} name="firstName" render={({ field }) => (<FormItem><FormLabel className="text-foreground font-medium text-sm">First Name</FormLabel><FormControl><Input placeholder="John" {...field} className="w-full p-2 md:p-3 bg-background text-foreground" /></FormControl><FormMessage className="text-xs" /></FormItem>)} />
                  <FormField control={form.control} name="lastName" render={({ field }) => (<FormItem><FormLabel className="text-foreground font-medium text-sm">Last Name</FormLabel><FormControl><Input placeholder="Doe" {...field} className="w-full p-2 md:p-3 bg-background text-foreground" /></FormControl><FormMessage className="text-xs" /></FormItem>)} />
                  <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel className="text-foreground font-medium text-sm">Email Address</FormLabel><FormControl><Input type="email" placeholder="your@email.com" {...field} className="w-full p-2 md:p-3 bg-background text-foreground" /></FormControl><FormMessage className="text-xs" /></FormItem>)} />
                  <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel className="text-foreground font-medium text-sm">Phone Number</FormLabel><FormControl><Input type="tel" placeholder="+1 (555) 123-4567" {...field} className="w-full p-2 md:p-3 bg-background text-foreground" /></FormControl><FormMessage className="text-xs" /></FormItem>)} />
                  <FormField control={form.control} name="passportNumber" render={({ field }) => (<FormItem className="md:col-span-2"><FormLabel className="text-foreground font-medium text-sm">Passport/ID Number</FormLabel><FormControl><Input placeholder="A1234567" {...field} className="w-full p-2 md:p-3 bg-background text-foreground" /></FormControl><FormMessage className="text-xs" /></FormItem>)} />
                  <FormField control={form.control} name="nationality" render={({ field }) => (<FormItem><FormLabel className="text-foreground font-medium text-sm">Nationality</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="w-full bg-background text-foreground"><SelectValue placeholder="Select nationality" /></SelectTrigger></FormControl><SelectContent>{/* PopoverContent for Select also needs dark theme */ nationalities.map((n) => (<SelectItem key={n.value} value={n.value}>{n.label}</SelectItem>))}</SelectContent></Select><FormMessage className="text-xs" /></FormItem>)} />
                  
                  <FormField
                    control={form.control}
                    name="birthdate" // This will store "yyyy-MM-dd"
                    render={({ field }) => ( // field.value here is "yyyy-MM-dd"
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-foreground font-medium text-sm mb-1">Date of Birth</FormLabel>
                        <div className="flex items-center space-x-2">
                          <Input
                            type="text"
                            placeholder="DD-MM-YYYY" // Visual placeholder
                            value={birthdateInputText} // Display formatted text or raw input
                            onChange={(e) => {
                                let currentInput = e.target.value;
                                // Remove non-digit characters except for slashes to allow backspacing slashes
                                const digitsOnly = currentInput.replace(/[^\d/]/g, "");
                                
                                let formattedInput = "";
                                if (digitsOnly.length > birthdateInputText.length && // Check if adding characters
                                    (digitsOnly.replace(/\//g, "").length === 2 || digitsOnly.replace(/\//g, "").length === 4) &&
                                    !digitsOnly.endsWith('/')) {
                                    // Add slash after DD or MM (if not already there)
                                    // Count existing slashes to avoid double slashes
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
                                // Limit length to DD/MM/YYYY (10 chars)
                                formattedInput = formattedInput.substring(0, 10);
                                setBirthdateInputText(formattedInput);

                                // Try to parse and update RHF if it's a full valid date in DD-MM-YYYY
                                const parsedFromDisplay = parse(formattedInput, "dd-MM-yyyy", new Date());
                                if (isValid(parsedFromDisplay)) {
                                    field.onChange(format(parsedFromDisplay, "yyyy-MM-dd")); // Store as yyyy-MM-dd
                                } else {
                                    field.onChange(formattedInput); // Pass formatted input for Zod validation
                                }
                            }}
                            onBlur={() => {
                                // On blur, try to parse what's in birthdateInputText and standardize to YYYY-MM-DD for RHF
                                const finalInput = birthdateInputText;
                                const parsedAs_dd_MM_yyyy = parse(finalInput, "dd-MM-yyyy", new Date());
                                const parsedAs_MM_dd_yyyy = parse(finalInput, "MM/dd/yyyy", new Date());
                                const parsedAs_yyyy_MM_dd = parse(finalInput, "yyyy-MM-dd", new Date());

                                if (isValid(parsedAs_dd_MM_yyyy)) {
                                    field.onChange(format(parsedAs_dd_MM_yyyy, "yyyy-MM-dd"));
                                } else if (isValid(parsedAs_MM_dd_yyyy)) {
                                    field.onChange(format(parsedAs_MM_dd_yyyy, "yyyy-MM-dd"));
                                } else if (isValid(parsedAs_yyyy_MM_dd)) {
                                     field.onChange(format(parsedAs_yyyy_MM_dd, "yyyy-MM-dd")); // Already in correct format
                                } else {
                                    // If still not valid, RHF field will hold the invalid string, Zod will catch it.
                                    // You could also choose to clear it or set RHF field.value to "" if invalid
                                    // field.onChange(""); // Example: clear if invalid on blur
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
                              className="w-auto p-0 bg-popover text-popover-foreground border-border" // Default shadcn popover styles should respect theme
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                // Calendar always gets selected date from RHF field.value (yyyy-MM-dd)
                                selected={field.value ? parse(field.value, "yyyy-MM-dd", new Date()) : undefined}
                                onSelect={(date) => {
                                  const newValue = date ? format(date, "yyyy-MM-dd") : "";
                                  field.onChange(newValue); // Update RHF (stores yyyy-MM-dd)
                                  // The useEffect watching field.value will update birthdateInputText
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