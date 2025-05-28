// /home/jordan/Desktop/FlightBack/server/routes.ts
import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  flightSearchSchema,
  insertPassengerSchema,
  insertTicketSchema,
  ticketDeliverySchema,
  apiCreateTicketPayloadSchema, // Import the new schema
  type InsertTicket, // Import this type for clarity
} from "@shared/schema";
import { generateTicketPdf } from "./utils/pdf-generator"; // Ensure this path is correct
import { sendTicketEmail } from "./utils/email-sender";   // Ensure this path is correct
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
    airports.forEach(airport => {
      if (airport.region) regionsSet.add(airport.region); // Ensure region is not null/undefined
    });
    const regions = Array.from(regionsSet).sort();

    const airportsByRegion = regions.map(region => {
      return {
        region,
        airports: airports.filter(airport => airport.region === region)
      };
    });

    res.json(airportsByRegion);
  });

  // Get countries by region
  app.get("/api/countries/by-region/:region", async (req: Request, res: Response) => {
    const { region } = req.params;
    const airports = await storage.getAllAirports();

    // Filter airports by the selected region
    const airportsInRegion = airports.filter(airport =>
      region === "all" ? true : airport.region === region
    );

    // Get unique countries from the filtered airports
    const countries = Array.from(
      new Set(airportsInRegion.map(airport => airport.country))
    ).sort();

    res.json(countries);
  });

  // Get airports by country
  app.get("/api/airports/by-country/:country", async (req: Request, res: Response) => {
    const { country } = req.params;
    const airports = await storage.getAllAirports();

    // Filter airports by the selected country
    const airportsInCountry = airports.filter(airport => airport.country === country);

    res.json(airportsInCountry);
  });

  // Get airports by city
  app.get("/api/airports/by-city/:city", async (req: Request, res: Response) => {
    const { city } = req.params;
    const airports = await storage.getAllAirports();

    // Case-insensitive partial match for city names
    const filteredAirports = airports.filter(airport =>
      airport.city.toLowerCase().includes(city.toLowerCase())
    );

    if (filteredAirports.length === 0) {
      // If no exact match, try to find airports with similar city names
      const similarAirports = airports.filter(airport =>
        airport.city.toLowerCase().includes(city.split(' ')[0].toLowerCase())
      );

      if (similarAirports.length > 0) {
        return res.json(similarAirports);
      }

      return res.status(404).json({ error: `No airports found for city: ${city}` });
    }

    res.json(filteredAirports);
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
    airlines.forEach(airline => {
      if (airline.region) regionsSet.add(airline.region); // Ensure region is not null/undefined
    });
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
        date: req.query.departureDate as string, // This is departureDate
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
      console.error("Error searching flights:", error);
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
    console.log("[SERVER /api/passengers] Received req.body:", JSON.stringify(req.body, null, 2));
    try {
      const passengerData = insertPassengerSchema.parse(req.body);
      console.log("[SERVER /api/passengers] Parsed passengerData for storage:", JSON.stringify(passengerData, null, 2));
      const passenger = await storage.createPassenger(passengerData);
      res.status(201).json(passenger);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid passenger data",
          errors: error.errors
        });
      }
      console.error("Error creating passenger:", error);
      res.status(500).json({ message: "Failed to create passenger" });
    }
  });

  // Create ticket
  app.post("/api/tickets", async (req: Request, res: Response) => {
    try {
      // Validate the incoming payload against the new schema
      const payload = apiCreateTicketPayloadSchema.parse(req.body);
      const { passengerId, flightDetails } = payload;
      console.log("[POST /api/tickets] Received payload:", JSON.stringify(payload, null, 2));

      // 1. Find or create Airline
      console.log("[POST /api/tickets] Finding/creating airline:", JSON.stringify(flightDetails.airline, null, 2));
      const airline = await storage.findOrCreateAirline(flightDetails.airline);
      console.log("[POST /api/tickets] Airline result:", JSON.stringify(airline, null, 2));

      // 2. Find or create Departure Airport
      console.log("[POST /api/tickets] Finding/creating departure airport:", JSON.stringify(flightDetails.departure.airport, null, 2));
      const departureAirport = await storage.findOrCreateAirport(flightDetails.departure.airport);
      console.log("[POST /api/tickets] Departure airport result:", JSON.stringify(departureAirport, null, 2));

      // 3. Find or create Arrival Airport
      console.log("[POST /api/tickets] Finding/creating arrival airport:", JSON.stringify(flightDetails.arrival.airport, null, 2));
      const arrivalAirport = await storage.findOrCreateAirport(flightDetails.arrival.airport);
      console.log("[POST /api/tickets] Arrival airport result:", JSON.stringify(arrivalAirport, null, 2));

      // 4. Find or create Flight
      const flightInputForStorage = {
        flightNumber: flightDetails.flightNumber,
        airlineId: airline.id,
        departureAirportId: departureAirport.id,
        arrivalAirportId: arrivalAirport.id,
        departureDate: flightDetails.departure.date,
        departureTime: flightDetails.departure.time,
        arrivalDate: flightDetails.arrival.date,
        arrivalTime: flightDetails.arrival.time,
        duration: flightDetails.duration,
        // price: parseInt(flightDetails.price.replace('$', ''), 10) * 100, // REMOVED
        class: flightDetails.class,
      };
      console.log("[POST /api/tickets] Finding/creating flight with input:", JSON.stringify(flightInputForStorage, null, 2));
      const flight = await storage.findOrCreateFlight({
        ...flightInputForStorage
      });
      console.log("[POST /api/tickets] Flight result:", JSON.stringify(flight, null, 2));

      if (!flight) {
        return res.status(500).json({ message: "Failed to find or create flight record" });
      }

      // 5. Generate ticket-specific details
      const rowNum = Math.floor(Math.random() * 30) + 1;
      const seatLetter = ["A", "B", "C", "D", "E", "F"][Math.floor(Math.random() * 6)];
      const seatNumber = `${rowNum}${seatLetter}`;

      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let bookingReference = "";
      for (let i = 0; i < 6; i++) {
        bookingReference += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      const gateLetters = ["A", "B", "C", "D"];
      const gateLetter = gateLetters[Math.floor(Math.random() * gateLetters.length)];
      const gateNumber = Math.floor(Math.random() * 40) + 1;
      const gate = `${gateLetter}${gateNumber}`;

      const [hours, minutes] = flightDetails.departure.time.split(':').map(Number);
      let boardingHours = hours;
      let boardingMinutes = minutes - 30; // Fixed 30 min offset

      if (boardingMinutes < 0) {
        boardingMinutes += 60;
        boardingHours -= 1;
        if (boardingHours < 0) {
          boardingHours += 24;
        }
      }
      const formattedBoardingHours = boardingHours.toString().padStart(2, '0');
      const formattedBoardingMinutes = boardingMinutes.toString().padStart(2, '0');
      const boardingTime = `${formattedBoardingHours}:${formattedBoardingMinutes}`;

      // 6. Prepare data for insertTicketSchema
      const ticketDataForDb: InsertTicket = {
        flightId: flight.id,
        passengerId: passengerId,
        seatNumber,
        bookingReference,
        gate,
        boardingTime,
      };

      console.log("[POST /api/tickets] Creating ticket with data:", JSON.stringify(ticketDataForDb, null, 2));
      const ticket = await storage.createTicket(ticketDataForDb);
      res.status(201).json(ticket);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid ticket data or payload structure",
          errors: error.errors
        });
      }
      console.error("Error creating ticket:", error);
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
 console.log("[SERVER /api/tickets/:id/pdf] ticket.passenger data for PDF:", JSON.stringify(ticket.passenger, null, 2));
    try {
      const pdfBuffer = await generateTicketPdf(ticket); // generateTicketPdf expects TicketWithDetails

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
        result.pdfGenerated = true; // Indicates preference was noted
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
      console.error("Error processing ticket delivery:", error);
      res.status(500).json({ message: "Failed to process ticket delivery" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
