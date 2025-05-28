// server/utils/pdf-generator.ts
import PDFDocument from 'pdfkit';
import { TicketWithDetails } from '@shared/schema'; // Ensure this path is correct
import fs from 'fs';
import path from 'path';

// --- Assumed Constants (Adjust to your actual values) ---
const PAGE_MARGIN = 30;
const CONTENT_WIDTH = 595.28 - 2 * PAGE_MARGIN;
const DEFAULT_BORDER_COLOR = '#B0B0B0';
const TEXT_COLOR_DARK = '#222222';
const TEXT_COLOR_MEDIUM = '#555555';
const TEXT_COLOR_LIGHT = '#777777';
const MEDIUM_GREY_BG = '#E0E0E0';

const FONT_REGULAR = 'Helvetica';
const FONT_BOLD = 'Helvetica-Bold';

const FONT_SIZE_SMALL = 9;
const FONT_SIZE_NORMAL = 10;
const FONT_SIZE_MEDIUM = 12;
const FONT_SIZE_LARGE = 14;
const FONT_SIZE_XLARGE = 20;

const COMMON_AIRCRAFT_TYPES = [ "Airbus A320", "Airbus A321", "Airbus A330-300", "Airbus A350-900", "Boeing 737-800", "Boeing 787-9" ];
// --- End of Assumed Constants ---

interface AirlineTemplate {
  primaryColor: string;
  secondaryColor: string;
  headerTextColor?: string;
  fontFamily: string;
  logoPosition: 'left' | 'center' | 'right';
  paperSize: [number, number];
  usesQrCode: boolean;
  logoPath?: string;
  abn?: string;
}

const airlineTemplates: Record<string, AirlineTemplate> = {
  // --- North America ---
  'AA': { primaryColor: '#E0242A', secondaryColor: '#0078D2', headerTextColor: '#0078D2', fontFamily: 'Helvetica', logoPosition: 'left', paperSize: [595.28, 841.89], usesQrCode: true, logoPath: 'server/assets/logos/NorthAmerica/AA.png' },
  'AS': { primaryColor: '#004268', secondaryColor: '#78C0E2', headerTextColor: '#004268', fontFamily: 'Helvetica', logoPosition: 'left', paperSize: [595.28, 841.89], usesQrCode: true, logoPath: 'server/assets/logos/NorthAmerica/AS.png' },
  'B6': { primaryColor: '#003876', secondaryColor: '#0090D0', headerTextColor: '#003876', fontFamily: 'Helvetica', logoPosition: 'center', paperSize: [595.28, 841.89], usesQrCode: true, logoPath: 'server/assets/logos/NorthAmerica/B6.png' },
  'DL': { primaryColor: '#E01933', secondaryColor: '#003366', headerTextColor: '#003366', fontFamily: 'Helvetica-Bold', logoPosition: 'center', paperSize: [595.28, 841.89], usesQrCode: true, logoPath: 'server/assets/logos/NorthAmerica/DL.png' },
  'HA': { primaryColor: '#6B2C8F', secondaryColor: '#FBB813', headerTextColor: '#6B2C8F', fontFamily: 'Helvetica', logoPosition: 'right', paperSize: [595.28, 841.89], usesQrCode: true, logoPath: 'server/assets/logos/NorthAmerica/HA.png' },
  'UA': { primaryColor: '#005287', secondaryColor: '#4B92DB', headerTextColor: '#005287', fontFamily: 'Helvetica', logoPosition: 'left', paperSize: [595.28, 841.89], usesQrCode: true, logoPath: 'server/assets/logos/NorthAmerica/UA.png' },
  'WN': { primaryColor: '#FFBF00', secondaryColor: '#304EA0', headerTextColor: '#304EA0', fontFamily: 'Helvetica', logoPosition: 'center', paperSize: [595.28, 841.89], usesQrCode: true, logoPath: 'server/assets/logos/NorthAmerica/WN.png' },
  'AC': { primaryColor: '#F00000', secondaryColor: '#231F20', headerTextColor: '#F00000', fontFamily: 'Helvetica', logoPosition: 'left', paperSize: [595.28, 841.89], usesQrCode: true, logoPath: 'server/assets/logos/NorthAmerica/AC.png' },

  // --- Europe ---
  'BA': { primaryColor: '#003876', secondaryColor: '#E21A23', headerTextColor: '#003876', fontFamily: 'Helvetica', logoPosition: 'center', paperSize: [595.28, 841.89], usesQrCode: true, logoPath: 'server/assets/logos/Europe/BA.png' },
  'VS': { primaryColor: '#E50000', secondaryColor: '#4A4A4A', headerTextColor: '#E50000', fontFamily: 'Helvetica', logoPosition: 'left', paperSize: [595.28, 841.89], usesQrCode: true, logoPath: 'server/assets/logos/Europe/VS.png' },
  'AF': { primaryColor: '#002157', secondaryColor: '#ED1B2E', headerTextColor: '#002157', fontFamily: 'Helvetica', logoPosition: 'center', paperSize: [595.28, 841.89], usesQrCode: true, logoPath: 'server/assets/logos/Europe/AF.png' },
  'KL': { primaryColor: '#00A1DE', secondaryColor: '#00305C', headerTextColor: '#00305C', fontFamily: 'Helvetica', logoPosition: 'left', paperSize: [595.28, 841.89], usesQrCode: true, logoPath: 'server/assets/logos/Europe/KL.png' },
  'LX': { primaryColor: '#E30613', secondaryColor: '#231F20', headerTextColor: '#E30613', fontFamily: 'Helvetica', logoPosition: 'center', paperSize: [595.28, 841.89], usesQrCode: true, logoPath: 'server/assets/logos/Europe/LX.png' },
  'SK': { primaryColor: '#004B93', secondaryColor: '#FFFFFF', headerTextColor: '#004B93', fontFamily: 'Helvetica', logoPosition: 'left', paperSize: [595.28, 841.89], usesQrCode: true, logoPath: 'server/assets/logos/Europe/SK.png' },
  'DY': { primaryColor: '#D81924', secondaryColor: '#00375A', headerTextColor: '#D81924', fontFamily: 'Helvetica', logoPosition: 'center', paperSize: [595.28, 841.89], usesQrCode: true, logoPath: 'server/assets/logos/Europe/DY.png' },
  // Add LH (Lufthansa) and AY (Finnair) if you have their logos and want them uncommented
  // 'LH': { primaryColor: '#05164D', secondaryColor: '#FFC900', headerTextColor: '#05164D', fontFamily: 'Helvetica', logoPosition: 'left', paperSize: [595.28, 841.89], usesQrCode: true, logoPath: 'server/assets/logos/Europe/LH.png' },
  // 'AY': { primaryColor: '#003775', secondaryColor: '#FFFFFF', headerTextColor: '#003775', fontFamily: 'Helvetica', logoPosition: 'right', paperSize: [595.28, 841.89], usesQrCode: true, logoPath: 'server/assets/logos/Europe/AY.png' },

  // --- Middle East ---
  'EK': { primaryColor: '#D81E05', secondaryColor: '#D4AF37', headerTextColor: '#231F20', fontFamily: 'Helvetica-Bold', logoPosition: 'center', paperSize: [595.28, 841.89], usesQrCode: true, logoPath: 'server/assets/logos/MiddleEast/EK.png' },
  'EY': { primaryColor: '#A98C5A', secondaryColor: '#4A3B30', headerTextColor: '#4A3B30', fontFamily: 'Helvetica', logoPosition: 'right', paperSize: [595.28, 841.89], usesQrCode: true, logoPath: 'server/assets/logos/MiddleEast/EY.png' },
  'QR': { primaryColor: '#5C0632', secondaryColor: '#B8B8B8', headerTextColor: '#5C0632', fontFamily: 'Helvetica', logoPosition: 'left', paperSize: [595.28, 841.89], usesQrCode: true, logoPath: 'server/assets/logos/MiddleEast/QR.png' },

  // --- Asia ---
  'AK': { primaryColor: '#FF0000', secondaryColor: '#000000', headerTextColor: '#FF0000', fontFamily: 'Helvetica', logoPosition: 'center', paperSize: [595.28, 841.89], usesQrCode: true, logoPath: 'server/assets/logos/Asia/AK.png' },
  'CZ': { primaryColor: '#005BAC', secondaryColor: '#EE2A34', headerTextColor: '#005BAC', fontFamily: 'Helvetica', logoPosition: 'left', paperSize: [595.28, 841.89], usesQrCode: true, logoPath: 'server/assets/logos/Asia/CZ.png' },
  'CX': { primaryColor: '#006564', secondaryColor: '#D0D0D0', headerTextColor: '#006564', fontFamily: 'Helvetica', logoPosition: 'center', paperSize: [595.28, 841.89], usesQrCode: true, logoPath: 'server/assets/logos/Asia/CX.png' },
  'JL': { primaryColor: '#E3001B', secondaryColor: '#222222', headerTextColor: '#222222', fontFamily: 'Helvetica', logoPosition: 'left', paperSize: [595.28, 841.89], usesQrCode: true, logoPath: 'server/assets/logos/Asia/JL.png' },
  'KE': { primaryColor: '#00A0E0', secondaryColor: '#CD2E3A', headerTextColor: '#00A0E0', fontFamily: 'Helvetica', logoPosition: 'center', paperSize: [595.28, 841.89], usesQrCode: true, logoPath: 'server/assets/logos/Asia/KE.png' },
  'TG': { primaryColor: '#5F259F', secondaryColor: '#FFC700', headerTextColor: '#5F259F', fontFamily: 'Helvetica', logoPosition: 'right', paperSize: [595.28, 841.89], usesQrCode: true, logoPath: 'server/assets/logos/Asia/TG.png' },
  'SQ': { primaryColor: '#F9A01B', secondaryColor: '#0F4287', headerTextColor: '#0F4287', fontFamily: 'Helvetica', logoPosition: 'right', paperSize: [595.28, 841.89], usesQrCode: false, logoPath: 'server/assets/logos/Asia/SQ.png' },
  'MH': { primaryColor: '#00327D', secondaryColor: '#CC0000', headerTextColor: '#00327D', fontFamily: 'Helvetica', logoPosition: 'center', paperSize: [595.28, 841.89], usesQrCode: true, logoPath: 'server/assets/logos/Asia/MH.png' },
  'GA': { primaryColor: '#1A4A9C', secondaryColor: '#00A89D', headerTextColor: '#1A4A9C', fontFamily: 'Helvetica', logoPosition: 'left', paperSize: [595.28, 841.89], usesQrCode: true, logoPath: 'server/assets/logos/Asia/GA.png' },
  'VN': { primaryColor: '#003366', secondaryColor: '#FFCC00', headerTextColor: '#003366', fontFamily: 'Helvetica', logoPosition: 'center', paperSize: [595.28, 841.89], usesQrCode: true, logoPath: 'server/assets/logos/Asia/VN.png' },
  
  // --- Oceania, Africa, Central America & Caribbean, South America ---
  // (logoPath remains undefined for these unless you add logos and uncomment)
  'QF': { primaryColor: '#E40000', secondaryColor: '#FFFFFF', headerTextColor: '#E40000', fontFamily: 'Helvetica', logoPosition: 'left', paperSize: [595.28, 841.89], usesQrCode: true, logoPath: undefined /* server/assets/logos/Oceania/QF.png */ },
  'VA': { primaryColor: '#E5001A', secondaryColor: '#333333', headerTextColor: '#E5001A', fontFamily: 'Helvetica', logoPosition: 'right', paperSize: [595.28, 841.89], usesQrCode: false, logoPath: undefined /* server/assets/logos/Oceania/VA.png */, abn: '36 090 670 965'},
  // ... other airlines from these regions with logoPath: undefined ...

  // --- Default ---
  'default': { primaryColor: '#666666', secondaryColor: '#999999', headerTextColor: '#333333', fontFamily: 'Helvetica', logoPosition: 'center', paperSize: [595.28, 841.89], usesQrCode: false, logoPath: undefined }
};

// --- Helper Functions ---
function getAirlineTemplate(airlineCodeInput: string): AirlineTemplate {
    let code = 'default';
    if (typeof airlineCodeInput === 'string' && airlineCodeInput.length >= 2) {
        code = airlineCodeInput.substring(0, 2).toUpperCase();
    }
    console.log(`[DEBUG_GET_TEMPLATE] Input: ${airlineCodeInput}, Derived Code for Lookup: ${code}, Template Found: ${!!airlineTemplates[code]}`);
    return airlineTemplates[code] || airlineTemplates.default;
}
function getRandomTerminal(): string { return `TERMINAL ${Math.floor(Math.random() * 4) + 1} - INTL`; }
function getRandomAircraft(): string { return COMMON_AIRCRAFT_TYPES[Math.floor(Math.random() * COMMON_AIRCRAFT_TYPES.length)]; }
function safeToString(value: any, defaultValue = 'N/A'): string { if (value === null || typeof value === 'undefined' || String(value).trim() === '') return defaultValue; return String(value); }
function formatDateStyled(dateInput?: string | Date, format: 'short_date_time' | 'full_date' | 'day_month_year' = 'full_date'): string { if (!dateInput) return 'N/A'; try { const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput; if (isNaN(date.getTime())) return typeof dateInput === 'string' ? dateInput : 'N/A'; if (format === 'short_date_time') return `${date.toLocaleDateString(undefined, { weekday: 'long' }).toUpperCase()} ${date.toLocaleDateString(undefined, { day: '2-digit', month: 'short' }).toUpperCase()}`; if (format === 'day_month_year') return `${date.toLocaleDateString(undefined, { day: '2-digit' }).toUpperCase()} ${date.toLocaleDateString(undefined, { month: 'short' }).toUpperCase()} ${date.getFullYear()}`; return `${date.toLocaleDateString(undefined, { weekday: 'long' })} ${date.getDate()} ${date.toLocaleDateString(undefined, { month: 'short' })}`; } catch { return typeof dateInput === 'string' ? dateInput : 'N/A'; } }
function formatTimeStyled(timeInput?: string | Date, useAMPM = true): string { if (!timeInput) return 'N/A'; try { const dateObj = typeof timeInput === 'string' ? new Date(timeInput.includes('T') ? timeInput : `1970-01-01T${timeInput}`) : timeInput; if (isNaN(dateObj.getTime())) { if (typeof timeInput === 'string' && /^\d{1,2}:\d{2}(?:\s*(?:am|pm))?$/i.test(timeInput)) return timeInput.toLowerCase(); if (typeof timeInput === 'string' && /^\d{1,2}:\d{2}$/.test(timeInput)) return timeInput; return typeof timeInput === 'string' ? timeInput : 'N/A'; } let timeStr = dateObj.toLocaleTimeString(undefined, { hour: useAMPM ? 'numeric' : '2-digit', minute: '2-digit', hour12: useAMPM, hourCycle: useAMPM? undefined : 'h23' }); return useAMPM ? timeStr.toLowerCase() : timeStr; } catch { return typeof timeInput === 'string' ? timeInput : 'N/A'; } }
function drawHorizontalLine(doc: PDFKit.PDFDocument, y: number, weight: 'light' | 'heavy' = 'light', color?: string) { doc.moveTo(PAGE_MARGIN, y) .lineTo(doc.page.width - PAGE_MARGIN, y) .strokeColor(color || DEFAULT_BORDER_COLOR) .lineWidth(weight === 'heavy' ? 1.5 : 0.75) .stroke(); }


// --- Drawing Functions ---
function drawAirlineSpecificAccents(doc: PDFKit.PDFDocument, airlineCode: string, template: AirlineTemplate) {
    console.log(`[DEBUG] drawAirlineSpecificAccents called for: "${airlineCode}"`);
    console.log(`[DEBUG] Template received by drawAirlineSpecificAccents: Primary - ${template.primaryColor}, Secondary - ${template.secondaryColor}`);

    if (template.primaryColor && template.secondaryColor) {
        console.log(`[DEBUG] Colors found for "${airlineCode}". Attempting to draw borders.`);
        const pageWidth = doc.page.width;
        const pageHeight = doc.page.height;
        const margin = PAGE_MARGIN / 2.5;
        const lineWeight = 0.75;
        const innerBorderOffset = 2.0;
        const innerMargin = margin + innerBorderOffset;

        doc.rect(margin, margin, pageWidth - 2 * margin, pageHeight - 2 * margin)
           .lineWidth(lineWeight)
           .strokeColor(template.primaryColor)
           .stroke();
        console.log(`[DEBUG] Outer border drawn for "${airlineCode}" with color ${template.primaryColor}`);

        doc.rect(innerMargin, innerMargin, pageWidth - 2 * innerMargin, pageHeight - 2 * innerMargin)
           .lineWidth(lineWeight)
           .strokeColor(template.secondaryColor)
           .stroke();
        console.log(`[DEBUG] Inner border drawn for "${airlineCode}" with color ${template.secondaryColor}`);
    } else {
        console.log(`[DEBUG] Borders NOT drawn for "${airlineCode}" due to missing primary or secondary color in template.`);
    }
    doc.strokeColor(DEFAULT_BORDER_COLOR);
}

function drawTicketHeader(doc: PDFKit.PDFDocument, ticket: TicketWithDetails, template: AirlineTemplate, airlineCode: string) {
    console.log("[PDF_GENERATOR_DEBUG] drawTicketHeader started. Airline Code:", airlineCode);
    const headerStartY = PAGE_MARGIN;
    let currentY = headerStartY;
    const contentRightEdge = doc.page.width - PAGE_MARGIN;

    const depDateFormatted = formatDateStyled(ticket.flight.departure.date, 'day_month_year');
    const arrDateFormatted = formatDateStyled(ticket.flight.arrival.date, 'day_month_year');
    const tripDestCity = ticket.flight.arrival.airport.city;
    const tripDest = safeToString(tripDestCity, 'DESTINATION').toUpperCase();
    const tripSummaryFontSize = FONT_SIZE_MEDIUM + 2;

    doc.font(FONT_BOLD).fontSize(tripSummaryFontSize).fillColor(TEXT_COLOR_DARK)
       .text(`${depDateFormatted} ${arrDateFormatted === depDateFormatted ? '' : '> ' + arrDateFormatted} TRIP TO ${tripDest}`, PAGE_MARGIN, currentY, { align: 'left' });
    currentY += tripSummaryFontSize + 3;
    drawHorizontalLine(doc, currentY, 'light');
    currentY += 10;
    const sectionStartY = currentY;

    // --- UPDATED LOGO SIZE ---
    const LOGO_MAX_WIDTH = 120; // Changed from 180
    const LOGO_MAX_HEIGHT = 60; // Changed from 60
    // --- END OF LOGO SIZE UPDATE ---

    const AIRLINE_NAME_TEXT_FONT_SIZE = FONT_SIZE_XLARGE;
    const airlineName = safeToString(ticket.flight.airline.name, "Airline").toUpperCase();

    const logoX = contentRightEdge - LOGO_MAX_WIDTH;
    const logoY = sectionStartY;

    let absoluteLogoPath: string | undefined = undefined;
    if (template.logoPath) absoluteLogoPath = path.resolve(process.cwd(), template.logoPath);
    let actualLogoVisualHeight = 0;
    let logoDrawnSuccessfully = false;

    if (absoluteLogoPath && fs.existsSync(absoluteLogoPath)) {
        try {
            doc.image(absoluteLogoPath, logoX, logoY, { fit: [LOGO_MAX_WIDTH, LOGO_MAX_HEIGHT], align: 'right', valign: 'top' });
            actualLogoVisualHeight = LOGO_MAX_HEIGHT; // Use max height for layout consistency
            logoDrawnSuccessfully = true;
            console.log(`[PDF_GENERATOR_DEBUG] Image drawn: ${absoluteLogoPath}`);
        } catch (imgError) {
            console.error(`[PDF_GENERATOR_ERROR] Drawing logo ${template.logoPath}:`, imgError);
        }
    } else {
        if (template.logoPath) console.warn(`[PDF_GENERATOR_DEBUG] Logo NOT found: ${absoluteLogoPath || template.logoPath}`);
        else console.warn(`[PDF_GENERATOR_DEBUG] No logoPath for ${airlineName}.`);
    }

    doc.font(FONT_BOLD).fontSize(AIRLINE_NAME_TEXT_FONT_SIZE);
    const airlineNameTextWidth = doc.widthOfString(airlineName);
    const airlineNameTextHeight = doc.heightOfString(airlineName);

    let airlineNameTextX: number;
    let airlineNameTextY: number;
    let airlineNameTextAlign: 'left' | 'center' | 'right' = 'right';

    if (logoDrawnSuccessfully) {
        airlineNameTextX = logoX - airlineNameTextWidth - 7;
        const logoCenterY = logoY + (LOGO_MAX_HEIGHT / 2); // Use new LOGO_MAX_HEIGHT
        airlineNameTextY = logoCenterY - (airlineNameTextHeight / 2);
    } else {
        airlineNameTextX = logoX;
        airlineNameTextY = logoY;
        airlineNameTextAlign = 'right';
        actualLogoVisualHeight = Math.max(actualLogoVisualHeight, airlineNameTextHeight);
    }

    const nameColor = template.headerTextColor || template.secondaryColor || template.primaryColor || TEXT_COLOR_DARK;
    doc.fillColor(nameColor)
       .text(airlineName, airlineNameTextX, airlineNameTextY, {
           width: logoDrawnSuccessfully ? airlineNameTextWidth : LOGO_MAX_WIDTH, // Use new LOGO_MAX_WIDTH
           align: airlineNameTextAlign
       });
    console.log(`[PDF_GENERATOR_DEBUG] Drew airline name text "${airlineName}" for ${airlineCode} with color ${nameColor}`);

    currentY = sectionStartY;
    const leftColX = PAGE_MARGIN;
    doc.font(FONT_REGULAR).fontSize(FONT_SIZE_NORMAL).fillColor(TEXT_COLOR_MEDIUM).text('PREPARED FOR', leftColX, currentY);
    currentY += FONT_SIZE_NORMAL + 2;

    const titleStr = safeToString(ticket.passenger.title, '');
    const firstNameStr = safeToString(ticket.passenger.firstName, 'N/A').toUpperCase();
    const middleNameStr = safeToString(ticket.passenger.middleName, '').toUpperCase();
    const lastNameStr = safeToString(ticket.passenger.lastName, 'N/A').toUpperCase();
    let passengerFullNameDisplay = titleStr ? `${titleStr}. ` : '';
    passengerFullNameDisplay += firstNameStr;
    if (middleNameStr) {
        passengerFullNameDisplay += ` ${middleNameStr}`;
    }
    passengerFullNameDisplay += ` ${lastNameStr}`;
    passengerFullNameDisplay = passengerFullNameDisplay.trim();

    doc.font(FONT_BOLD).fontSize(FONT_SIZE_MEDIUM + 1).fillColor(TEXT_COLOR_DARK).text(passengerFullNameDisplay, leftColX, currentY);
    currentY += FONT_SIZE_MEDIUM + 1 + 12;

    const resCodeLabelX = leftColX;
    const resCodeValueX = leftColX + 130;
    doc.font(FONT_REGULAR).fontSize(FONT_SIZE_NORMAL).fillColor(TEXT_COLOR_MEDIUM).text('RESERVATION CODE', resCodeLabelX, currentY);
    doc.font(FONT_BOLD).fontSize(FONT_SIZE_MEDIUM + 1).fillColor(TEXT_COLOR_DARK)
       .text(safeToString(ticket.bookingReference).toUpperCase(), resCodeValueX, currentY);
    const leftColumnEndY = currentY + FONT_SIZE_MEDIUM + 1;

    let bottomOfRightSection = logoY + actualLogoVisualHeight;
    if (template.abn) {
        const abnTextY = (logoY + actualLogoVisualHeight) + 4; // Should use actualLogoVisualHeight from image or text
        doc.font(FONT_REGULAR).fontSize(FONT_SIZE_SMALL).fillColor(TEXT_COLOR_MEDIUM)
           .text(`ABN ${template.abn}`, logoX, abnTextY, { width: LOGO_MAX_WIDTH, align: 'right' });
        bottomOfRightSection = abnTextY + FONT_SIZE_SMALL;
    }
    
    currentY = Math.max(leftColumnEndY, bottomOfRightSection) + 10;
    drawHorizontalLine(doc, currentY, 'heavy');
    currentY += 10;
    doc.y = currentY;
    console.log("[PDF_GENERATOR_DEBUG] drawTicketHeader finished.");
}

function drawFlightBlock(doc: PDFKit.PDFDocument, ticket: TicketWithDetails, template: AirlineTemplate) {
    console.log("[PDF_GENERATOR_DEBUG] drawFlightBlock started.");
    let currentY = doc.y;
    const flight = ticket.flight; // flight here is FlightWithDetails type

    const departureTerminal = safeToString(flight.departure.terminal || getRandomTerminal()).toUpperCase();
    const arrivalTerminal = safeToString(flight.arrival.terminal || getRandomTerminal()).toUpperCase();
    const aircraftType = safeToString(flight.aircraft || getRandomAircraft());
    const planeIconPath = path.resolve(process.cwd(), 'server/assets/logos/Departure.png');
    const planeIconWidth = 22;
    const planeIconHeight = 18;
    const planeIconYOffset = -4;

    if (fs.existsSync(planeIconPath)) {
        doc.image(planeIconPath, PAGE_MARGIN, currentY + planeIconYOffset, { fit: [planeIconWidth, planeIconHeight], align: 'center', valign: 'center' });
    } else {
        doc.circle(PAGE_MARGIN + (planeIconWidth / 2), currentY + (planeIconHeight / 2) + planeIconYOffset, planeIconWidth / 2 - 2).strokeColor(TEXT_COLOR_DARK).stroke();
        console.warn("[PDF_GENERATOR_DEBUG] DEPARTURE PLANE ICON NOT FOUND AT:", planeIconPath);
    }

    doc.font(FONT_BOLD).fontSize(FONT_SIZE_MEDIUM).fillColor(TEXT_COLOR_DARK)
        .text(`DEPARTURE: ${formatDateStyled(flight.departure.date, 'short_date_time')}`, PAGE_MARGIN + planeIconWidth + 10, currentY);
    doc.font(FONT_REGULAR).fontSize(FONT_SIZE_SMALL).fillColor(TEXT_COLOR_LIGHT)
        .text("Please verify flight times prior to departure", PAGE_MARGIN + 250, currentY + 3);

    currentY += Math.max(FONT_SIZE_MEDIUM, planeIconHeight + Math.abs(planeIconYOffset)) + 10;
    const boxTopLineY = currentY;
    drawHorizontalLine(doc, boxTopLineY, 'light');
    currentY += 5;
    const boxStartY = currentY;

    const col1X = PAGE_MARGIN;
    const col2X = PAGE_MARGIN + 155;
    const col3X = col2X + 160;
    const col4X = col3X + 160;
    const colContentPadding = 5;

    let currentYCol1 = boxStartY;
    doc.font(FONT_BOLD).fontSize(FONT_SIZE_MEDIUM).fillColor(TEXT_COLOR_DARK)
        .text(safeToString(flight.airline.name).toUpperCase(), col1X + colContentPadding, currentYCol1);
    currentYCol1 += FONT_SIZE_MEDIUM + 4;

    // --- CORRECTED FLIGHT NUMBER DISPLAY ---
    // Directly use flight.flightNumber as it should now be the complete flight number (e.g., "SQ1223")
    doc.font(FONT_REGULAR).fontSize(FONT_SIZE_MEDIUM).fillColor(TEXT_COLOR_DARK)
        .text(safeToString(flight.flightNumber).toUpperCase(), col1X + colContentPadding, currentYCol1);
    // --- END OF CORRECTION ---

    currentYCol1 += FONT_SIZE_MEDIUM + 10;

    const fieldsCol1 = [
        { label: "Operated by:", value: safeToString(ticket.flight.operatingAirline || flight.airline.name, 'N/A') },
        { label: "Duration:", value: safeToString(flight.duration) },
        { label: "Fare Type:", value: safeToString(ticket.fareType, 'N/A') }, // Ensure ticket.fareType exists on TicketWithDetails or remove
        { label: "Cabin:", value: safeToString(flight.class, "Economy") },
        { label: "Status:", value: safeToString(ticket.status, "Confirmed") }, // Ensure ticket.status exists on TicketWithDetails or remove
    ];
    fieldsCol1.forEach(f => {
        doc.font(FONT_REGULAR).fontSize(FONT_SIZE_SMALL).fillColor(TEXT_COLOR_LIGHT).text(f.label, col1X + colContentPadding, currentYCol1);
        currentYCol1 += FONT_SIZE_SMALL + 2;
        doc.font(FONT_REGULAR).fontSize(FONT_SIZE_NORMAL).fillColor(TEXT_COLOR_DARK).text(f.value, col1X + colContentPadding, currentYCol1);
        currentYCol1 += FONT_SIZE_NORMAL + 4;
    });
    const col1EndY = currentYCol1;

    let iterY = boxStartY;
    const sharedAirportInfoYOffset = FONT_SIZE_LARGE + 4;
    doc.font(FONT_BOLD).fontSize(FONT_SIZE_LARGE).fillColor(TEXT_COLOR_DARK).text(safeToString(flight.departure.airport.code, 'N/A'), col2X + colContentPadding, iterY);
    doc.font(FONT_REGULAR).fontSize(FONT_SIZE_NORMAL).fillColor(TEXT_COLOR_MEDIUM)
        .text(`${safeToString(flight.departure.airport.name, 'N/A')}`, col2X + colContentPadding, iterY + sharedAirportInfoYOffset);

    const arrowIconPath = path.resolve(process.cwd(), 'server/assets/icons/right_arrow_icon.png');
    if (fs.existsSync(arrowIconPath)) {
        doc.image(arrowIconPath, col2X + 75 + colContentPadding, iterY + 4, { width: 15 });
    } else {
        doc.moveTo(col2X + 75 + colContentPadding, iterY + 10).lineTo(col2X + 85 + colContentPadding, iterY + 10).strokeColor(TEXT_COLOR_DARK).lineWidth(1).stroke();
        console.warn("[PDF_GENERATOR_DEBUG] Arrow icon not found");
    }

    let currentYCol2 = iterY + sharedAirportInfoYOffset + FONT_SIZE_NORMAL + 15;
    doc.font(FONT_REGULAR).fontSize(FONT_SIZE_SMALL).fillColor(TEXT_COLOR_LIGHT).text("Departing At:", col2X + colContentPadding, currentYCol2); currentYCol2 += FONT_SIZE_SMALL + 2;
    doc.font(FONT_BOLD).fontSize(FONT_SIZE_LARGE).fillColor(TEXT_COLOR_DARK).text(formatTimeStyled(flight.departure.time, true), col2X + colContentPadding, currentYCol2); currentYCol2 += FONT_SIZE_LARGE + 5;
    doc.font(FONT_REGULAR).fontSize(FONT_SIZE_SMALL).fillColor(TEXT_COLOR_LIGHT).text("Terminal:", col2X + colContentPadding, currentYCol2); currentYCol2 += FONT_SIZE_SMALL + 2;
    doc.font(FONT_REGULAR).fontSize(FONT_SIZE_NORMAL).fillColor(TEXT_COLOR_DARK).text(departureTerminal, col2X + colContentPadding, currentYCol2);
    const col2EndY = currentYCol2 + FONT_SIZE_NORMAL;

    iterY = boxStartY;
    doc.font(FONT_BOLD).fontSize(FONT_SIZE_LARGE).fillColor(TEXT_COLOR_DARK).text(safeToString(flight.arrival.airport.code, 'N/A'), col3X + colContentPadding, iterY);
    doc.font(FONT_REGULAR).fontSize(FONT_SIZE_NORMAL).fillColor(TEXT_COLOR_MEDIUM)
        .text(`${safeToString(flight.arrival.airport.name, 'N/A')}`, col3X + colContentPadding, iterY + sharedAirportInfoYOffset);

    let currentYCol3 = iterY + sharedAirportInfoYOffset + FONT_SIZE_NORMAL + 15;
    doc.font(FONT_REGULAR).fontSize(FONT_SIZE_SMALL).fillColor(TEXT_COLOR_LIGHT).text("Arriving At:", col3X + colContentPadding, currentYCol3); currentYCol3 += FONT_SIZE_SMALL + 2;
    doc.font(FONT_BOLD).fontSize(FONT_SIZE_LARGE).fillColor(TEXT_COLOR_DARK).text(formatTimeStyled(flight.arrival.time, true), col3X + colContentPadding, currentYCol3); currentYCol3 += FONT_SIZE_LARGE + 5;
    doc.font(FONT_REGULAR).fontSize(FONT_SIZE_SMALL).fillColor(TEXT_COLOR_LIGHT).text("Terminal:", col3X + colContentPadding, currentYCol3); currentYCol3 += FONT_SIZE_SMALL + 2;
    doc.font(FONT_REGULAR).fontSize(FONT_SIZE_NORMAL).fillColor(TEXT_COLOR_DARK).text(arrivalTerminal, col3X + colContentPadding, currentYCol3);
    const col3EndY = currentYCol3 + FONT_SIZE_NORMAL;

    iterY = boxStartY;
    doc.font(FONT_REGULAR).fontSize(FONT_SIZE_SMALL).fillColor(TEXT_COLOR_LIGHT).text("Aircraft:", col4X + colContentPadding, iterY);
    doc.font(FONT_REGULAR).fontSize(FONT_SIZE_NORMAL).fillColor(TEXT_COLOR_DARK).text(aircraftType, col4X + colContentPadding, iterY + FONT_SIZE_SMALL + 2);
    const col4EndY = iterY + FONT_SIZE_SMALL + 2 + FONT_SIZE_NORMAL;

    const boxContentEndY = Math.max(col1EndY, col2EndY, col3EndY, col4EndY) + 5;
    const vLineBottom = boxContentEndY;
    doc.strokeColor(DEFAULT_BORDER_COLOR).lineWidth(0.5);
    doc.moveTo(col2X, boxTopLineY).lineTo(col2X, vLineBottom).stroke();
    doc.moveTo(col3X, boxTopLineY).lineTo(col3X, vLineBottom).stroke();
    doc.moveTo(col4X, boxTopLineY).lineTo(col4X, vLineBottom).stroke();
    drawHorizontalLine(doc, vLineBottom, 'light');
    doc.y = vLineBottom + 5;
    console.log("[PDF_GENERATOR_DEBUG] drawFlightBlock finished.");
}

function drawPassengerInfoBar(doc: PDFKit.PDFDocument, ticket: TicketWithDetails) {
    console.log("[PDF_GENERATOR_DEBUG] drawPassengerInfoBar started.");
    drawHorizontalLine(doc, doc.y + 5, 'light');
    const barY = doc.y + 10;
    const barHeight = FONT_SIZE_NORMAL + FONT_SIZE_MEDIUM + 15;
    const textPadding = 7;
    const textLineHeight = FONT_SIZE_NORMAL + 3;

    doc.rect(PAGE_MARGIN, barY, CONTENT_WIDTH, barHeight).fillColor(MEDIUM_GREY_BG).fill();

    const col1Width = CONTENT_WIDTH * 0.45;
    const col2Width = CONTENT_WIDTH * 0.25;
    const col1X = PAGE_MARGIN + textPadding;
    const col2X = PAGE_MARGIN + col1Width + textPadding;
    const col3X = PAGE_MARGIN + col1Width + col2Width + textPadding;

    const labelY = barY + textPadding;
    const valueY = labelY + textLineHeight;

    doc.font(FONT_REGULAR).fontSize(FONT_SIZE_SMALL).fillColor(TEXT_COLOR_LIGHT).text("Passenger Name:", col1X, labelY);
    const titleStrBar = safeToString(ticket.passenger.title, '');
    const firstNameStrBar = safeToString(ticket.passenger.firstName, 'N/A').toUpperCase();
    const middleNameStrBar = safeToString(ticket.passenger.middleName, '').toUpperCase();
    const lastNameStrBar = safeToString(ticket.passenger.lastName, 'N/A').toUpperCase();
    let passengerFullNameForBar = titleStrBar ? `${titleStrBar}. ` : '';
    passengerFullNameForBar += firstNameStrBar;
    if (middleNameStrBar) {
        passengerFullNameForBar += ` ${middleNameStrBar}`;
    }
    passengerFullNameForBar += ` ${lastNameStrBar}`;
    passengerFullNameForBar = passengerFullNameForBar.trim();
    doc.font(FONT_BOLD).fontSize(FONT_SIZE_MEDIUM).fillColor(TEXT_COLOR_DARK).text(`» ${passengerFullNameForBar}`, col1X, valueY, { width: col1Width - (textPadding * 2) });

    doc.font(FONT_REGULAR).fontSize(FONT_SIZE_SMALL).fillColor(TEXT_COLOR_LIGHT).text("Seats:", col2X, labelY);
    doc.font(FONT_BOLD).fontSize(FONT_SIZE_MEDIUM).fillColor(TEXT_COLOR_DARK).text(safeToString(ticket.seatNumber, 'Check-In Required'), col2X, valueY, { width: col2Width - (textPadding * 2) });

    doc.font(FONT_REGULAR).fontSize(FONT_SIZE_SMALL).fillColor(TEXT_COLOR_LIGHT).text("eTicket Receipt(s):", col3X, labelY);
    doc.font(FONT_BOLD).fontSize(FONT_SIZE_MEDIUM).fillColor(TEXT_COLOR_DARK).text(safeToString(ticket.ticketNumber, ticket.bookingReference), col3X, valueY, { width: CONTENT_WIDTH - (col1X + col1Width + col2Width + textPadding) }); // Adjusted width calculation

    doc.y = barY + barHeight + 5;
    drawHorizontalLine(doc, doc.y, 'light');
    doc.y += PAGE_MARGIN;
    console.log("[PDF_GENERATOR_DEBUG] drawPassengerInfoBar finished.");
}


export async function generateTicketPdf(ticket: TicketWithDetails): Promise<Buffer> {
    console.log("[VERY_TOP_DEBUG] generateTicketPdf called with ticket.flight.airline:", JSON.stringify(ticket?.flight?.airline, null, 2));
    if (!ticket || !ticket.flight || !ticket.passenger || !ticket.flight.airline ||
        !ticket.flight.departure || !ticket.flight.arrival ||
        !ticket.flight.departure.airport || !ticket.flight.arrival.airport ||
        !ticket.flight.departure.date || !ticket.flight.arrival.date
    ) {
        const missingParts: string[] = [];
        if (!ticket) missingParts.push("ticket object");
        else {
            if (!ticket.flight) missingParts.push("ticket.flight");
            else {
                if (!ticket.flight.airline) missingParts.push("ticket.flight.airline");
                if (!ticket.flight.departure) missingParts.push("ticket.flight.departure");
                else {
                    if(!ticket.flight.departure.airport) missingParts.push("ticket.flight.departure.airport");
                    if(!ticket.flight.departure.date) missingParts.push("ticket.flight.departure.date");
                }
                if (!ticket.flight.arrival) missingParts.push("ticket.flight.arrival");
                else {
                    if(!ticket.flight.arrival.airport) missingParts.push("ticket.flight.arrival.airport");
                    if(!ticket.flight.arrival.date) missingParts.push("ticket.flight.arrival.date");
                }
            }
            if (!ticket.passenger) missingParts.push("ticket.passenger");
        }
        const errorMsg = `Incomplete ticket data. Missing: ${missingParts.join(', ')}`;
        console.error(`[PDF_GENERATOR_ERROR] CRITICAL: ${errorMsg}. Data:`, JSON.stringify(ticket, null, 2));
        return Promise.reject(new Error(errorMsg));
    }

    const flightNumberStr = String(ticket.flight.flightNumber || '');
    console.log(`[DEBUG] Raw flight number for airline code derivation: "${flightNumberStr}"`);
    const airlineCodeFromFlightNum = flightNumberStr.substring(0, 2).toUpperCase();
    console.log(`[DEBUG] Derived airlineCodeFromFlightNum: "${airlineCodeFromFlightNum}"`);
    const template = getAirlineTemplate(airlineCodeFromFlightNum);
    console.log(`[DEBUG] In generateTicketPdf for ${airlineCodeFromFlightNum}, template fetched:`, JSON.stringify(template, null, 2));

    return new Promise((resolve, reject) => {
        try {
            console.log(`[PDF_GENERATOR_INFO] Starting PDF. Booking: ${safeToString(ticket.bookingReference)}`);
            const buffers: Buffer[] = [];
            const doc = new PDFDocument({
                size: template.paperSize,
                margins: { top: PAGE_MARGIN, bottom: PAGE_MARGIN, left: PAGE_MARGIN, right: PAGE_MARGIN },
                info: {
                    Title: `Itinerary - ${safeToString(ticket.bookingReference)}`,
                    Author: `${safeToString(ticket.flight.airline.name, 'Airline')}`,
                    Subject: 'Flight Itinerary Confirmation',
                }
            });

            drawAirlineSpecificAccents(doc, airlineCodeFromFlightNum, template);

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => { console.log("[PDF_GENERATOR_INFO] PDF 'end' event. Resolving."); resolve(Buffer.concat(buffers)); });
            doc.on('error', (err: Error) => { console.error("[PDF_GENERATOR_ERROR] PDFKit stream 'error':", err); reject(err); });

            doc.font(FONT_REGULAR);
            drawTicketHeader(doc, ticket, template, airlineCodeFromFlightNum);
            drawFlightBlock(doc, ticket, template);
            drawPassengerInfoBar(doc, ticket);

            console.log("[PDF_GENERATOR_INFO] All drawing done. Calling doc.end().");
            doc.end();
        } catch (error: any) {
            console.error("[PDF_GENERATOR_ERROR] SYNC ERROR:", error.message, "Stack:", error?.stack);
            const errToReject = error instanceof Error ? error : new Error(String(error.message || error));
            if (error.stack && !(errToReject as any).stack) (errToReject as any).stack = error.stack;
            reject(errToReject);
        }
    });
}