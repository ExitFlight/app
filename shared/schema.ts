import { pgTable, text, serial, integer, boolean, timestamp, date as pgDate, time as pgTime, numeric } from "drizzle-orm/pg-core";
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
  latitude: numeric("latitude"), // Or numeric("latitude", { precision: 9, scale: 6 }) for more control
  longitude: numeric("longitude"), // Or numeric("longitude", { precision: 9, scale: 6 })
});

export const insertAirportSchema = createInsertSchema(airports).pick({
  code: true,
  name: true,
  city: true,
  country: true,
  region: true,
  latitude: true, // Add to insert schema if you plan to insert them
  longitude: true, // Add to insert schema if you plan to insert them
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
  airlineId: integer("airline_id")
    .notNull()
    .references(() => airlines.id, { onDelete: "cascade" }), // Added foreign key
  departureAirportId: integer("departure_airport_id")
    .notNull()
    .references(() => airports.id, { onDelete: "cascade" }), // Added foreign key
  arrivalAirportId: integer("arrival_airport_id")
    .notNull()
    .references(() => airports.id, { onDelete: "cascade" }), // Added foreign key
  departureDate: pgDate("departure_date").notNull(), // Assuming you store date separately
  departureTime: pgTime("departure_time").notNull(), // Using pgTime for HH:MM:SS
  arrivalDate: pgDate("arrival_date").notNull(),   // Assuming you store date separately
  arrivalTime: pgTime("arrival_time").notNull(),   // Using pgTime for HH:MM:SS
  duration: text("duration").notNull(),
  price: integer("price").notNull(), // Storing price in cents
  class: text("class").notNull(),
  // Consider adding created_at and updated_at timestamps
  // createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  // updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertFlightSchema = createInsertSchema(flights).pick({
  flightNumber: true,
  airlineId: true,
  departureAirportId: true,
  arrivalAirportId: true,
  departureDate: true,
  departureTime: true,
  arrivalDate: true,
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
  phone: text("phone"), // nullable by default in drizzle
  passportNumber: text("passport_number").notNull(),
  nationality: text("nationality").notNull(),
  birthdate: pgDate("birthdate").notNull(), // Using pgDate
  // Consider adding created_at and updated_at timestamps
  // createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  // updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
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
  flightId: integer("flight_id")
    .notNull()
    .references(() => flights.id, { onDelete: "cascade" }), // Added foreign key
  passengerId: integer("passenger_id")
    .notNull()
    .references(() => passengers.id, { onDelete: "cascade" }), // Added foreign key
  seatNumber: text("seat_number").notNull(),
  bookingReference: text("booking_reference").notNull(),
  gate: text("gate").notNull(),
  boardingTime: pgTime("boarding_time").notNull(), // Using pgTime
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
      latitude?: string | number | null; // Reflecting numeric type from schema
      longitude?: string | number | null; // Reflecting numeric type from schema
    };
    time: string;
    date: string; // Added date
  };
  arrival: {
    airport: {
      id: number;
      code: string;
      name: string;
      city: string;
      country: string;
      latitude?: string | number | null; // Reflecting numeric type from schema
      longitude?: string | number | null; // Reflecting numeric type from schema
    };
    time: string;
    date: string; // Added date
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
  departureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"), // Example regex
  departureTime: z.string().regex(/^\d{2}:\d{2}$/, "Time must be HH:MM"), // Example regex
  flightId: z.number().optional(),
  calculatedFlightData: z.any().optional(),
});

export type FlightSearchForm = z.infer<typeof flightSearchSchema>;

export const passengerDetailsSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  passportNumber: z.string().min(4, "Passport/ID number is required"),
  nationality: z.string().min(2, "Nationality is required"),
  birthdate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date of birth must be YYYY-MM-DD"), // Example regex
});

export type PassengerDetailsForm = z.infer<typeof passengerDetailsSchema>;

export const ticketDeliverySchema = z.object({
  sendEmail: z.boolean().optional(),
  downloadPdf: z.boolean().optional(),
});

export type TicketDeliveryForm = z.infer<typeof ticketDeliverySchema>;
