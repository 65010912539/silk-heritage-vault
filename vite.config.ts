import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // ใช้ ./ เพื่อให้มันเรียกไฟล์แบบ Relative Path (แก้ปัญหาหน้าขาว/404 ได้ชัวร์กว่า)
  base: "./", 
  
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
    // โฟลเดอร์ปลายทางคือ dist (ถูกต้องแล้ว)
    outDir: "dist",
    // เพิ่มตรงนี้เพื่อให้มั่นใจว่าชื่อไฟล์ assets จะไม่เพี้ยน
    emptyOutDir: true,
  }
}));