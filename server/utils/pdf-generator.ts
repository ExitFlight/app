import PDFDocument from 'pdfkit';
import { TicketWithDetails } from '@shared/schema'; // Ensure this path is correct
import fs from 'fs';
import path from 'path';

// server/utils/pdf-generator.ts
interface AirlineTemplate {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  logoPosition: 'left' | 'center' | 'right';
  paperSize: [number, number]; // [width, height] in PostScript points (1/72 inch)
  usesQrCode: boolean;
  logoPath?: string; // Relative to project root, e.g., 'server/assets/logos/Region/airline.png'
  abn?: string; // For specific airlines like Virgin Australia
}

// Organized by region, ALL airlines from airlineUtil.ts have defined primary/secondary colors.
// TODO: Review and update placeholder colors for accurate branding.
const airlineTemplates: Record<string, AirlineTemplate> = {
  // --- North America ---
  // USA
  'AA': { primaryColor: '#E0242A', secondaryColor: '#0078D2', fontFamily: 'Helvetica', logoPosition: 'left', paperSize: [595.28, 841.89], usesQrCode: true, logoPath: 'server/assets/logos/NorthAmerica/AA.png' },
  'AS': { primaryColor: '#004268', secondaryColor: '#78C0E2', fontFamily: 'Helvetica', logoPosition: 'left', paperSize: [595.28, 841.89], usesQrCode: true, logoPath: 'server/assets/logos/NorthAmerica/AS.png' }, // Alaska - Colors were guesses
  'B6': { primaryColor: '#003876', secondaryColor: '#0090D0', fontFamily: 'Helvetica', logoPosition: 'center', paperSize: [595.28, 841.89], usesQrCode: true, logoPath: 'server/assets/logos/NorthAmerica/B6.png' }, // JetBlue - Colors were guesses
  'DL': { primaryColor: '#E01933', secondaryColor: '#003366', fontFamily: 'Helvetica-Bold', logoPosition: 'center', paperSize: [595.28, 841.89], usesQrCode: true, logoPath: 'server/assets/logos/NorthAmerica/DL.png' },
  'HA': { primaryColor: '#6B2C8F', secondaryColor: '#FBB813', fontFamily: 'Helvetica', logoPosition: 'right', paperSize: [595.28, 841.89], usesQrCode: true, logoPath: 'server/assets/logos/NorthAmerica/HA.png' }, // Hawaiian - Colors were guesses
  'UA': { primaryColor: '#005287', secondaryColor: '#4B92DB', fontFamily: 'Helvetica', logoPosition: 'left', paperSize: [595.28, 841.89], usesQrCode: true, logoPath: 'server/assets/logos/NorthAmerica/UA.png' },
  'WN': { primaryColor: '#FFBF00', secondaryColor: '#304EA0', fontFamily: 'Helvetica', logoPosition: 'center', paperSize: [595.28, 841.89], usesQrCode: true, logoPath: 'server/assets/logos/NorthAmerica/WN.png' }, // Southwest - Colors were guesses
  // Canada
  'AC': { primaryColor: '#F00000', secondaryColor: '#231F20', fontFamily: 'Helvetica', logoPosition: 'left', paperSize: [595.28, 841.89], usesQrCode: true, logoPath: 'server/assets/logos/NorthAmerica/AC.png' }, // Air Canada - Colors were guesses

  // --- Europe ---
  // UK
  'BA': { primaryColor: '#075AAA', secondaryColor: '#EB2226', fontFamily: 'Helvetica', logoPosition: 'center', paperSize: [595.28, 841.89], usesQrCode: true, logoPath: 'server/assets/logos/Europe/BA.png' },
  'VS': { primaryColor: '#E50000', secondaryColor: '#333333', fontFamily: 'Helvetica', logoPosition: 'left', paperSize: [595.28, 841.89], usesQrCode: true, logoPath: 'server/assets/logos/Europe/VS.png' }, // Virgin Atlantic - TODO: Verify/Update brand colors
  // France
  'AF': { primaryColor: '#002157', secondaryColor: '#ED1B2E', fontFamily: 'Helvetica', logoPosition: 'center', paperSize: [595.28, 841.89], usesQrCode: true, logoPath: 'server/assets/logos/Europe/AF.png' },
  // Netherlands
  'KL': { primaryColor: '#00A1E4', secondaryColor: '#FFFFFF', fontFamily: 'Helvetica', logoPosition: 'left', paperSize: [595.28, 841.89], usesQrCode: true, logoPath: 'server/assets/logos/Europe/KL.png' }, // KLM - TODO: Verify/Update brand colors
  // Switzerland
  'LX': { primaryColor: '#E30613', secondaryColor: '#FFFFFF', fontFamily: 'Helvetica', logoPosition: 'center', paperSize: [595.28, 841.89], usesQrCode: true, logoPath:  'server/assets/logos/Europe/LX.png'}, // SWISS - TODO: Verify/Update brand colors
  // Scandinavia
  'SK': { primaryColor: '#004B93', secondaryColor: '#EB2226', fontFamily: 'Helvetica', logoPosition: 'left', paperSize: [595.28, 841.89], usesQrCode: true, logoPath: 'server/assets/logos/Europe/SK.png' }, // SAS - TODO: Verify/Update brand colors
  'DY': { primaryColor: '#D81924', secondaryColor: '#FFFFFF', fontFamily: 'Helvetica', logoPosition: 'center', paperSize: [595.28, 841.89], usesQrCode: true, logoPath: 'server/assets/logos/Europe/DY.png' }, // Norwegian - TODO: Verify/Update brand colors
  

  // --- Middle East ---
  // UAE
  'EK': { primaryColor: '#C8102E', secondaryColor: '#231F20', fontFamily: 'Helvetica-Bold', logoPosition: 'center', paperSize: [595.28, 841.89], usesQrCode: true, logoPath: 'server/assets/logos/MiddleEast/EK.png' }, // Emirates },
  'EY': { primaryColor: '#B7905B', secondaryColor: '#333333', fontFamily: 'Helvetica', logoPosition: 'right', paperSize: [595.28, 841.89], usesQrCode: true, logoPath: 'server/assets/logos/MiddleEast/EY.png'}, // Etihad - TODO: Verify/Update brand colors
  // Qatar
  'QR': { primaryColor: '#5C0632', secondaryColor: '#A4A6A9', fontFamily: 'Helvetica', logoPosition: 'left', paperSize: [595.28, 841.89], usesQrCode: true, logoPath: 'server/assets/logos/MiddleEast/QR.png' },

  // --- Asia ---
  // China
  'AK': { primaryColor: '#FF0000', secondaryColor: '#333333', fontFamily: 'Helvetica', logoPosition: 'center', paperSize: [595.28, 841.89], usesQrCode: true, logoPath: 'server/assets/logos/Asia/AK.png' }, // AirAsia
  'CZ': { primaryColor: '#005BAC', secondaryColor: '#EE2A34', fontFamily: 'Helvetica', logoPosition: 'left', paperSize: [595.28, 841.89], usesQrCode: true, logoPath: 'server/assets/logos/Asia/CZ.png' }, // China Southern - TODO: Verify/Update brand colors
  // Hong Kong
  'CX': { primaryColor: '#006564', secondaryColor: '#A6A8AB', fontFamily: 'Helvetica', logoPosition: 'center', paperSize: [595.28, 841.89], usesQrCode: true, logoPath: 'server/assets/logos/Asia/CX.png' }, // Cathay Pacific
  // Japan
  'JL': { primaryColor: '#D90000', secondaryColor: '#333333', fontFamily: 'Helvetica', logoPosition: 'left', paperSize: [595.28, 841.89], usesQrCode: true, logoPath: 'server/assets/logos/Asia/JL.png'}, // Japan Airlines - TODO: Verify/Update brand colors
  // South Korea
  'KE': { primaryColor: '#0064A0', secondaryColor: '#DA2128', fontFamily: 'Helvetica', logoPosition: 'center', paperSize: [595.28, 841.89], usesQrCode: true, logoPath: 'server/assets/logos/Asia/KE.png' }, // Korean Air - TODO: Verify/Update brand colors
  // Thailand
  'TG': { primaryColor: '#5F259F', secondaryColor: '#FFC700', fontFamily: 'Helvetica', logoPosition: 'right', paperSize: [595.28, 841.89], usesQrCode: true, logoPath: 'server/assets/logos/Asia/TG.png' }, // Thai Airways - TODO: Verify/Update brand colors
  // Singapore
  'SQ': { primaryColor: '#F9A01B', secondaryColor: '#0F4287', fontFamily: 'Helvetica', logoPosition: 'right', paperSize: [595.28, 841.89], usesQrCode: false, logoPath: 'server/assets/logos/Asia/SQ.png' },
  // Malaysia
  'MH': { primaryColor: '#00327D', secondaryColor: '#CC0000', fontFamily: 'Helvetica', logoPosition: 'center', paperSize: [595.28, 841.89], usesQrCode: true, logoPath: 'server/assets/logos/Asia/MH.png' }, // Malaysia Airlines - TODO: Verify/Update brand colors
  // Indonesia
  'GA': { primaryColor: '#1A4A9C', secondaryColor: '#00A89D', fontFamily: 'Helvetica', logoPosition: 'left', paperSize: [595.28, 841.89], usesQrCode: true, logoPath: 'server/assets/logos/Asia/GA.png' }, // Garuda Indonesia - TODO: Verify/Update brand colors
  // Vietnam
  'VN': { primaryColor: '#0066A1', secondaryColor: '#FFCC00', fontFamily: 'Helvetica', logoPosition: 'center', paperSize: [595.28, 841.89], usesQrCode: true, logoPath: 'server/assets/logos/Asia/VN.png' }, // Vietnam Airlines - TODO: Verify/Update brand colors

  // --- Oceania ---
  // Australia
  'QF': { primaryColor: '#E40000', secondaryColor: '#FFFFFF', fontFamily: 'Helvetica', logoPosition: 'left', paperSize: [595.28, 841.89], usesQrCode: true, logoPath: undefined /* server/assets/logos/Oceania/QF.png */ }, // Qantas - TODO: Verify/Update brand colors
  'VA': { primaryColor: '#E5001A', secondaryColor: '#333333', fontFamily: 'Helvetica', logoPosition: 'right', paperSize: [595.28, 841.89], usesQrCode: false, logoPath: undefined, abn: '36 090 670 965' /* server/assets/logos/Oceania/VA.png */ }, // Virgin Australia - TODO: Verify/Update brand colors
  'JQ': { primaryColor: '#F36F21', secondaryColor: '#333333', fontFamily: 'Helvetica', logoPosition: 'center', paperSize: [595.28, 841.89], usesQrCode: true, logoPath: undefined /* server/assets/logos/Oceania/JQ.png */ }, // Jetstar - TODO: Verify/Update brand colors
  // New Zealand
  'NZ': { primaryColor: '#000000', secondaryColor: '#79C29D', fontFamily: 'Helvetica', logoPosition: 'right', paperSize: [595.28, 841.89], usesQrCode: true, logoPath: undefined /* server/assets/logos/Oceania/NZ.png */ }, // Air New Zealand - TODO: Verify/Update brand colors

  // --- Africa ---
  'SA': { primaryColor: '#00387D', secondaryColor: '#FFB612', fontFamily: 'Helvetica', logoPosition: 'left', paperSize: [595.28, 841.89], usesQrCode: true, logoPath: undefined /* server/assets/logos/Africa/SA.png */ }, // South African Airways - TODO: Verify/Update brand colors
  'MS': { primaryColor: '#003366', secondaryColor: '#A0A0A0', fontFamily: 'Helvetica', logoPosition: 'center', paperSize: [595.28, 841.89], usesQrCode: true, logoPath: undefined /* server/assets/logos/Africa/MS.png */ }, // EgyptAir - TODO: Verify/Update brand colors
  'AT': { primaryColor: '#DA2128', secondaryColor: '#009A44', fontFamily: 'Helvetica', logoPosition: 'right', paperSize: [595.28, 841.89], usesQrCode: true, logoPath: undefined /* server/assets/logos/Africa/AT.png */ }, // Royal Air Maroc - TODO: Verify/Update brand colors

  // --- Central America & Caribbean ---
  'CM': { primaryColor: '#004D98', secondaryColor: '#FFCC00', fontFamily: 'Helvetica', logoPosition: 'left', paperSize: [595.28, 841.89], usesQrCode: true, logoPath: undefined /* server/assets/logos/CentralAmerica/CM.png */ }, // Copa Airlines - TODO: Verify/Update brand colors
  'LR': { primaryColor: '#E60000', secondaryColor: '#FFFFFF', fontFamily: 'Helvetica', logoPosition: 'center', paperSize: [595.28, 841.89], usesQrCode: true, logoPath: undefined /* server/assets/logos/CentralAmerica/LR.png */ }, // LACSA (Avianca Costa Rica) - TODO: Verify/Update brand colors
  'AM': { primaryColor: '#005A9E', secondaryColor: '#E11C2C', fontFamily: 'Helvetica', logoPosition: 'right', paperSize: [595.28, 841.89], usesQrCode: true, logoPath: undefined /* server/assets/logos/CentralAmerica/AM.png */ }, // Aeroméxico - TODO: Verify/Update brand colors

  // --- South America ---
  'LA': { primaryColor: '#0033A0', secondaryColor: '#D40000', fontFamily: 'Helvetica', logoPosition: 'left', paperSize: [595.28, 841.89], usesQrCode: true, logoPath: undefined /* server/assets/logos/SouthAmerica/LA.png */ }, // LATAM Chile - TODO: Verify/Update brand colors
  'AV': { primaryColor: '#ED1C24', secondaryColor: '#333333', fontFamily: 'Helvetica', logoPosition: 'center', paperSize: [595.28, 841.89], usesQrCode: true, logoPath: undefined /* server/assets/logos/SouthAmerica/AV.png */ }, // Avianca - TODO: Verify/Update brand colors
  'LP': { primaryColor: '#0033A0', secondaryColor: '#D40000', fontFamily: 'Helvetica', logoPosition: 'right', paperSize: [595.28, 841.89], usesQrCode: true, logoPath: undefined /* server/assets/logos/SouthAmerica/LP.png */ }, // LATAM Perú - TODO: Verify/Update brand colors
  'EQ': { primaryColor: '#004B8C', secondaryColor: '#FFD100', fontFamily: 'Helvetica', logoPosition: 'left', paperSize: [595.28, 841.89], usesQrCode: true, logoPath: undefined /* server/assets/logos/SouthAmerica/EQ.png */ }, // TAME - TODO: Verify/Update brand colors

  // --- Default ---
  'default': { primaryColor: '#666666', secondaryColor: '#999999', fontFamily: 'Helvetica', logoPosition: 'center', paperSize: [595.28, 841.89], usesQrCode: false, logoPath: undefined } // Default colors
};

// ... (rest of your pdf-generator.ts file) ...

// ... (rest of your pdf-generator.ts file) ...
function getAirlineTemplate(airlineCodeInput: string): AirlineTemplate { let code = 'default'; if (typeof airlineCodeInput === 'string' && airlineCodeInput.length >= 2) { code = airlineCodeInput.substring(0, 2).toUpperCase(); } return airlineTemplates[code] || airlineTemplates.default; }
const VA_TEXT_COLOR_DARK = '#222222'; const VA_TEXT_COLOR_MEDIUM = '#555555'; const VA_TEXT_COLOR_LIGHT = '#777777';
const VA_BORDER_COLOR = '#B0B0B0'; const VA_MEDIUM_GREY_BG = '#E0E0E0'; const VA_LIGHT_GREY_BG_COL1 = '#FFFFFF';
const FONT_REGULAR = 'Helvetica'; const FONT_BOLD = 'Helvetica-Bold';
const PAGE_MARGIN = 30; const CONTENT_WIDTH = 595.28 - 2 * PAGE_MARGIN;
const FONT_SIZE_SMALL = 9; const FONT_SIZE_NORMAL = 10; const FONT_SIZE_MEDIUM = 12;
const FONT_SIZE_LARGE = 14; const FONT_SIZE_XLARGE = 20;
const COMMON_AIRCRAFT_TYPES = [ "Airbus A320", "Airbus A321", "Airbus A330-300", "Airbus A350-900", "Boeing 737-800", "Boeing 787-9" ];
function getRandomTerminal(): string { return `TERMINAL ${Math.floor(Math.random() * 4) + 1} - INTL`; }
function getRandomAircraft(): string { return COMMON_AIRCRAFT_TYPES[Math.floor(Math.random() * COMMON_AIRCRAFT_TYPES.length)]; }
function safeToString(value: any, defaultValue = 'N/A'): string { if (value === null || typeof value === 'undefined' || String(value).trim() === '') return defaultValue; return String(value); }
function formatDateVA(dateInput?: string | Date, format: 'short_date_time' | 'full_date' | 'day_month_year' = 'full_date'): string {     if (!dateInput) return 'N/A'; try { const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput; if (isNaN(date.getTime())) return typeof dateInput === 'string' ? dateInput : 'N/A'; if (format === 'short_date_time') return `${date.toLocaleDateString(undefined, { weekday: 'long' }).toUpperCase()} ${date.toLocaleDateString(undefined, { day: '2-digit', month: 'short' }).toUpperCase()}`; if (format === 'day_month_year') return `${date.toLocaleDateString(undefined, { day: '2-digit' }).toUpperCase()} ${date.toLocaleDateString(undefined, { month: 'short' }).toUpperCase()} ${date.getFullYear()}`; return `${date.toLocaleDateString(undefined, { weekday: 'long' })} ${date.getDate()} ${date.toLocaleDateString(undefined, { month: 'short' })}`; } catch { return typeof dateInput === 'string' ? dateInput : 'N/A'; } }
function formatTimeVA(timeInput?: string | Date, useAMPM = true): string {     if (!timeInput) return 'N/A'; try { const dateObj = typeof timeInput === 'string' ? new Date(timeInput.includes('T') ? timeInput : `1970-01-01T${timeInput}`) : timeInput; if (isNaN(dateObj.getTime())) { if (typeof timeInput === 'string' && /^\d{1,2}:\d{2}(?:\s*(?:am|pm))?$/i.test(timeInput)) return timeInput.toLowerCase(); if (typeof timeInput === 'string' && /^\d{1,2}:\d{2}$/.test(timeInput)) return timeInput; return typeof timeInput === 'string' ? timeInput : 'N/A'; } let timeStr = dateObj.toLocaleTimeString(undefined, { hour: useAMPM ? 'numeric' : '2-digit', minute: '2-digit', hour12: useAMPM, hourCycle: useAMPM? undefined : 'h23' }); return useAMPM ? timeStr.toLowerCase() : timeStr; } catch { return typeof timeInput === 'string' ? timeInput : 'N/A'; } }
function drawHorizontalLine(doc: PDFKit.PDFDocument, y: number, weight: 'light' | 'heavy' = 'light', color?: string) {     doc.moveTo(PAGE_MARGIN, y) .lineTo(doc.page.width - PAGE_MARGIN, y) .strokeColor(color || VA_BORDER_COLOR) .lineWidth(weight === 'heavy' ? 1.5 : 0.75) .stroke(); }

function drawAirlineSpecificAccents(doc: PDFKit.PDFDocument, airlineCode: string, template: AirlineTemplate) {
    if (airlineCode === 'SQ') {
        const pageWidth = doc.page.width;
        const pageHeight = doc.page.height;
        const margin = PAGE_MARGIN / 2.5; 
        const lineWeight = 0.75; 

        doc.rect(margin, margin, pageWidth - 2 * margin, pageHeight - 2 * margin)
           .lineWidth(lineWeight)
           .strokeColor(template.primaryColor) // SQ Yellow
           .stroke();

        const innerMargin = margin + 2.0; 
        doc.rect(innerMargin, innerMargin, pageWidth - 2 * innerMargin, pageHeight - 2 * innerMargin)
           .lineWidth(lineWeight)
           .strokeColor(template.secondaryColor) // SQ Blue
           .stroke();
        
        doc.strokeColor(VA_BORDER_COLOR); 
    }
}

function drawVATopHeader(doc: PDFKit.PDFDocument, ticket: TicketWithDetails, template: AirlineTemplate, airlineCode: string) {
    console.log("[PDF_GENERATOR_DEBUG] drawVATopHeader started. Airline Code:", airlineCode);
    const headerStartY = PAGE_MARGIN;
    let currentY = headerStartY;
    const contentRightEdge = doc.page.width - PAGE_MARGIN;

    const depDateFormatted = formatDateVA(ticket.flight.departure.date, 'day_month_year');
    const arrDateFormatted = formatDateVA(ticket.flight.arrival.date, 'day_month_year');
    const tripDestCity = ticket.flight.arrival.airport.city;
    const tripDest = safeToString(tripDestCity, 'DESTINATION').toUpperCase();
    const tripSummaryFontSize = FONT_SIZE_MEDIUM + 2;

    doc.font(FONT_BOLD).fontSize(tripSummaryFontSize).fillColor(VA_TEXT_COLOR_DARK)
       .text(`${depDateFormatted} ${arrDateFormatted === depDateFormatted ? '' : '> ' + arrDateFormatted} TRIP TO ${tripDest}`, PAGE_MARGIN, currentY, { align: 'left' });
    currentY += tripSummaryFontSize + 3;
    drawHorizontalLine(doc, currentY, 'light');
    currentY += 10;

    const sectionStartY = currentY;

    const LOGO_MAX_WIDTH = 180;
    const LOGO_MAX_HEIGHT = 60;
    const logoX = contentRightEdge - LOGO_MAX_WIDTH;
    const logoY = sectionStartY;

    const airlineName = safeToString(ticket.flight.airline.name, "Airline");
    let absoluteLogoPath: string | undefined = undefined;
    if (template.logoPath) absoluteLogoPath = path.resolve(process.cwd(), template.logoPath);

    let actualLogoVisualHeight = 0; 
    if (absoluteLogoPath && fs.existsSync(absoluteLogoPath)) {
        try {
            doc.image(absoluteLogoPath, logoX, logoY, { fit: [LOGO_MAX_WIDTH, LOGO_MAX_HEIGHT], align: 'right', valign: 'top' });
            actualLogoVisualHeight = LOGO_MAX_HEIGHT;
            console.log(`[PDF_GENERATOR_DEBUG] Image drawn: ${absoluteLogoPath}`);
        } catch (imgError) {
            console.error(`[PDF_GENERATOR_ERROR] Drawing logo ${template.logoPath}:`, imgError);
            doc.font(FONT_BOLD).fontSize(FONT_SIZE_XLARGE).fillColor(template.primaryColor)
               .text(airlineName.toUpperCase(), logoX, logoY, { width: LOGO_MAX_WIDTH, align: 'right' });
            actualLogoVisualHeight = FONT_SIZE_XLARGE;
        }
    } else {
        if (template.logoPath) console.warn(`[PDF_GENERATOR_DEBUG] Logo NOT found: ${absoluteLogoPath || template.logoPath}`);
        else console.warn(`[PDF_GENERATOR_DEBUG] No logoPath for ${airlineName}.`);
        doc.font(FONT_BOLD).fontSize(FONT_SIZE_XLARGE).fillColor(template.primaryColor)
           .text(airlineName.toUpperCase(), logoX, logoY, { width: LOGO_MAX_WIDTH, align: 'right' });
        actualLogoVisualHeight = FONT_SIZE_XLARGE;
    }

    if (airlineCode === 'SQ') {
        const sqTextFontSize = FONT_SIZE_XLARGE; 
        const sqText = airlineName.toUpperCase(); // "SINGAPORE AIRLINES"
        doc.font(FONT_BOLD).fontSize(sqTextFontSize);
        const sqTextWidth = doc.widthOfString(sqText);
        const sqTextX = logoX - sqTextWidth - 10; 
        
        const logoCenterY = logoY + (LOGO_MAX_HEIGHT / 2); 
        // Correct way to get height and descent after font is set
        const textHeight = doc.heightOfString(sqText, { width: sqTextWidth });
        // PDFKit doesn't directly expose 'descent' easily after the fact without more complex fontkit usage.
        // For simple vertical centering, using textHeight is often sufficient.
        // A common approximation for vertical centering text against an image's middle:
        const sqTextDrawY = logoCenterY - (textHeight / 2);

        doc.fillColor(template.secondaryColor) // SQ Blue for the text
           .text(sqText, sqTextX, sqTextDrawY, {
               width: sqTextWidth, 
               align: 'right' 
           });
    }

    let rightColumnEndY = logoY + actualLogoVisualHeight;
    if (template.abn) {
        const abnTextY = logoY + actualLogoVisualHeight + 4;
        doc.font(FONT_REGULAR).fontSize(FONT_SIZE_SMALL).fillColor(VA_TEXT_COLOR_MEDIUM)
           .text(`ABN ${template.abn}`, logoX, abnTextY, { width: LOGO_MAX_WIDTH, align: 'right' });
        rightColumnEndY = abnTextY + FONT_SIZE_SMALL;
    }

    currentY = sectionStartY;
    const leftColX = PAGE_MARGIN;
    const resCodeLabelX = leftColX;
    const resCodeValueX = leftColX + 130;

    doc.font(FONT_REGULAR).fontSize(FONT_SIZE_NORMAL).fillColor(VA_TEXT_COLOR_MEDIUM).text('PREPARED FOR', leftColX, currentY);
    currentY += FONT_SIZE_NORMAL + 2;
    const passengerTitle = safeToString(ticket.passenger.title, '').toUpperCase();
    const passengerNameVal = `${passengerTitle}${passengerTitle ? ' ' : ''}${safeToString(ticket.passenger.firstName).toUpperCase()} ${safeToString(ticket.passenger.lastName).toUpperCase()}`.trim();
    doc.font(FONT_BOLD).fontSize(FONT_SIZE_MEDIUM + 1).fillColor(VA_TEXT_COLOR_DARK).text(passengerNameVal, leftColX, currentY);
    currentY += FONT_SIZE_MEDIUM + 1 + 12;

    const resCodeY = currentY;
    doc.font(FONT_REGULAR).fontSize(FONT_SIZE_NORMAL).fillColor(VA_TEXT_COLOR_MEDIUM).text('RESERVATION CODE', resCodeLabelX, resCodeY);
    doc.font(FONT_BOLD).fontSize(FONT_SIZE_MEDIUM + 1).fillColor(VA_TEXT_COLOR_DARK)
       .text(safeToString(ticket.bookingReference).toUpperCase(), resCodeValueX, resCodeY);
    const leftColumnEndY = resCodeY + FONT_SIZE_MEDIUM + 1;

    currentY = Math.max(leftColumnEndY, rightColumnEndY) + 10;

    drawHorizontalLine(doc, currentY, 'heavy');
    currentY += 10;
    doc.y = currentY;
    console.log("[PDF_GENERATOR_DEBUG] drawVATopHeader finished.");
}

function drawVAFlightBlock(doc: PDFKit.PDFDocument, ticket: TicketWithDetails, template: AirlineTemplate) { /* ... same as before ... */     console.log("[PDF_GENERATOR_DEBUG] drawVAFlightBlock started."); let currentY = doc.y; const flight = ticket.flight; const departureTerminal = safeToString(flight.departure.terminal || getRandomTerminal()).toUpperCase(); const arrivalTerminal = safeToString(flight.arrival.terminal || getRandomTerminal()).toUpperCase(); const aircraftType = safeToString(flight.aircraft || getRandomAircraft()); const planeIconPath = path.resolve(process.cwd(), 'server/assets/logos/Departure.png');  const planeIconWidth = 22; const planeIconHeight = 18; const planeIconYOffset = -4;  if (fs.existsSync(planeIconPath)) { doc.image(planeIconPath, PAGE_MARGIN, currentY + planeIconYOffset , { fit: [planeIconWidth, planeIconHeight], align: 'center', valign: 'center'}); } else { doc.circle(PAGE_MARGIN + (planeIconWidth/2), currentY + (planeIconHeight/2) + planeIconYOffset, planeIconWidth/2 -2).strokeColor(VA_TEXT_COLOR_DARK).stroke(); console.warn("[PDF_GENERATOR_DEBUG] DEPARTURE PLANE ICON NOT FOUND AT:", planeIconPath); } doc.font(FONT_BOLD).fontSize(FONT_SIZE_MEDIUM).fillColor(VA_TEXT_COLOR_DARK) .text(`DEPARTURE: ${formatDateVA(flight.departure.date, 'short_date_time')}`, PAGE_MARGIN + planeIconWidth + 10, currentY); doc.font(FONT_REGULAR).fontSize(FONT_SIZE_SMALL).fillColor(VA_TEXT_COLOR_LIGHT) .text("Please verify flight times prior to departure", PAGE_MARGIN + 250, currentY + 3); currentY += Math.max(FONT_SIZE_MEDIUM, planeIconHeight + Math.abs(planeIconYOffset)) + 10;  const boxTopLineY = currentY; drawHorizontalLine(doc, boxTopLineY, 'light');  currentY += 5;  const boxStartY = currentY; const col1X = PAGE_MARGIN; const col2X = PAGE_MARGIN + 155; const col3X = col2X + 160; const col4X = col3X + 160; const colContentPadding = 5;  let currentYCol1 = boxStartY; doc.font(FONT_BOLD).fontSize(FONT_SIZE_MEDIUM).fillColor(VA_TEXT_COLOR_DARK).text(safeToString(flight.airline.name).toUpperCase(), col1X + colContentPadding, currentYCol1); currentYCol1 += FONT_SIZE_MEDIUM + 4; doc.font(FONT_REGULAR).fontSize(FONT_SIZE_MEDIUM).fillColor(VA_TEXT_COLOR_DARK).text(`${safeToString(flight.airline.code).toUpperCase()} ${safeToString(flight.flightNumber)}`, col1X + colContentPadding, currentYCol1); currentYCol1 += FONT_SIZE_MEDIUM + 10; const fieldsCol1 = [ {label: "Operated by:", value: safeToString(ticket.flight.operatingAirline || flight.airline.name, 'N/A')}, {label: "Duration:", value: safeToString(flight.duration)}, {label: "Fare Type:", value: safeToString(ticket.fareType, 'N/A')}, {label: "Cabin:", value: safeToString(flight.class, "Economy")}, {label: "Status:", value: safeToString(ticket.status, "Confirmed")}, ]; fieldsCol1.forEach(f => { doc.font(FONT_REGULAR).fontSize(FONT_SIZE_SMALL).fillColor(VA_TEXT_COLOR_LIGHT).text(f.label, col1X + colContentPadding, currentYCol1); currentYCol1 += FONT_SIZE_SMALL + 2; doc.font(FONT_REGULAR).fontSize(FONT_SIZE_NORMAL).fillColor(VA_TEXT_COLOR_DARK).text(f.value, col1X + colContentPadding, currentYCol1); currentYCol1 += FONT_SIZE_NORMAL + 4; }); const col1EndY = currentYCol1; let iterY = boxStartY;  const sharedAirportInfoYOffset = FONT_SIZE_LARGE + 4; doc.font(FONT_BOLD).fontSize(FONT_SIZE_LARGE).fillColor(VA_TEXT_COLOR_DARK).text(safeToString(flight.departure.airport.code, 'N/A'), col2X + colContentPadding, iterY); doc.font(FONT_REGULAR).fontSize(FONT_SIZE_NORMAL).fillColor(VA_TEXT_COLOR_MEDIUM) .text(`${safeToString(flight.departure.airport.name, 'N/A')}`, col2X + colContentPadding, iterY + sharedAirportInfoYOffset);  const arrowIconPath = path.resolve(process.cwd(), 'server/assets/icons/right_arrow_icon.png'); if (fs.existsSync(arrowIconPath)) { doc.image(arrowIconPath, col2X + 75 + colContentPadding, iterY + 4 , {width: 15}); } else { doc.moveTo(col2X + 75+colContentPadding, iterY + 10).lineTo(col2X + 85+colContentPadding, iterY + 10).strokeColor(VA_TEXT_COLOR_DARK).lineWidth(1).stroke(); console.warn("[PDF_GENERATOR_DEBUG] Arrow icon not found");} let currentYCol2 = iterY + sharedAirportInfoYOffset + FONT_SIZE_NORMAL + 15; doc.font(FONT_REGULAR).fontSize(FONT_SIZE_SMALL).fillColor(VA_TEXT_COLOR_LIGHT).text("Departing At:", col2X + colContentPadding, currentYCol2); currentYCol2 += FONT_SIZE_SMALL + 2; doc.font(FONT_BOLD).fontSize(FONT_SIZE_LARGE).fillColor(VA_TEXT_COLOR_DARK).text(formatTimeVA(flight.departure.time, true), col2X + colContentPadding, currentYCol2); currentYCol2 += FONT_SIZE_LARGE + 5; doc.font(FONT_REGULAR).fontSize(FONT_SIZE_SMALL).fillColor(VA_TEXT_COLOR_LIGHT).text("Terminal:", col2X + colContentPadding, currentYCol2); currentYCol2 += FONT_SIZE_SMALL + 2; doc.font(FONT_REGULAR).fontSize(FONT_SIZE_NORMAL).fillColor(VA_TEXT_COLOR_DARK).text(departureTerminal, col2X + colContentPadding, currentYCol2); const col2EndY = currentYCol2 + FONT_SIZE_NORMAL; iterY = boxStartY; doc.font(FONT_BOLD).fontSize(FONT_SIZE_LARGE).fillColor(VA_TEXT_COLOR_DARK).text(safeToString(flight.arrival.airport.code, 'N/A'), col3X + colContentPadding, iterY); doc.font(FONT_REGULAR).fontSize(FONT_SIZE_NORMAL).fillColor(VA_TEXT_COLOR_MEDIUM) .text(`${safeToString(flight.arrival.airport.name, 'N/A')}`, col3X + colContentPadding, iterY + sharedAirportInfoYOffset); let currentYCol3 = iterY + sharedAirportInfoYOffset + FONT_SIZE_NORMAL + 15; doc.font(FONT_REGULAR).fontSize(FONT_SIZE_SMALL).fillColor(VA_TEXT_COLOR_LIGHT).text("Arriving At:", col3X + colContentPadding, currentYCol3); currentYCol3 += FONT_SIZE_SMALL + 2; doc.font(FONT_BOLD).fontSize(FONT_SIZE_LARGE).fillColor(VA_TEXT_COLOR_DARK).text(formatTimeVA(flight.arrival.time, true), col3X + colContentPadding, currentYCol3); currentYCol3 += FONT_SIZE_LARGE + 5; doc.font(FONT_REGULAR).fontSize(FONT_SIZE_SMALL).fillColor(VA_TEXT_COLOR_LIGHT).text("Terminal:", col3X + colContentPadding, currentYCol3); currentYCol3 += FONT_SIZE_SMALL + 2; doc.font(FONT_REGULAR).fontSize(FONT_SIZE_NORMAL).fillColor(VA_TEXT_COLOR_DARK).text(arrivalTerminal, col3X + colContentPadding, currentYCol3); const col3EndY = currentYCol3 + FONT_SIZE_NORMAL; iterY = boxStartY; doc.font(FONT_REGULAR).fontSize(FONT_SIZE_SMALL).fillColor(VA_TEXT_COLOR_LIGHT).text("Aircraft:", col4X + colContentPadding, iterY); doc.font(FONT_REGULAR).fontSize(FONT_SIZE_NORMAL).fillColor(VA_TEXT_COLOR_DARK).text(aircraftType, col4X + colContentPadding, iterY + FONT_SIZE_SMALL + 2); const col4EndY = iterY + FONT_SIZE_SMALL + 2 + FONT_SIZE_NORMAL; const boxContentEndY = Math.max(col1EndY, col2EndY, col3EndY, col4EndY) + 5; const vLineBottom = boxContentEndY; doc.strokeColor(VA_BORDER_COLOR).lineWidth(0.5); doc.moveTo(col2X, boxTopLineY).lineTo(col2X, vLineBottom).stroke(); doc.moveTo(col3X, boxTopLineY).lineTo(col3X, vLineBottom).stroke(); doc.moveTo(col4X, boxTopLineY).lineTo(col4X, vLineBottom).stroke(); drawHorizontalLine(doc, vLineBottom, 'light'); doc.y = vLineBottom + 5; console.log("[PDF_GENERATOR_DEBUG] drawVAFlightBlock finished."); }
function drawVAPassengerInfoBar(doc: PDFKit.PDFDocument, ticket: TicketWithDetails) { /* ... same as previous ... */     console.log("[PDF_GENERATOR_DEBUG] drawVAPassengerInfoBar started."); drawHorizontalLine(doc, doc.y + 5, 'light'); const barY = doc.y + 10;  const barHeight = FONT_SIZE_NORMAL + FONT_SIZE_MEDIUM + 15;  const textPadding = 7; const textLineHeight = FONT_SIZE_NORMAL + 3; doc.rect(PAGE_MARGIN, barY, CONTENT_WIDTH, barHeight).fillColor(VA_MEDIUM_GREY_BG).fill(); const col1Width = CONTENT_WIDTH * 0.45;  const col2Width = CONTENT_WIDTH * 0.25;  const col1X = PAGE_MARGIN + textPadding; const col2X = PAGE_MARGIN + col1Width + textPadding; const col3X = PAGE_MARGIN + col1Width + col2Width + textPadding; const labelY = barY + textPadding; const valueY = labelY + textLineHeight; doc.font(FONT_REGULAR).fontSize(FONT_SIZE_SMALL).fillColor(VA_TEXT_COLOR_LIGHT).text("Passenger Name:", col1X, labelY); const passengerTitle = safeToString(ticket.passenger.title, '').toUpperCase(); const passengerName = `${passengerTitle}${passengerTitle ? ' ' : ''}${safeToString(ticket.passenger.firstName).toUpperCase()} ${safeToString(ticket.passenger.lastName).toUpperCase()}`.trim(); doc.font(FONT_BOLD).fontSize(FONT_SIZE_MEDIUM).fillColor(VA_TEXT_COLOR_DARK).text(`» ${passengerName}`, col1X, valueY, { width: col1Width - (textPadding * 2) }); doc.font(FONT_REGULAR).fontSize(FONT_SIZE_SMALL).fillColor(VA_TEXT_COLOR_LIGHT).text("Seats:", col2X, labelY); doc.font(FONT_BOLD).fontSize(FONT_SIZE_MEDIUM).fillColor(VA_TEXT_COLOR_DARK).text(safeToString(ticket.seatNumber, 'Check-In Required'), col2X, valueY, { width: col2Width - (textPadding*2) }); doc.font(FONT_REGULAR).fontSize(FONT_SIZE_SMALL).fillColor(VA_TEXT_COLOR_LIGHT).text("eTicket Receipt(s):", col3X, labelY); doc.font(FONT_BOLD).fontSize(FONT_SIZE_MEDIUM).fillColor(VA_TEXT_COLOR_DARK).text(safeToString(ticket.ticketNumber, ticket.bookingReference), col3X, valueY, { width: CONTENT_WIDTH - col3X + PAGE_MARGIN - textPadding});  doc.y = barY + barHeight + 5; drawHorizontalLine(doc, doc.y, 'light'); doc.y += PAGE_MARGIN; console.log("[PDF_GENERATOR_DEBUG] drawVAPassengerInfoBar finished."); }

export async function generateTicketPdf(ticket: TicketWithDetails): Promise<Buffer> {
    // Data validation at the start
    if (!ticket || !ticket.flight || !ticket.passenger || !ticket.flight.airline ||
        !ticket.flight.departure || !ticket.flight.arrival ||
        !ticket.flight.departure.airport || !ticket.flight.arrival.airport ||
        !ticket.flight.departure.date || !ticket.flight.arrival.date // Ensure arrival date for header too
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
                    if(!ticket.flight.arrival.date) missingParts.push("ticket.flight.arrival.date"); // Added check
                }
            }
            if (!ticket.passenger) missingParts.push("ticket.passenger");
        }
        if (missingParts.length > 0) {
            console.error(`[PDF_GENERATOR_ERROR] CRITICAL: Ticket data incomplete. Missing: ${missingParts.join(', ')}. Data:`, JSON.stringify(ticket, null, 2));
            return Promise.reject(new Error(`Incomplete ticket data. Missing: ${missingParts.join(', ')}`));
        }
    }

    const flightNumberStr = String(ticket.flight.flightNumber || '');
    console.log(`[DEBUG] Raw flight number for airline code derivation: "${flightNumberStr}"`);
    const airlineCodeFromFlightNum = flightNumberStr.substring(0, 2).toUpperCase();
    console.log(`[DEBUG] Derived airlineCodeFromFlightNum: "${airlineCodeFromFlightNum}"`); // ADD THIS
    const template = getAirlineTemplate(airlineCodeFromFlightNum);

  return new Promise((resolve, reject) => {
    try {
      console.log("[PDF_GENERATOR_INFO] Starting PDF. Booking:", safeToString(ticket.bookingReference));
      const buffers: Buffer[] = [];
      const doc = new PDFDocument({
        size: template.paperSize,
        margins: { top: PAGE_MARGIN, bottom: PAGE_MARGIN, left: PAGE_MARGIN, right: PAGE_MARGIN } ,
        info: { /* ... same info ... */ 
            Title: `Itinerary - ${safeToString(ticket.bookingReference)}`, 
            Author: `${safeToString(ticket.flight.airline.name, 'Airline')}`, 
            Subject: 'Flight Itinerary Confirmation',
        }
      });

      // --- Call specific accent drawing function HERE, after doc instantiation ---
      drawAirlineSpecificAccents(doc, airlineCodeFromFlightNum, template);

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => { console.log("[PDF_GENERATOR_INFO] PDF 'end' event. Resolving."); resolve(Buffer.concat(buffers)); });
      doc.on('error', (err: Error) => { console.error("[PDF_GENERATOR_ERROR] PDFKit stream 'error':", err); reject(err); });

      doc.font(FONT_REGULAR);
      // Pass airlineCode to drawVATopHeader so it knows when to draw SQ specific text
      drawVATopHeader(doc, ticket, template, airlineCodeFromFlightNum); 
      drawVAFlightBlock(doc, ticket, template);
      drawVAPassengerInfoBar(doc, ticket);
      
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