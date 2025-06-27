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
    hmr: {
      port: 24678,
      host: 'localhost'
    },
    watch: {
      // Reduce file watching to prevent memory issues
      ignored: ['**/node_modules/**', '**/dist/**']
    }
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    // Optimize build performance and memory usage
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          'ui-vendor': ['framer-motion', 'react-icons']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  optimizeDeps: {
    // Pre-bundle dependencies to reduce dev server load
    include: ['react', 'react-dom', 'react-router-dom', 'framer-motion'],
    // Reduce scanning overhead
    entries: ['./src/main.jsx']
  },
  esbuild: {
    // Optimize esbuild for large projects
    target: 'es2020',
    logLevel: 'error'
  }
})
