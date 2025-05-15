import { defineConfig } from 'drizzle-kit';
import dotenv from 'dotenv';

// Load environment variables from .env.local file
dotenv.config({ path: '.env.local' });

export default defineConfig({
  //schema: './server/db/schema.ts',
  schema: './shared/schema.ts', // <-- Adjust this path if your schema is elsewhere
  out: './drizzle', // <-- Directory where migrations will be generated
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!, // Use the DATABASE_URL environment variable
  },
  verbose: true,
  strict: true,
});