import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  server: {
    fs: {
      allow: [path.resolve(__dirname, "..")],
    },
  },
  plugins: [react()],
});
