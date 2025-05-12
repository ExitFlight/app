import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  flightSearchSchema, 
  insertPassengerSchema, 
  insertTicketSchema, 
  ticketDeliverySchema
} from "@shared/schema";
import { generateTicketPdf } from "./utils/pdf-generator";
import { sendTicketEmail } from "./utils/email-sender";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all airports
  app.get("/api/airports", async (req: Request, res: Response) => {
    const airports = await storage.getAllAirports();
    
    // If region query parameter is provided, filter by region
    const region = req.query.region as string | undefined;
    if (region) {
      const filteredAirports = airports.filter(airport => airport.region === region);
      return res.json(filteredAirports);
    }
    
    res.json(airports);
  });
  
  // Get airports grouped by region
  app.get("/api/airports/regions", async (req: Request, res: Response) => {
    const airports = await storage.getAllAirports();
    
    // Group airports by region
    const regionsSet = new Set<string>();
    airports.forEach(airport => regionsSet.add(airport.region));
    const regions = Array.from(regionsSet).sort();
    
    const airportsByRegion = regions.map(region => {
      return {
        region,
        airports: airports.filter(airport => airport.region === region)
      };
    });
    
    res.json(airportsByRegion);
  });

  // Get all airlines
  app.get("/api/airlines", async (req: Request, res: Response) => {
    const airlines = await storage.getAllAirlines();
    
    // If region query parameter is provided, filter by region
    const region = req.query.region as string | undefined;
    if (region) {
      const filteredAirlines = airlines.filter(airline => airline.region === region);
      return res.json(filteredAirlines);
    }
    
    res.json(airlines);
  });
  
  // Get airlines grouped by region
  app.get("/api/airlines/regions", async (req: Request, res: Response) => {
    const airlines = await storage.getAllAirlines();
    
    // Group airlines by region
    const regionsSet = new Set<string>();
    airlines.forEach(airline => regionsSet.add(airline.region));
    const regions = Array.from(regionsSet).sort();
    
    const airlinesByRegion = regions.map(region => {
      return {
        region,
        airlines: airlines.filter(airline => airline.region === region)
      };
    });
    
    res.json(airlinesByRegion);
  });

  // Search flights
  app.get("/api/flights/search", async (req: Request, res: Response) => {
    try {
      const searchParams = {
        departureAirportCode: req.query.departureAirport as string,
        arrivalAirportCode: req.query.arrivalAirport as string,
        date: req.query.departureDate as string,
        time: req.query.departureTime as string,
      };

      // Validate search parameters
      const validatedParams = flightSearchSchema.parse({
        departureAirport: searchParams.departureAirportCode,
        arrivalAirport: searchParams.arrivalAirportCode,
        departureDate: searchParams.date,
        departureTime: searchParams.time,
      });

      const flights = await storage.searchFlights(searchParams);
      res.json(flights);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid search parameters", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to search flights" });
    }
  });

  // Get flight by ID
  app.get("/api/flights/:id", async (req: Request, res: Response) => {
    const flightId = Number(req.params.id);
    if (isNaN(flightId)) {
      return res.status(400).json({ message: "Invalid flight ID" });
    }

    const flight = await storage.getFlightWithDetails(flightId);
    if (!flight) {
      return res.status(404).json({ message: "Flight not found" });
    }

    res.json(flight);
  });

  // Create passenger
  app.post("/api/passengers", async (req: Request, res: Response) => {
    try {
      const passengerData = insertPassengerSchema.parse(req.body);
      const passenger = await storage.createPassenger(passengerData);
      res.status(201).json(passenger);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid passenger data", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create passenger" });
    }
  });

  // Create ticket
  app.post("/api/tickets", async (req: Request, res: Response) => {
    try {
      const ticketData = insertTicketSchema.parse(req.body);
      
      // Generate boarding time (30 minutes before departure)
      const flight = await storage.getFlight(ticketData.flightId);
      if (!flight) {
        return res.status(404).json({ message: "Flight not found" });
      }

      // Generate a random seat number if not provided
      if (!ticketData.seatNumber) {
        const rowNum = Math.floor(Math.random() * 30) + 1;
        const seatLetter = ["A", "B", "C", "D", "E", "F"][Math.floor(Math.random() * 6)];
        ticketData.seatNumber = `${rowNum}${seatLetter}`;
      }

      // Generate a random booking reference if not provided
      if (!ticketData.bookingReference) {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let bookingRef = "";
        for (let i = 0; i < 6; i++) {
          bookingRef += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        ticketData.bookingReference = bookingRef;
      }

      // Generate a random gate if not provided
      if (!ticketData.gate) {
        const gateLetters = ["A", "B", "C", "D"];
        const gateLetter = gateLetters[Math.floor(Math.random() * gateLetters.length)];
        const gateNumber = Math.floor(Math.random() * 40) + 1;
        ticketData.gate = `${gateLetter}${gateNumber}`;
      }

      // Calculate boarding time (30 minutes before departure)
      const [hours, minutes] = flight.departureTime.split(':').map(Number);
      let boardingHours = hours;
      let boardingMinutes = minutes - 30;
      
      if (boardingMinutes < 0) {
        boardingMinutes += 60;
        boardingHours -= 1;
        if (boardingHours < 0) {
          boardingHours += 24;
        }
      }
      
      const formattedBoardingHours = boardingHours.toString().padStart(2, '0');
      const formattedBoardingMinutes = boardingMinutes.toString().padStart(2, '0');
      ticketData.boardingTime = `${formattedBoardingHours}:${formattedBoardingMinutes}`;

      const ticket = await storage.createTicket(ticketData);
      res.status(201).json(ticket);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid ticket data", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create ticket" });
    }
  });

  // Get ticket by ID
  app.get("/api/tickets/:id", async (req: Request, res: Response) => {
    const ticketId = Number(req.params.id);
    if (isNaN(ticketId)) {
      return res.status(400).json({ message: "Invalid ticket ID" });
    }

    const ticket = await storage.getTicketWithDetails(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.json(ticket);
  });

  // Generate and download ticket as PDF
  app.get("/api/tickets/:id/pdf", async (req: Request, res: Response) => {
    const ticketId = Number(req.params.id);
    if (isNaN(ticketId)) {
      return res.status(400).json({ message: "Invalid ticket ID" });
    }

    const ticket = await storage.getTicketWithDetails(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    try {
      const pdfBuffer = await generateTicketPdf(ticket);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=ticket-${ticket.bookingReference}.pdf`);
      res.send(pdfBuffer);
    } catch (error) {
      console.error("PDF generation error:", error);
      res.status(500).json({ message: "Failed to generate PDF" });
    }
  });

  // Send ticket by email
  app.post("/api/tickets/:id/email", async (req: Request, res: Response) => {
    const ticketId = Number(req.params.id);
    if (isNaN(ticketId)) {
      return res.status(400).json({ message: "Invalid ticket ID" });
    }

    const ticket = await storage.getTicketWithDetails(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    try {
      const result = await sendTicketEmail(ticket);
      res.json({ message: "Email sent successfully", ...result });
    } catch (error) {
      console.error("Email sending error:", error);
      res.status(500).json({ message: "Failed to send email" });
    }
  });

  // Send ticket to passenger (email and/or PDF)
  app.post("/api/tickets/:id/deliver", async (req: Request, res: Response) => {
    try {
      const ticketId = Number(req.params.id);
      if (isNaN(ticketId)) {
        return res.status(400).json({ message: "Invalid ticket ID" });
      }

      const delivery = ticketDeliverySchema.parse(req.body);
      const ticket = await storage.getTicketWithDetails(ticketId);
      
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }

      const result: { emailSent?: boolean; pdfGenerated?: boolean } = {};

      if (delivery.sendEmail) {
        try {
          await sendTicketEmail(ticket);
          result.emailSent = true;
        } catch (error) {
          console.error("Email sending error:", error);
          result.emailSent = false;
        }
      }

      if (delivery.downloadPdf) {
        try {
          const pdfBuffer = await generateTicketPdf(ticket);
          result.pdfGenerated = true;
          // We don't actually send the PDF here because this endpoint
          // is for recording delivery preferences, not actual delivery
        } catch (error) {
          console.error("PDF generation error:", error);
          result.pdfGenerated = false;
        }
      }

      res.json({ 
        message: "Ticket delivery processed",
        ...result
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid delivery options", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to process ticket delivery" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
