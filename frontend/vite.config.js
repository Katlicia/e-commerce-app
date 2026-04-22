import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  server: {
    fs: { allow: ["../shared", "."] },
  },
  resolve: {
    alias: {
      "@reduxjs/toolkit": path.resolve(__dirname, "node_modules/@reduxjs/toolkit"),
      "axios": path.resolve(__dirname, "node_modules/axios"),
      "react-redux": path.resolve(__dirname, "node_modules/react-redux"),
    },
  },
});
