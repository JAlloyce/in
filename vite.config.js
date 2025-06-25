import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    // Ensure global is defined for some packages
    global: "globalThis",
  },
  server: {
    host: true,
    port: 3000,
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
})
