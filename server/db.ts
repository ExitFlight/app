import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '@shared/schema'; // Corrected: Using @shared alias
 
// Assuming environment variables are loaded by the main application entry point (e.g., server/index.ts)
// If not, ensure dotenv.config({ path: '.env.local' }); is called in your main entry file.
 
// Get the database URL from environment variables
const databaseUrl = process.env.DATABASE_URL;

// Ensure the database URL is set
if (!databaseUrl) {
  console.error('FATAL ERROR: DATABASE_URL is not defined in environment variables.');
  // In a real application, you might throw an error or handle this more gracefully
  process.exit(1); // Exit the process if the critical config is missing
}

// Create a database connection pool
// Adjust pool configuration as needed (e.g., max connections, idle timeout)
const pool = new Pool({ connectionString: databaseUrl });

// Initialize Drizzle ORM with the connection pool and schema
export const db = drizzle(pool, { schema });

// Optional: Add a function to close the pool when the application shuts down
export async function closeDbConnection() {
  console.log('Closing database connection pool...');
  await pool.end();
  console.log('Database connection pool closed.');
}