// Airline logos from reliable sources
export const airlineLogos = {
  delta: "https://logos-world.net/wp-content/uploads/2020/11/Delta-Air-Lines-Logo.png",
  american: "https://logos-world.net/wp-content/uploads/2020/11/American-Airlines-Logo.png",
  united: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/United_Airlines_logo_2019.svg/2560px-United_Airlines_logo_2019.svg.png",
  british: "https://1000logos.net/wp-content/uploads/2020/04/British-Airways-Logo.png",
};

// Flight images from Unsplash (reliable source)
export const flightImages = [
  "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3",
  "https://images.unsplash.com/photo-1542296332-2e4473faf563?ixlib=rb-4.0.3",
  "https://images.unsplash.com/photo-1559769775-9d9d4f5cfc7d?ixlib=rb-4.0.3",
  "https://images.unsplash.com/photo-1517479149777-5f3b1511d5ad?ixlib=rb-4.0.3",
];

// Function to format dates for the tickets
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Function to calculate boarding time (typically 30 mins before departure)
export function calculateBoardingTime(departureTime: string): string {
  const [hours, minutes] = departureTime.split(':').map(Number);
  
  const date = new Date();
  date.setHours(hours, minutes);
  date.setMinutes(date.getMinutes() - 30);
  
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

// Generate a random booking reference (6 alphanumeric characters)
export function generateBookingReference(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Generate a random seat number based on preference
export function generateSeatNumber(preference?: string): string {
  const row = Math.floor(Math.random() * 30) + 1;
  let seat: string;
  
  if (preference === 'window') {
    // A or F
    seat = Math.random() > 0.5 ? 'A' : 'F';
  } else if (preference === 'aisle') {
    // C or D
    seat = Math.random() > 0.5 ? 'C' : 'D';
  } else if (preference === 'middle') {
    // B or E
    seat = Math.random() > 0.5 ? 'B' : 'E';
  } else {
    // Any seat
    seat = String.fromCharCode(65 + Math.floor(Math.random() * 6)); // A-F
  }
  
  return `${row}${seat}`;
}
