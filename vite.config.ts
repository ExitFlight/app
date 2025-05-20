// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve("client/src"), // Resolves to projectRoot/client/src
      "@shared": path.resolve("shared"),   // Resolves to projectRoot/shared
      "@assets": path.resolve("attached_assets"), // Resolves to projectRoot/attached_assets
    },
  },
  // The 'root' directory where Vite will look for index.html and source files.
  // Relative to the project root (where vite.config.ts is).
  root: "client", 
  build: {
    // The output directory for the build.
    // Relative to the project root. Vite handles the `root` setting correctly for output.
    outDir: "dist/public", 
    emptyOutDir: true,
  },
  server: {
    // Optional: Proxy API requests to your backend if running Vite dev server separately.
    // Since you integrate Vite as Express middleware, this is likely handled in your Express setup.
    // proxy: {
    //   '/api': {
    //     target: 'http://localhost:5000', // Your Express backend URL
    //     changeOrigin: true,
    //   },
    // },
  }
});
