import nodemailer from 'nodemailer';
import { TicketWithDetails } from '@shared/schema';
import { generateTicketPdf } from './pdf-generator';

// Create a test nodemailer transporter for development
// In production, you would use actual SMTP credentials
const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || 'user@example.com',
    pass: process.env.EMAIL_PASS || 'password',
  },
});

export async function sendTicketEmail(ticket: TicketWithDetails): Promise<{ 
  messageId: string, 
  previewUrl: string 
}> {
  try {
    // Generate the PDF ticket
    const pdfBuffer = await generateTicketPdf(ticket);
    
    // Setup email data
    const mailOptions = {
      from: '"FlightBack Ticket Service" <tickets@flightback.example.com>',
      to: ticket.passenger.email,
      subject: `Your Flight Ticket - ${ticket.flight.airline.name} ${ticket.flight.flightNumber}`,
      text: `
Hello ${ticket.passenger.firstName} ${ticket.passenger.lastName},

Thank you for using FlightBack Ticket Generator!

Your flight from ${ticket.flight.departure.airport.city} (${ticket.flight.departure.airport.code}) to ${ticket.flight.arrival.airport.city} (${ticket.flight.arrival.airport.code}) has been confirmed.

Flight Details:
- Airline: ${ticket.flight.airline.name}
- Flight Number: ${ticket.flight.flightNumber}
- Date: ${new Date().toLocaleDateString()}
- Departure: ${ticket.flight.departure.time} (${ticket.flight.departure.airport.code})
- Arrival: ${ticket.flight.arrival.time} (${ticket.flight.arrival.airport.code})
- Gate: ${ticket.gate}
- Seat: ${ticket.seatNumber}
- Boarding Time: ${ticket.boardingTime}

Your booking reference is: ${ticket.bookingReference}

Your ticket is attached to this email as a PDF.

Note: This is a fake flight ticket generated for educational purposes only. Not valid for actual travel.

Safe travels!
FlightBack Ticket Service
      `,
      html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 5px;">
  <div style="text-align: center; margin-bottom: 20px;">
    <h1 style="color: #2563eb; margin: 0;">Flight<span style="color: #000;">Back</span></h1>
    <p style="color: #64748b; font-style: italic; margin: 0;">Fake Flight Ticket Generator</p>
  </div>

  <div style="margin-bottom: 20px;">
    <p style="margin-bottom: 10px;">Hello ${ticket.passenger.firstName} ${ticket.passenger.lastName},</p>
    <p style="margin-bottom: 10px;">Thank you for using FlightBack Ticket Generator!</p>
    <p style="margin-bottom: 10px;">Your flight from <strong>${ticket.flight.departure.airport.city} (${ticket.flight.departure.airport.code})</strong> to <strong>${ticket.flight.arrival.airport.city} (${ticket.flight.arrival.airport.code})</strong> has been confirmed.</p>
  </div>

  <div style="background-color: #f8fafc; border-radius: 5px; padding: 15px; margin-bottom: 20px;">
    <h2 style="color: #334155; font-size: 18px; margin-top: 0; margin-bottom: 15px;">Flight Details</h2>
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 8px 0; color: #64748b; width: 40%;">Airline:</td>
        <td style="padding: 8px 0; font-weight: bold;">${ticket.flight.airline.name}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #64748b;">Flight Number:</td>
        <td style="padding: 8px 0; font-weight: bold;">${ticket.flight.flightNumber}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #64748b;">Date:</td>
        <td style="padding: 8px 0; font-weight: bold;">${new Date().toLocaleDateString()}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #64748b;">Departure:</td>
        <td style="padding: 8px 0; font-weight: bold;">${ticket.flight.departure.time} (${ticket.flight.departure.airport.code})</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #64748b;">Arrival:</td>
        <td style="padding: 8px 0; font-weight: bold;">${ticket.flight.arrival.time} (${ticket.flight.arrival.airport.code})</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #64748b;">Gate:</td>
        <td style="padding: 8px 0; font-weight: bold;">${ticket.gate}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #64748b;">Seat:</td>
        <td style="padding: 8px 0; font-weight: bold;">${ticket.seatNumber}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #64748b;">Boarding Time:</td>
        <td style="padding: 8px 0; font-weight: bold;">${ticket.boardingTime}</td>
      </tr>
    </table>
  </div>

  <div style="text-align: center; margin-bottom: 20px; padding: 15px; background-color: #f0f9ff; border-radius: 5px;">
    <p style="margin: 0; color: #334155;">Your booking reference is:</p>
    <h2 style="margin: 10px 0; color: #0369a1; letter-spacing: 2px;">${ticket.bookingReference}</h2>
  </div>

  <p style="margin-bottom: 10px;">Your ticket is attached to this email as a PDF.</p>

  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 12px;">
    <p style="margin-bottom: 5px; font-style: italic;">Note: This is a fake flight ticket generated for educational purposes only. Not valid for actual travel.</p>
    <p style="margin-bottom: 5px;">Safe travels!</p>
    <p style="margin: 0;"><strong>FlightBack Ticket Service</strong></p>
  </div>
</div>
      `,
      attachments: [
        {
          filename: `ticket-${ticket.bookingReference}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    // Send mail
    const info = await transporter.sendMail(mailOptions);
    
    return {
      messageId: info.messageId,
      previewUrl: nodemailer.getTestMessageUrl(info) as string
    };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
}
