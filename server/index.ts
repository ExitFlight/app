// /home/jordan/Desktop/FlightBack/server/index.ts
import './config/env.ts'; // Import for side effects: loads .env.local

console.log('--- [index.ts] Script starting (after env.ts import attempt) ---');

// Explicitly check DATABASE_URL immediately after importing env.ts
const dbUrlFromEnv = process.env.DATABASE_URL;
if (dbUrlFromEnv) {
  console.log(`✅ [index.ts] DATABASE_URL is SET in process.env. Value starts with: "${dbUrlFromEnv.substring(0, 30)}..."`);
} else {
  console.error('🔴🔴🔴 [index.ts] FATAL: DATABASE_URL is NOT SET in process.env after importing env.ts. 🔴🔴🔴');
  console.error('🔴🔴🔴 This likely means .env.local was not loaded correctly by env.ts or does not contain DATABASE_URL. 🔴🔴🔴');
  console.error('🔴🔴🔴 Please check the [env.ts] logs above for details on .env.local loading. 🔴🔴🔴');
  process.exit(1); // Exit if DATABASE_URL is not set
}

// Now, import other modules
console.log('--- [index.ts] Proceeding to import main application modules... ---');
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { db, closeDbConnection } from './db'; // This import will trigger db.ts execution

const app = express();
const PORT = process.env.PORT || process.env.BACKEND_PORT || 5000;

console.log(`[Server Config] Attempting to start server on PORT: ${PORT}`);


app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson?: any) {
    capturedJsonResponse = bodyJson;
    return originalResJson.call(res, bodyJson);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80 && path !== '/api/health') {
        logLine = logLine.slice(0, 79) + "…";
      }
      log(logLine);
    }
  });
  next();
});

(async () => {
  try {
    log('Attempting database connection test in index.ts...', 'server');
    await db.execute('SELECT NOW();'); // Test query
    log('Database connected successfully (tested in index.ts).', 'server');
  } catch (error) {
    log(`Database connection failed (tested in index.ts): ${(error as Error).message}`, 'server');
    process.exit(1);
  }

  const server = await registerRoutes(app);

  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    log(`Error: ${req.method} ${req.originalUrl} ${status} - ${message}${err.stack ? `\nStack: ${err.stack}` : ''}`, 'error');
    res.status(status).json({ message });
  });

  if (app.get("env") === "development") {
    await setupVite(app, server);
    log('Vite dev server middleware setup complete.', 'server');
  } else {
    serveStatic(app);
    log('Static file serving setup complete for production.', 'server');
  }

  server.listen({
    port: PORT,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`Server listening on http://0.0.0.0:${PORT}`);
    if (app.get("env") === "development") {
      log(`Vite HMR available. Client should be accessible via the Vite server proxy.`);
    }
  });

  const signals = ['SIGINT', 'SIGTERM'];
  signals.forEach((signal) => {
    process.on(signal, async () => {
      log(`Received ${signal}. Shutting down gracefully...`, 'server');
      server.close(async (err) => {
        if (err) {
          log(`Error during server shutdown: ${err.message}`, 'error');
          process.exit(1);
        }
        await closeDbConnection();
        log('Server and database connections closed.', 'server');
        process.exit(0);
      });
    });
  });
})();
