import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // ใส่ชื่อ Repository ของพี่ เพื่อให้ GitHub Pages หาไฟล์ assets เจอ
  base: "/silk-heritage-vault/", 
  
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
  build: {
    // บังคับให้สร้างไฟล์ไว้ที่ dist (โฟลเดอร์มาตรฐานที่ GitHub Actions ใช้)
    outDir: "dist",
  }
}));