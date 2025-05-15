// /home/jordan/Desktop/FlightBack/server/config/env.ts
import dotenv from 'dotenv';

console.log('--- [env.ts] Attempting to load .env.local ---');
const result = dotenv.config({ path: '.env.local', debug: true }); // .env.local relative to project root

if (result.error) {
  console.error('🔴🔴🔴 [env.ts] Error loading .env.local:', result.error);
  // We won't exit here; index.ts will check for DATABASE_URL and exit if not found.
} else {
  if (result.parsed && Object.keys(result.parsed).length > 0) {
    console.log('✅✅✅ [env.ts] .env.local loaded. Parsed content:', result.parsed);
  } else {
    console.warn('⚠️⚠️⚠️ [env.ts] .env.local loaded but was empty or only comments.');
  }
}

const dbUrl = process.env.DATABASE_URL;
if (dbUrl) {
  console.log(`✅ [env.ts] DATABASE_URL is SET in process.env. Starts with: "${dbUrl.substring(0,20)}..."`);
} else {
  console.error('🔴🔴🔴 [env.ts] DATABASE_URL is NOT SET in process.env after dotenv in env.ts.');
}
console.log('--- [env.ts] Finished ---');
