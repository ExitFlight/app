import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Airport schema
export const airports = pgTable("airports", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  city: text("city").notNull(),
  country: text("country").notNull(),
  region: text("region").notNull(),
});

export const insertAirportSchema = createInsertSchema(airports).pick({
  code: true,
  name: true,
  city: true,
  country: true,
  region: true,
});

// Airline schema
export const airlines = pgTable("airlines", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  logo: text("logo").notNull(),
  region: text("region").notNull(),
});

export const insertAirlineSchema = createInsertSchema(airlines).pick({
  code: true,
  name: true,
  logo: true,
  region: true,
});

// Flight schema
export const flights = pgTable("flights", {
  id: serial("id").primaryKey(),
  flightNumber: text("flight_number").notNull(),
  airlineId: integer("airline_id").notNull(),
  departureAirportId: integer("departure_airport_id").notNull(),
  arrivalAirportId: integer("arrival_airport_id").notNull(),
  departureTime: text("departure_time").notNull(),
  arrivalTime: text("arrival_time").notNull(),
  duration: text("duration").notNull(),
  price: text("price").notNull(),
  class: text("class").notNull(),
});

export const insertFlightSchema = createInsertSchema(flights).pick({
  flightNumber: true,
  airlineId: true,
  departureAirportId: true,
  arrivalAirportId: true,
  departureTime: true,
  arrivalTime: true,
  duration: true,
  price: true,
  class: true,
});

// Passenger schema
export const passengers = pgTable("passengers", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  passportNumber: text("passport_number").notNull(),
  nationality: text("nationality").notNull(),
  birthdate: text("birthdate").notNull(),
});

export const insertPassengerSchema = createInsertSchema(passengers).pick({
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  passportNumber: true,
  nationality: true,
  birthdate: true,
});

// Ticket schema
export const tickets = pgTable("tickets", {
  id: serial("id").primaryKey(),
  flightId: integer("flight_id").notNull(),
  passengerId: integer("passenger_id").notNull(),
  seatNumber: text("seat_number").notNull(),
  bookingReference: text("booking_reference").notNull(),
  gate: text("gate").notNull(),
  boardingTime: text("boarding_time").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTicketSchema = createInsertSchema(tickets).pick({
  flightId: true,
  passengerId: true,
  seatNumber: true,
  bookingReference: true,
  gate: true,
  boardingTime: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertAirport = z.infer<typeof insertAirportSchema>;
export type Airport = typeof airports.$inferSelect;

export type InsertAirline = z.infer<typeof insertAirlineSchema>;
export type Airline = typeof airlines.$inferSelect;

export type InsertFlight = z.infer<typeof insertFlightSchema>;
export type Flight = typeof flights.$inferSelect;

export type InsertPassenger = z.infer<typeof insertPassengerSchema>;
export type Passenger = typeof passengers.$inferSelect;

export type InsertTicket = z.infer<typeof insertTicketSchema>;
export type Ticket = typeof tickets.$inferSelect;

// Combined types for API responses
export type FlightWithDetails = {
  id: number;
  flightNumber: string;
  airline: {
    id: number;
    code: string;
    name: string;
    logo: string;
    region: string;
  };
  departure: {
    airport: {
      id: number;
      code: string;
      name: string;
      city: string;
      country: string;
    };
    time: string;
  };
  arrival: {
    airport: {
      id: number;
      code: string;
      name: string;
      city: string;
      country: string;
    };
    time: string;
  };
  duration: string;
  price: string;
  class: string;
};

export type TicketWithDetails = {
  id: number;
  flight: FlightWithDetails;
  passenger: Passenger;
  seatNumber: string;
  bookingReference: string;
  gate: string;
  boardingTime: string;
  createdAt: Date;
};

// Form schemas for validation
export const flightSearchSchema = z.object({
  departureAirport: z.string().min(3, "Please select a departure city"),
  arrivalAirport: z.string().min(3, "Please select an arrival city"),
  departureDate: z.string().min(10, "Please select a date"),
  departureTime: z.string().min(1, "Please select a time"),
});

export type FlightSearchForm = z.infer<typeof flightSearchSchema>;

export const passengerDetailsSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  passportNumber: z.string().min(4, "Passport/ID number is required"),
  nationality: z.string().min(2, "Nationality is required"),
  birthdate: z.string().min(10, "Date of birth is required"),
});

export type PassengerDetailsForm = z.infer<typeof passengerDetailsSchema>;

export const ticketDeliverySchema = z.object({
  sendEmail: z.boolean().optional(),
  downloadPdf: z.boolean().optional(),
});

export type TicketDeliveryForm = z.infer<typeof ticketDeliverySchema>;
