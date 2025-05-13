import PDFDocument from 'pdfkit';
import { TicketWithDetails } from '@shared/schema';

// Define different airline template styles
interface AirlineTemplate {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  logoPosition: 'left' | 'center' | 'right';
  paperSize: [number, number]; // [width, height] in points
  usesQrCode: boolean;
}

// Airline-specific template configurations
const airlineTemplates: Record<string, AirlineTemplate> = {
  // North American airlines
  'AA': { // American Airlines
    primaryColor: '#0078D2',
    secondaryColor: '#C4002B',
    fontFamily: 'Helvetica',
    logoPosition: 'left',
    paperSize: [595.28, 841.89], // A4
    usesQrCode: true
  },
  'DL': { // Delta Airlines
    primaryColor: '#003366',
    secondaryColor: '#E01933',
    fontFamily: 'Helvetica-Bold',
    logoPosition: 'center',
    paperSize: [595.28, 841.89], // A4
    usesQrCode: true
  },
  'UA': { // United Airlines
    primaryColor: '#002244',
    secondaryColor: '#4B92DB',
    fontFamily: 'Helvetica',
    logoPosition: 'left',
    paperSize: [595.28, 841.89], // A4
    usesQrCode: true
  },
  
  // European airlines
  'BA': { // British Airways
    primaryColor: '#075AAA',
    secondaryColor: '#EB2226',
    fontFamily: 'Helvetica',
    logoPosition: 'center',
    paperSize: [595.28, 841.89], // A4
    usesQrCode: true
  },
  'LH': { // Lufthansa
    primaryColor: '#05164D',
    secondaryColor: '#FFAD00',
    fontFamily: 'Helvetica',
    logoPosition: 'left',
    paperSize: [595.28, 841.89], // A4
    usesQrCode: true
  },
  'AF': { // Air France
    primaryColor: '#002157',
    secondaryColor: '#FF0000',
    fontFamily: 'Helvetica',
    logoPosition: 'center',
    paperSize: [595.28, 841.89], // A4
    usesQrCode: true
  },
  
  // Asian airlines
  'SQ': { // Singapore Airlines
    primaryColor: '#0F4287',
    secondaryColor: '#F4F4F4',
    fontFamily: 'Helvetica',
    logoPosition: 'left',
    paperSize: [595.28, 841.89], // A4
    usesQrCode: false
  },
  'CX': { // Cathay Pacific
    primaryColor: '#006564',
    secondaryColor: '#676767',
    fontFamily: 'Helvetica',
    logoPosition: 'center',
    paperSize: [595.28, 841.89], // A4
    usesQrCode: true
  },
  
  // Middle Eastern airlines
  'EK': { // Emirates
    primaryColor: '#D71A21',
    secondaryColor: '#231F20',
    fontFamily: 'Helvetica-Bold',
    logoPosition: 'center',
    paperSize: [595.28, 841.89], // A4
    usesQrCode: true
  },
  'QR': { // Qatar Airways
    primaryColor: '#5C0632',
    secondaryColor: '#FFFFFF',
    fontFamily: 'Helvetica',
    logoPosition: 'left',
    paperSize: [595.28, 841.89], // A4
    usesQrCode: true
  },
  
  // Default template
  'default': {
    primaryColor: '#3366CC',
    secondaryColor: '#333333',
    fontFamily: 'Helvetica',
    logoPosition: 'center',
    paperSize: [595.28, 841.89], // A4
    usesQrCode: false
  }
};

// Helper function to get the airline template based on the airline code
function getAirlineTemplate(airlineCode: string): AirlineTemplate {
  // Extract the airline code from flight number if it contains it (e.g., "AA123" -> "AA")
  const code = airlineCode.length > 2 ? airlineCode.substring(0, 2) : airlineCode;
  return airlineTemplates[code] || airlineTemplates.default;
}

export async function generateTicketPdf(ticket: TicketWithDetails): Promise<Buffer> {
  // Get airline-specific template
  const airlineCode = ticket.flight.flightNumber.substring(0, 2);
  const template = getAirlineTemplate(airlineCode);
  return new Promise((resolve, reject) => {
    try {
      const buffers: Buffer[] = [];
      const doc = new PDFDocument({
        size: 'A4',
        margin: 30,
        info: {
          Title: `Flight Ticket - ${ticket.bookingReference}`,
          Author: 'FlightBack Ticket Generator',
          Subject: 'Flight Ticket',
          Keywords: 'flight, ticket, travel',
        }
      });

      // Collect the PDF data chunks
      doc.on('data', buffers.push.bind(buffers));
      
      // When document is done being written, resolve with the complete PDF data
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Header with logo and title
      doc.fontSize(24)
         .font('Helvetica-Bold')
         .text('FlightBack', { align: 'center' })
         .fontSize(14)
         .font('Helvetica')
         .text('Fake Flight Ticket Generator', { align: 'center' })
         .moveDown(1);

      // Draw a line
      doc.moveTo(30, doc.y)
         .lineTo(doc.page.width - 30, doc.y)
         .stroke()
         .moveDown(1);

      // Boarding pass title
      doc.fontSize(16)
         .font('Helvetica-Bold')
         .text('BOARDING PASS', { align: 'center' })
         .moveDown(0.5);

      // Airline info
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .text(ticket.flight.airline.name, { align: 'center' })
         .fontSize(12)
         .font('Helvetica')
         .text(`Flight: ${ticket.flight.flightNumber}`, { align: 'center' })
         .moveDown(1);

      // Passenger info
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .text('Passenger Information')
         .moveDown(0.5);

      doc.fontSize(12)
         .font('Helvetica')
         .text(`Name: ${ticket.passenger.firstName} ${ticket.passenger.lastName}`)
         .text(`Passport/ID: ${ticket.passenger.passportNumber}`)
         .text(`Nationality: ${ticket.passenger.nationality}`)
         .moveDown(1);

      // Flight info
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .text('Flight Information')
         .moveDown(0.5);

      // Create a table-like structure for flight details
      const tableTop = doc.y;
      const tableLeft = 50;
      const colWidth = 150;

      // From column
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .text('From:', tableLeft, tableTop)
         .font('Helvetica')
         .text(ticket.flight.departure.airport.city, tableLeft, tableTop + 15)
         .text(ticket.flight.departure.airport.code, tableLeft, tableTop + 30);

      // To column
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .text('To:', tableLeft + colWidth, tableTop)
         .font('Helvetica')
         .text(ticket.flight.arrival.airport.city, tableLeft + colWidth, tableTop + 15)
         .text(ticket.flight.arrival.airport.code, tableLeft + colWidth, tableTop + 30);

      // Date column
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .text('Date:', tableLeft + colWidth * 2, tableTop)
         .font('Helvetica')
         .text(new Date().toLocaleDateString(), tableLeft + colWidth * 2, tableTop + 15);

      doc.moveDown(2);

      // Time information
      const timeTop = doc.y;
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .text('Departure:', tableLeft, timeTop)
         .font('Helvetica')
         .text(ticket.flight.departure.time, tableLeft, timeTop + 15);

      doc.fontSize(12)
         .font('Helvetica-Bold')
         .text('Arrival:', tableLeft + colWidth, timeTop)
         .font('Helvetica')
         .text(ticket.flight.arrival.time, tableLeft + colWidth, timeTop + 15);

      doc.fontSize(12)
         .font('Helvetica-Bold')
         .text('Duration:', tableLeft + colWidth * 2, timeTop)
         .font('Helvetica')
         .text(ticket.flight.duration, tableLeft + colWidth * 2, timeTop + 15);

      doc.moveDown(2);

      // More ticket details
      const detailsTop = doc.y;
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .text('Gate:', tableLeft, detailsTop)
         .font('Helvetica')
         .text(ticket.gate, tableLeft, detailsTop + 15);

      doc.fontSize(12)
         .font('Helvetica-Bold')
         .text('Seat:', tableLeft + colWidth, detailsTop)
         .font('Helvetica')
         .text(ticket.seatNumber, tableLeft + colWidth, detailsTop + 15);

      doc.fontSize(12)
         .font('Helvetica-Bold')
         .text('Boarding Time:', tableLeft + colWidth * 2, detailsTop)
         .font('Helvetica')
         .text(ticket.boardingTime, tableLeft + colWidth * 2, detailsTop + 15);

      doc.moveDown(2);

      // Booking reference
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .text('Booking Reference:')
         .fontSize(16)
         .text(ticket.bookingReference)
         .moveDown(1);

      // Draw a fake barcode (just for visual effect)
      doc.fontSize(10)
         .text('Scan barcode at airport:', { align: 'center' })
         .moveDown(0.5);

      // Draw the "barcode" as a series of lines
      const barcodeY = doc.y;
      const barcodeWidth = 200;
      const barcodeHeight = 50;
      const barcodeX = (doc.page.width - barcodeWidth) / 2;

      for (let i = 0; i < 30; i++) {
        const x = barcodeX + (i * (barcodeWidth / 30));
        const height = Math.random() * barcodeHeight + 10;
        const lineWidth = Math.random() * 2 + 1;
        
        doc.lineWidth(lineWidth)
           .moveTo(x, barcodeY)
           .lineTo(x, barcodeY + height)
           .stroke();
      }

      doc.moveDown(4);

      // Footer with disclaimer
      doc.fontSize(10)
         .font('Helvetica-Oblique')
         .text('This is a fake flight ticket generated for educational purposes only.', { align: 'center' })
         .text('Not valid for actual travel.', { align: 'center' });

      // Finalize the PDF
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
