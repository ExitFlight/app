import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

// Function to generate a PDF ticket
export async function generateTicketPdf(booking: any, flight: any, airline: any): Promise<Uint8Array> {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  
  // Add a new page
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
  
  // Embed standard fonts
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  // Set margins
  const margin = 50;
  const { width, height } = page.getSize();
  
  // Format date
  const dateObj = new Date(flight.departureDate || Date.now());
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Add header
  page.drawText('FLIGHT TICKET', {
    x: width / 2 - helveticaBoldFont.widthOfTextAtSize('FLIGHT TICKET', 24) / 2,
    y: height - margin - 24,
    size: 24,
    font: helveticaBoldFont,
    color: rgb(0, 0, 0),
  });
  
  // Add airline info
  page.drawText(airline.name, {
    x: width / 2 - helveticaBoldFont.widthOfTextAtSize(airline.name, 18) / 2,
    y: height - margin - 60,
    size: 18,
    font: helveticaBoldFont,
    color: rgb(0, 0, 0),
  });
  
  page.drawText(`Flight ${flight.flightNumber}`, {
    x: width / 2 - helveticaFont.widthOfTextAtSize(`Flight ${flight.flightNumber}`, 12) / 2,
    y: height - margin - 80,
    size: 12,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  });
  
  // Add booking reference
  page.drawText('Booking Reference:', {
    x: margin,
    y: height - margin - 110,
    size: 12,
    font: helveticaBoldFont,
    color: rgb(0, 0, 0),
  });
  
  page.drawText(booking.bookingReference, {
    x: margin + helveticaBoldFont.widthOfTextAtSize('Booking Reference:', 12) + 5,
    y: height - margin - 110,
    size: 12,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  });
  
  // Draw a separator line
  page.drawLine({
    start: { x: margin, y: height - margin - 130 },
    end: { x: width - margin, y: height - margin - 130 },
    thickness: 1,
    color: rgb(0.7, 0.7, 0.7),
  });
  
  // Flight details title
  page.drawText('Flight Details', {
    x: margin,
    y: height - margin - 160,
    size: 16,
    font: helveticaBoldFont,
    color: rgb(0, 0, 0),
  });
  
  // Create a two-column layout for departure and arrival
  const departureY = height - margin - 190;
  
  // Departure
  page.drawText('DEPARTURE', {
    x: margin,
    y: departureY,
    size: 14,
    font: helveticaBoldFont,
    color: rgb(0, 0, 0),
  });
  
  page.drawText(flight.departureTime, {
    x: margin,
    y: departureY - 25,
    size: 20,
    font: helveticaBoldFont,
    color: rgb(0, 0, 0),
  });
  
  page.drawText(flight.departureAirportCode, {
    x: margin,
    y: departureY - 50,
    size: 12,
    font: helveticaBoldFont,
    color: rgb(0, 0, 0),
  });
  
  page.drawText(`${flight.departureAirport?.city}, ${flight.departureAirport?.country}`, {
    x: margin,
    y: departureY - 70,
    size: 10,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  });
  
  page.drawText(formattedDate, {
    x: margin,
    y: departureY - 90,
    size: 10,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  });
  
  // Arrival
  page.drawText('ARRIVAL', {
    x: width / 2 + 50,
    y: departureY,
    size: 14,
    font: helveticaBoldFont,
    color: rgb(0, 0, 0),
  });
  
  page.drawText(flight.arrivalTime, {
    x: width / 2 + 50,
    y: departureY - 25,
    size: 20,
    font: helveticaBoldFont,
    color: rgb(0, 0, 0),
  });
  
  page.drawText(flight.arrivalAirportCode, {
    x: width / 2 + 50,
    y: departureY - 50,
    size: 12,
    font: helveticaBoldFont,
    color: rgb(0, 0, 0),
  });
  
  page.drawText(`${flight.arrivalAirport?.city}, ${flight.arrivalAirport?.country}`, {
    x: width / 2 + 50,
    y: departureY - 70,
    size: 10,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  });
  
  page.drawText(formattedDate, {
    x: width / 2 + 50,
    y: departureY - 90,
    size: 10,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  });
  
  // Flight duration
  page.drawText('Duration:', {
    x: margin,
    y: departureY - 130,
    size: 12,
    font: helveticaBoldFont,
    color: rgb(0, 0, 0),
  });
  
  page.drawText(flight.duration, {
    x: margin + helveticaBoldFont.widthOfTextAtSize('Duration:', 12) + 5,
    y: departureY - 130,
    size: 12,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  });
  
  // Class
  page.drawText('Class:', {
    x: margin,
    y: departureY - 150,
    size: 12,
    font: helveticaBoldFont,
    color: rgb(0, 0, 0),
  });
  
  page.drawText(flight.class, {
    x: margin + helveticaBoldFont.widthOfTextAtSize('Class:', 12) + 5,
    y: departureY - 150,
    size: 12,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  });
  
  // Draw another separator line
  page.drawLine({
    start: { x: margin, y: departureY - 180 },
    end: { x: width - margin, y: departureY - 180 },
    thickness: 1,
    color: rgb(0.7, 0.7, 0.7),
  });
  
  // Passenger details title
  page.drawText('Passenger Information', {
    x: margin,
    y: departureY - 210,
    size: 16,
    font: helveticaBoldFont,
    color: rgb(0, 0, 0),
  });
  
  // Passenger name
  page.drawText('Name:', {
    x: margin,
    y: departureY - 240,
    size: 12,
    font: helveticaBoldFont,
    color: rgb(0, 0, 0),
  });
  
  page.drawText(`${booking.firstName} ${booking.lastName}`, {
    x: margin + helveticaBoldFont.widthOfTextAtSize('Name:', 12) + 5,
    y: departureY - 240,
    size: 12,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  });
  
  // Seat
  page.drawText('Seat:', {
    x: margin,
    y: departureY - 260,
    size: 12,
    font: helveticaBoldFont,
    color: rgb(0, 0, 0),
  });
  
  page.drawText(`${booking.seatNumber} (${booking.seatPreference || 'No preference'})`, {
    x: margin + helveticaBoldFont.widthOfTextAtSize('Seat:', 12) + 5,
    y: departureY - 260,
    size: 12,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  });
  
  // Passport/ID
  page.drawText('Passport/ID:', {
    x: margin,
    y: departureY - 280,
    size: 12,
    font: helveticaBoldFont,
    color: rgb(0, 0, 0),
  });
  
  page.drawText(booking.passportNumber, {
    x: margin + helveticaBoldFont.widthOfTextAtSize('Passport/ID:', 12) + 5,
    y: departureY - 280,
    size: 12,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  });
  
  // Special requests if any
  if (booking.specialRequests) {
    page.drawText('Special Requests:', {
      x: margin,
      y: departureY - 300,
      size: 12,
      font: helveticaBoldFont,
      color: rgb(0, 0, 0),
    });
    
    page.drawText(booking.specialRequests, {
      x: margin + helveticaBoldFont.widthOfTextAtSize('Special Requests:', 12) + 5,
      y: departureY - 300,
      size: 12,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });
  }
  
  // Disclaimer
  const disclaimer1 = 'THIS IS A MOCK TICKET FOR PROJECT PURPOSES ONLY';
  const disclaimer2 = 'NOT VALID FOR ACTUAL TRAVEL';
  
  page.drawText(disclaimer1, {
    x: width / 2 - helveticaFont.widthOfTextAtSize(disclaimer1, 10) / 2,
    y: margin + 30,
    size: 10,
    font: helveticaFont,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  page.drawText(disclaimer2, {
    x: width / 2 - helveticaFont.widthOfTextAtSize(disclaimer2, 10) / 2,
    y: margin + 15,
    size: 10,
    font: helveticaFont,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  // Serialize the PDF to bytes
  const pdfBytes = await pdfDoc.save();
  
  return pdfBytes;
}
