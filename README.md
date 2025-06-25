# ✈️ ExitFlight: E-Ticket Generator & Booking Simulator

**ExitFlight is a full-stack application designed to simulate the core functionalities of a flight booking system, from selecting flights and inputting passenger details to generating dynamic PDF e-tickets and receiving email confirmations.**

This project serves as a practical demonstration of building a modern web application that incorporates a range of technologies, from frontend UI design to backend API development, database interaction, and external service integrations like PDF generation and email sending.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 📸 Project Showcase

*(This is the most important section! Replace the placeholders below with your actual screenshots. A common practice is to create a `.github/assets` folder in your repository to store them.)*

**1. Flight Selection Interface**
<br> *Users can easily select departure and arrival locations, dates, and airlines.*
<!-- ![Flight Selection UI](./.github/assets/flight-selection.png) -->

**2. Passenger Details Form**
<br> *A clean, validated form for capturing necessary passenger information.*
<!-- ![Passenger Details Form](./.github/assets/passenger-details-form.png) -->

**3. Generated PDF E-Ticket Examples**
<br> *PDFs are dynamically branded with the airline's logo and colors.*

| Singapore Airlines E-Ticket | American Airlines E-Ticket |
| :---: | :---: |
| <!-- ![Sample PDF Ticket for SQ](./.github/assets/sample-pdf-ticket-sq.png) --> | <!-- ![Sample PDF Ticket for AA](./.github/assets/sample-pdf-ticket-aa.png) --> |

**4. Email Confirmation Preview (Ethereal)**
<br> *The HTML email is also branded and includes the generated PDF as an attachment.*
<!-- ![Sample Email Confirmation](./.github/assets/sample-email-preview.png) -->

---

## ✨ Key Features

*   **✈️ Dynamic Flight Selection:**
    *   (Enhanced Version) Input origin, destination, and date to dynamically calculate estimated flight details using the **Haversine formula** for distance and realistic flight duration estimates.
    *   Select preferred airline and manually input flight number digits.
    *   Choose a cabin class (e.g., Economy, Business).

*   **📝 Comprehensive Passenger Details:**
    *   Secure and user-friendly forms for all necessary passenger information (title, name, contact, nationality).
    *   Robust client-side validation using **Zod**.
    *   Persistence of passenger details across browser sessions via `localStorage` for convenience.

*   **📄 Dynamic PDF E-Ticket Generation:**
    *   Generates professional-looking PDF e-tickets on the fly using `pdfkit`.
    *   **Airline-Specific Branding:** Customizes PDF appearance (borders, header colors, logos) based on the selected airline for a realistic touch.
    *   Includes all relevant flight info, passenger details, a unique booking reference, and generic travel advice.

*   **📧 Email Confirmation & Delivery:**
    *   Sends automated HTML email confirmations to the passenger with the generated PDF e-ticket attached.
    *   **Branded Emails:** Dynamically styles HTML email content (headers, buttons) using the selected airline's brand colors.
    *   Utilizes **Ethereal.email** for robust email testing in the development environment.

*   **🖥️ Modern User Interface:**
    *   Clean, responsive, and intuitive UI built with **React** and **Vite**.
    *   Leverages **Shadcn/UI** components and styled with **Tailwind CSS** for a polished look.
    *   A multi-step progress stepper guides users smoothly through the booking flow.

*   **⚙️ Robust Backend & Data Flow:**
    *   **Node.js** and **Express.js** backend providing RESTful API endpoints.
    *   **Full TypeScript Stack:** End-to-end type safety for improved code quality and maintainability.
    *   **Shared Schemas:** Uses **Zod** for schema definition and validation on both the client and server.
    *   Currently uses an in-memory storage solution (`MemStorage`) for easy setup, with **Drizzle ORM** schemas defined for a straightforward migration to **PostgreSQL**.

---

## 🛠️ Tech Stack

| Category      | Technology / Library                                                              |
|---------------|-----------------------------------------------------------------------------------|
| **Frontend**  | `React`, `Vite`, `TypeScript`, `Tailwind CSS`, `Shadcn/UI`, `React Hook Form`, `Wouter` |
| **Backend**   | `Node.js`, `Express.js`, `TypeScript`                                             |
| **Database**  | `PostgreSQL` (Schema-ready with Drizzle), `MemStorage` (for demo)                 |
| **PDF & Email** | `pdfkit` (PDF Generation), `Nodemailer`, `Ethereal.email` (Emailing)              |
| **Validation**| `Zod` (Shared between Frontend & Backend)                                         |
| **Dev Tools** | `Nodemon`, `tsx` (TypeScript Execution), `Git`                                      |

---

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

*   Node.js (v18.x or later recommended)
*   npm, yarn, or pnpm
*   (Optional) A running PostgreSQL instance if you wish to use a real database.

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Yes/ExitFlight/app.git
    cd app
    ```

2.  **Install dependencies for both the client and server:**
    *(This command assumes a root `package.json` script that installs for all workspaces. Adjust if your setup is different.)*
    ```bash
    npm install
    ```

3.  **Set up Environment Variables (for Backend):**
    *   Navigate to the `server` directory.
    *   Create a `.env` file by copying the example: `cp .env.example .env`.
    *   *(Note: The project is likely configured to run out-of-the-box with Ethereal email and in-memory storage, so no immediate changes may be needed.)*
    *   If you are connecting to PostgreSQL, add your database URL to the `.env` file:
        ```env
        DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE_NAME"
        ```

4.  **Run Database Migrations (Optional - for PostgreSQL):**
    *   If using PostgreSQL, ensure your database is running and then apply the Drizzle schemas:
    ```bash
    npx drizzle-kit migrate
    ```

### Running the Application

1.  **Start both the backend and frontend development servers:**
    From the **root** directory of the project:
    ```bash
    npm run dev
    ```

2.  **Access the application:**
    Open your browser and navigate to the URL provided by Vite (usually `http://localhost:5173`). The backend API will be running on a different port (e.g., 5000) and proxied by the frontend dev server.

---

## 📖 Usage

1.  Navigate to the flight selection page.
2.  Use the form to define your flight (real or imagined!).
3.  Click **"Preview Ticket"** to proceed to the passenger details form.
4.  Fill in the passenger details and submit.
5.  You will be redirected to a confirmation page.
6.  Check your Ethereal test inbox (a link will appear in your backend console) to see the confirmation email with the branded PDF e-ticket attached.
