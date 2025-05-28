// /home/jordan/Desktop/FlightBack/shared/schema.ts
import { pgTable, serial, text, integer, timestamp, pgSchema, date as pgDate, time as pgTime, boolean } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { isValid, parse } from 'date-fns'; // Import for birthdate validation

// Optional: Define a PostgreSQL schema if you use one (e.g., 'public')
// export const flightSchema = pgSchema("flights_app");

// Tables
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const airports = pgTable("airports", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  city: text("city").notNull(),
  country: text("country").notNull(),
  region: text("region"),
  latitude: text("latitude"),
  longitude: text("longitude"),
});

export const airlines = pgTable("airlines", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  logo: text("logo"),
  region: text("region"),
});

export const flights = pgTable("flights", {
  id: serial("id").primaryKey(),
  flightNumber: text("flight_number").notNull(),
  airlineId: integer("airline_id").references(() => airlines.id).notNull(),
  departureAirportId: integer("departure_airport_id").references(() => airports.id).notNull(),
  arrivalAirportId: integer("arrival_airport_id").references(() => airports.id).notNull(),
  departureDate: pgDate("departure_date").notNull(),
  departureTime: pgTime("departure_time").notNull(),
  arrivalDate: pgDate("arrival_date").notNull(),
  arrivalTime: pgTime("arrival_time").notNull(),
  duration: text("duration").notNull(),
  class: text("class").notNull(),
});

export const passengers = pgTable("passengers", {
  id: serial("id").primaryKey(),
  title: text("title"), // Added, optional
  firstName: text("first_name").notNull(),
  middleName: text("middle_name"), // Added, optional
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  //passportNumber: text("passport_number"), // Changed to optional (can be null in DB)
  nationality: text("nationality").notNull(),
  //birthdate: pgDate("birthdate").notNull(),
});

export const tickets = pgTable("tickets", {
  id: serial("id").primaryKey(),
  flightId: integer("flight_id").references(() => flights.id).notNull(),
  passengerId: integer("passenger_id").references(() => passengers.id).notNull(),
  seatNumber: text("seat_number").notNull(),
  bookingReference: text("booking_reference").notNull().unique(),
  gate: text("gate").notNull(),
  boardingTime: pgTime("boarding_time").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});


// Zod Schemas for Validation

// Insert Schemas
export const insertUserSchema = createInsertSchema(users);
export const insertAirportSchema = createInsertSchema(airports);
export const insertAirlineSchema = createInsertSchema(airlines);
export const insertFlightSchema = createInsertSchema(flights, {
  departureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Departure date must be YYYY-MM-DD"),
  departureTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "Departure time must be HH:MM or HH:MM:SS"),
  arrivalDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Arrival date must be YYYY-MM-DD"),
  arrivalTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "Arrival time must be HH:MM or HH:MM:SS"),
});

export const insertPassengerSchema = createInsertSchema(passengers, {
  // title, middleName, passportNumber will be optional by default if they are nullable in the table
  email: z.string().email(),
  //birthdate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Birthdate must be YYYY-MM-DD"),
});
// If you need to explicitly make them optional for insert even if notNull in DB (not the case here for title/middleName):
// export const insertPassengerSchema = createInsertSchema(passengers, {
//   title: z.string().optional(),
//   middleName: z.string().optional(),
//   passportNumber: z.string().optional(),
//   email: z.string().email(),
//   birthdate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Birthdate must be YYYY-MM-DD"),
// });


export const insertTicketSchema = createInsertSchema(tickets, {
  boardingTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "Boarding time must be HH:MM or HH:MM:SS"),
});


// Select Schemas
export const selectUserSchema = createSelectSchema(users);
export const selectAirportSchema = createSelectSchema(airports);
export const selectAirlineSchema = createSelectSchema(airlines);
export const selectFlightSchema = createSelectSchema(flights);
export const selectPassengerSchema = createSelectSchema(passengers); // Will include new optional fields
export const selectTicketSchema = createSelectSchema(tickets);


// Custom Schemas for API Payloads / Forms
export const flightSearchSchema = z.object({
  departureAirport: z.string().min(3, "Departure airport code is required"),
  arrivalAirport: z.string().min(3, "Arrival airport code is required"),
  departureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Departure date must be YYYY-MM-DD"),
  departureTime: z.string().regex(/^\d{2}:\d{2}$/, "Departure time must be HH:MM").optional(),
});

// Updated passengerDetailsSchema for the form
export const passengerDetailsSchema = z.object({
  title: z.string().optional(), // Added, optional
  firstName: z.string().min(1, { message: "First name is required." }),
  middleName: z.string().optional(), // Added, optional
  lastName: z.string().min(1, { message: "Last name is required." }),
  email: z.string().email({ message: "Invalid email address." }),
  phone: z.string().optional(),
  // passportNumber: z.string().min(1, "Passport/ID number is required"), // REMOVED from form validation
  nationality: z.string().min(1, { message: "Nationality is required." }),
  // birthdate: z.string()
  //   .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Birthdate must be YYYY-MM-DD." })
  //   .refine(val => isValid(parse(val, "yyyy-MM-dd", new Date())), { message: "Invalid date format." })
  //   .refine(val => {
  //       const date = parse(val, "yyyy-MM-dd", new Date());
  //       return date <= new Date() && date >= new Date("1900-01-01");
  //    }, { message: "Birthdate is out of a reasonable range." }),
});
export type PassengerDetailsForm = z.infer<typeof passengerDetailsSchema>;


export const ticketDeliverySchema = z.object({
  sendEmail: z.boolean().default(false),
  downloadPdf: z.boolean().default(false),
});
export type TicketDeliveryForm = z.infer<typeof ticketDeliverySchema>;

export const apiCreateTicketFlightDetailsSchema = z.object({
  flightNumber: z.string(),
  airline: z.object({
    code: z.string(),
    name: z.string(),
    logo: z.string().optional(),
    region: z.string().optional(),
  }),
  departure: z.object({
    airport: z.object({
      code: z.string(), name: z.string(), city: z.string(), country: z.string(),
      region: z.string().optional(),
      latitude: z.union([z.string(), z.number()]).nullish(),
      longitude: z.union([z.string(), z.number()]).nullish(),
    }),
    time: z.string().regex(/^\d{2}:\d{2}$/, "Departure time must be HH:MM"),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Departure date must be YYYY-MM-DD"),
  }),
  arrival: z.object({
    airport: z.object({
      code: z.string(), name: z.string(), city: z.string(), country: z.string(),
      region: z.string().optional(),
      latitude: z.union([z.string(), z.number()]).nullish(),
      longitude: z.union([z.string(), z.number()]).nullish(),
    }),
    time: z.string().regex(/^\d{2}:\d{2}$/, "Arrival time must be HH:MM"),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Arrival date must be YYYY-MM-DD"),
  }),
  duration: z.string(),
  class: z.string(),
});

export const apiCreateTicketPayloadSchema = z.object({
  passengerId: z.number(),
  flightDetails: apiCreateTicketFlightDetailsSchema,
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

// These types will now include the new optional fields from the 'passengers' table
export type InsertPassenger = z.infer<typeof insertPassengerSchema>;
export type Passenger = typeof passengers.$inferSelect;

export type InsertTicket = z.infer<typeof insertTicketSchema>;
export type Ticket = typeof tickets.$inferSelect;

export type ApiCreateTicketPayload = z.infer<typeof apiCreateTicketPayloadSchema>;
export type ApiCreateTicketFlightDetails = z.infer<typeof apiCreateTicketFlightDetailsSchema>;

// Combined types for API responses
export type FlightWithDetails = {
  id: number;
  flightNumber: string;
  airline: { id: number; code: string; name: string; logo?: string | null; region?: string | null; };
  departure: {
    airport: { id: number; code: string; name: string; city: string; country: string; latitude?: string | null; longitude?: string | null; };
    time: string; date: string;
  };
  arrival: {
    airport: { id: number; code: string; name: string; city: string; country: string; latitude?: string | null; longitude?: string | null; };
    time: string; date: string;
  };
  duration: string; class: string;
};

export type TicketWithDetails = {
  id: number;
  flight: FlightWithDetails;
  passenger: Passenger; // Passenger type now includes optional title, middleName, passportNumber
  seatNumber: string;
  bookingReference: string;
  gate: string;
  boardingTime: string;
  createdAt: Date;
};