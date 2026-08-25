import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { tanstackRouter } from "@tanstack/router-plugin/vite"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  // Served under gorkadev.com/devdeck behind its own Worker route. Without this
  // base the assets would be requested from /assets/…, which does not match the
  // /devdeck* route and would be answered by the landing page instead.
  base: "/devdeck/",
  build: {
    // Mirrors the URL path so Workers static assets map /devdeck/… onto it.
    outDir: "dist/devdeck",
    emptyOutDir: true,
  },
  plugins: [tanstackRouter(), react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
