// server/utils/email-sender.ts
import nodemailer from 'nodemailer';
import { TicketWithDetails } from '@shared/schema'; // Only TicketWithDetails from shared
import { generateTicketPdf } from './pdf-generator';

// Import from pdf-generator.ts
import { getAirlineTemplate, type AirlineTemplate } from './pdf-generator'; // Import type and function

// Helper function
function safeToString(value: any, defaultValue = ''): string {
  if (value === null || typeof value === 'undefined') return defaultValue;
  return String(value);
}

// --- HTML Email Content Generator ---
function generateHtmlEmail(ticket: TicketWithDetails, template: AirlineTemplate): string {
  const passengerFullNameEmail = `${ticket.passenger.title ? safeToString(ticket.passenger.title, '') + '. ' : ''}${safeToString(ticket.passenger.firstName, 'Valued Passenger')} ${ticket.passenger.middleName ? safeToString(ticket.passenger.middleName, '') + ' ' : ''}${safeToString(ticket.passenger.lastName, '')}`.trim();
  
  const departureDisplayDate = ticket.flight.departure.date 
    ? new Date(ticket.flight.departure.date + 'T00:00:00Z').toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })
    : 'N/A';
  const arrivalDisplayDate = ticket.flight.arrival.date
    ? new Date(ticket.flight.arrival.date + 'T00:00:00Z').toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })
    : 'N/A';

  const airlineCheckInInfo = `Online check-in for ${ticket.flight.airline.name} typically opens 24-48 hours before departure and closes 1-2 hours before. Please verify exact times on the airline's website.`;
  const airportCheckInDeadlines = `For airport check-in, please arrive at least 2 hours before departure for domestic flights and 3 hours for international flights.`;

  const primaryColor = template.primaryColor || '#005287'; 
  const secondaryColor = template.secondaryColor || '#DDDDDD'; 
  
  let buttonTextColor = '#FFFFFF';
  if (primaryColor.startsWith('#')) {
    const r = parseInt(primaryColor.slice(1, 3), 16);
    const g = parseInt(primaryColor.slice(3, 5), 16);
    const b = parseInt(primaryColor.slice(5, 7), 16);
    if ((r * 0.299 + g * 0.587 + b * 0.114) > 186) { // Check perceived brightness
        buttonTextColor = template.headerTextColor || '#333333';
    } else {
        buttonTextColor = template.headerTextColor && template.headerTextColor !== primaryColor ? template.headerTextColor : '#FFFFFF';
    }
  }

  const bodyTextColor = '#333333';
  const mutedTextColor = '#777777';
  const accentColor = secondaryColor;

  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Flight Itinerary - ${ticket.flight.airline.name}</title>
    <style>
      body { margin: 0; padding: 0; background-color: #f4f7f6; font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.6; color: ${bodyTextColor}; }
      .email-container { max-width: 680px; margin: 20px auto; background-color: #ffffff; border: 1px solid #dddddd; border-radius: 8px; overflow: hidden; }
      .header { background-color: ${primaryColor}; color: ${buttonTextColor}; padding: 25px 20px; text-align: center; }
      .header h1 { margin: 0; font-size: 26px; letter-spacing: 1px; }
      .airline-name-header { font-size: 20px; font-weight:bold; margin-top: 5px;}
      .greeting-section { padding: 25px 20px; border-bottom: 1px solid #eeeeee; }
      .greeting-section p { margin: 5px 0; }
      .booking-ref-section { background-color: #eef2f5; padding: 20px; text-align: center; }
      .booking-ref-section p { margin: 0 0 5px 0; font-size: 16px; color: #555555; }
      .booking-ref-section strong { font-size: 22px; color: ${accentColor}; letter-spacing: 1px; }
      .section { padding: 20px; border-bottom: 1px solid #eeeeee; }
      .section:last-of-type { border-bottom: none; }
      .section-title { font-size: 18px; font-weight: bold; color: ${primaryColor}; margin-top: 0; margin-bottom: 15px; border-bottom: 2px solid ${primaryColor}; padding-bottom: 5px;}
      .flight-leg { margin-bottom: 20px; }
      .flight-info-table, .passenger-summary-table { width: 100%; border-collapse: collapse; margin-bottom:15px; }
      .flight-info-table td, .passenger-summary-table td { padding: 8px 5px; vertical-align: top; }
      .flight-info-table .label, .passenger-summary-table .label { color: #555555; font-weight: bold; width: 120px; }
      .flight-info-table .value, .passenger-summary-table .value { color: ${bodyTextColor}; }
      .flight-path { display: table; width: 100%; margin-bottom: 15px; }
      .flight-path-segment { display: table-cell; width: 40%; text-align: center; }
      .flight-path-segment p { margin: 2px 0; }
      .flight-path-arrow { display: table-cell; width: 20%; text-align: center; vertical-align: middle; font-size: 24px; color: ${accentColor};}
      .flight-path-airport-code { font-size: 20px; font-weight: bold; color: ${primaryColor};}
      .text-muted { color: ${mutedTextColor}; font-size: 0.9em; }
      .footer { padding: 20px; text-align: center; font-size: 12px; color: #888888; background-color: #f0f0f0; border-top: 1px solid #dddddd; }
      .button { display: inline-block; background-color: ${primaryColor}; color: ${buttonTextColor}; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top:10px; }
    </style>
  </head>
  <body>
    <div class="email-container">
      <div class="header">
        <h1>${ticket.flight.airline.name}</h1>
        <div class="airline-name-header">Flight Itinerary</div>
      </div>
      <div class="greeting-section">
        <p>Dear ${passengerFullNameEmail},</p>
        <p>Thank you for choosing ${ticket.flight.airline.name}! Your flight booking is confirmed.</p>
        <p>Please find your itinerary details below. Your e-ticket PDF is also attached to this email.</p>
        <p class="text-muted">Itinerary Issue Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>
      <div class="booking-ref-section">
        <p>Booking Reference:</p>
        <strong>${ticket.bookingReference}</strong>
      </div>
      <div class="section">
        <h3 class="section-title">Passenger Details</h3>
        <table class="passenger-summary-table">
          <tr><td class="label">Name:</td><td class="value">${passengerFullNameEmail}</td></tr>
          <tr><td class="label">Seat:</td><td class="value">${safeToString(ticket.seatNumber, "To be assigned at check-in")}</td></tr>
        </table>
        <p class="text-muted" style="margin-top:10px;">This is not a boarding pass. Please ensure you check-in for your flight.</p>
      </div>
      <div class="section flight-leg">
        <h3 class="section-title">Flight: ${ticket.flight.airline.code} ${ticket.flight.flightNumber}</h3>
        <table class="flight-info-table">
          <tr><td class="label">Operated by:</td><td class="value">${safeToString(ticket.flight.operatingAirline || ticket.flight.airline.name)}</td></tr>
          <tr><td class="label">Aircraft:</td><td class="value">${safeToString(ticket.flight.aircraft, "N/A")}</td></tr>
          <tr><td class="label">Cabin:</td><td class="value">${ticket.flight.class.charAt(0).toUpperCase() + ticket.flight.class.slice(1)}</td></tr>
        </table>
        <div class="flight-path">
          <div class="flight-path-segment">
            <p class="flight-path-airport-code">${ticket.flight.departure.airport.code}</p>
            <p>${ticket.flight.departure.airport.name}, ${ticket.flight.departure.airport.city}</p>
            <p><strong>Departs:</strong> ${departureDisplayDate} at ${ticket.flight.departure.time}</p>
            <p class="text-muted">Terminal: ${safeToString(ticket.flight.departure.terminal, "TBD")}</p>
          </div>
          <div class="flight-path-arrow">
            <div>→</div>
            <div style="font-size:0.7em; color: #777;">${ticket.flight.duration}</div>
          </div>
          <div class="flight-path-segment" style="text-align:right;">
            <p class="flight-path-airport-code">${ticket.flight.arrival.airport.code}</p>
            <p>${ticket.flight.arrival.airport.name}, ${ticket.flight.arrival.airport.city}</p>
            <p><strong>Arrives:</strong> ${arrivalDisplayDate} at ${ticket.flight.arrival.time}</p>
            <p class="text-muted">Terminal: ${safeToString(ticket.flight.arrival.terminal, "TBD")}</p>
          </div>
        </div>
         <p class="text-muted" style="text-align:center;">All times shown are local to the respective airports.</p>
      </div>
      <div class="section">
        <h3 class="section-title">Important Information</h3>
        <p><strong>Check-in:</strong> ${airlineCheckInInfo} ${airportCheckInDeadlines} For specific details, please visit the ${ticket.flight.airline.name} website.</p>
        <p style="text-align: center;">
          <a href="#" class="button" style="background-color:${primaryColor}; color:${buttonTextColor};">Online Check-in</a>
        </p>
        <p><strong>Baggage:</strong> Standard allowances are typically 7kg for carry-on and 20-23kg for checked baggage, but vary by airline and fare type. Please confirm your specific allowance with ${ticket.flight.airline.name}.</p>
        <p class="text-muted">For international travel, ensure your passport and any necessary visas are valid. Review airline policies on restricted items.</p>
      </div>
      <div class="footer">
        <p>We wish you a pleasant journey!</p>
        <p>${ticket.flight.airline.name} | © ${new Date().getFullYear()}</p>
      </div>
    </div>
  </body>
  </html>
  `;
}

// --- Plain Text Email Content Generator ---
function generatePlainTextEmail(ticket: TicketWithDetails, template: AirlineTemplate): string {
  const passengerFullNameEmail = `${ticket.passenger.title ? safeToString(ticket.passenger.title, '') + '. ' : ''}${safeToString(ticket.passenger.firstName, 'Valued Passenger')} ${ticket.passenger.middleName ? safeToString(ticket.passenger.middleName, '') + ' ' : ''}${safeToString(ticket.passenger.lastName, '')}`.trim();
  const departureDisplayDate = ticket.flight.departure.date ? new Date(ticket.flight.departure.date + 'T00:00:00Z').toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }) : 'N/A';
  const arrivalDisplayDate = ticket.flight.arrival.date ? new Date(ticket.flight.arrival.date + 'T00:00:00Z').toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }) : 'N/A';
  
  return `
=======================================
${ticket.flight.airline.name} - Flight Itinerary
Booking Reference: ${ticket.bookingReference}
=======================================
Issued: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

Hello ${passengerFullNameEmail},

Thank you for choosing ${ticket.flight.airline.name}! Your flight booking is confirmed.
Your e-ticket PDF is attached. This email contains a summary of your itinerary.

PASSENGER DETAILS:
Name: ${passengerFullNameEmail}
Seat: ${safeToString(ticket.seatNumber, "To be assigned at check-in")}

FLIGHT DETAILS:
--------------------------------------------------
Flight: ${ticket.flight.airline.code} ${ticket.flight.flightNumber}
Aircraft: ${safeToString(ticket.flight.aircraft, "N/A")}
Cabin: ${ticket.flight.class.charAt(0).toUpperCase() + ticket.flight.class.slice(1)}

Departure:
  Date: ${departureDisplayDate}
  Time: ${ticket.flight.departure.time} (Local)
  Airport: ${ticket.flight.departure.airport.name} (${ticket.flight.departure.airport.code}), ${ticket.flight.departure.airport.city}
  Terminal: ${safeToString(ticket.flight.departure.terminal, "TBD")}

Arrival:
  Date: ${arrivalDisplayDate}
  Time: ${ticket.flight.arrival.time} (Local)
  Airport: ${ticket.flight.arrival.airport.name} (${ticket.flight.arrival.airport.code}), ${ticket.flight.arrival.airport.city}
  Terminal: ${safeToString(ticket.flight.arrival.terminal, "TBD")}

Duration: ${ticket.flight.duration}
--------------------------------------------------

IMPORTANT INFORMATION:
Check-in: Online check-in for ${ticket.flight.airline.name} typically opens 24-48 hours before departure. Please verify exact times and check-in options on the airline's website. For airport check-in, arrive at least 2 hours before domestic departures and 3 hours for international.
Baggage: Standard allowances apply (e.g., 7kg carry-on, 20-23kg checked). Confirm with ${ticket.flight.airline.name}.
Travel Documents: For international flights, ensure passport and visas are valid.

This is not a boarding pass. All times are local.

Safe travels!
The ${ticket.flight.airline.name} Team
  `;
}

export async function sendTicketEmail(ticket: TicketWithDetails): Promise<{ 
  messageId: string; 
  previewUrl: string | false; 
}> {
  console.log('[EMAIL_SENDER] Attempting to send ticket email for booking:', ticket.bookingReference);

  if (!ticket.passenger.email) {
    console.error('[EMAIL_SENDER] No passenger email found for ticket:', ticket.bookingReference);
    throw new Error("Passenger email is missing.");
  }

  const airlineCode = ticket.flight.airline.code;
  const currentAirlineTemplate = getAirlineTemplate(airlineCode); // Uses the imported function

  try {
    const testAccount = await nodemailer.createTestAccount();
    console.log('[EMAIL_SENDER] Ethereal test account created. User:', testAccount.user);

    const transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });

    const pdfBuffer = await generateTicketPdf(ticket);

    const mailOptions = {
      from: `"${ticket.flight.airline.name}" <noreply@${airlineCode.toLowerCase()}.flightback.example.com>`,
      to: ticket.passenger.email,
      subject: `Your Flight Itinerary - Booking ${ticket.bookingReference} (${ticket.flight.airline.name} ${ticket.flight.flightNumber})`,
      text: generatePlainTextEmail(ticket, currentAirlineTemplate),
      html: generateHtmlEmail(ticket, currentAirlineTemplate),
      attachments: [
        {
          filename: `${ticket.flight.airline.code}-Ticket-${ticket.bookingReference}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    console.log('[EMAIL_SENDER] Sending email with options...');
    const info = await transporter.sendMail(mailOptions);
    const previewUrl = nodemailer.getTestMessageUrl(info);

    console.log('[EMAIL_SENDER] Email sent successfully! Message ID:', info.messageId);
    if (previewUrl) {
      console.log('[EMAIL_SENDER] Preview URL: %s', previewUrl);
    }

    return {
      messageId: info.messageId,
      previewUrl: previewUrl || false
    };
  } catch (error: any) {
    console.error('[EMAIL_SENDER] Error sending email:', error.message);
    console.error('[EMAIL_SENDER] Full error object:', error);
    throw new Error(`Failed to send email. Original error: ${error.message}`);
  }
}