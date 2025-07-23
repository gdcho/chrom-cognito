// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        { src: "src/manifest.json", dest: "." },
        { src: "public/icons", dest: "icons" },
      ],
    }),
  ],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        background: resolve(__dirname, "src/background/index.ts"),
        popup: resolve(__dirname, "src/popup/index.html"),
        options: resolve(__dirname, "src/options/index.html"),
        content: resolve(__dirname, "src/content/contextMenuHelper.ts"),
        modClick: resolve(__dirname, "src/content/modClick.ts"),
      },
      output: {
        entryFileNames: (chunk) =>
          chunk.name === "background" ? "[name].js" : "chunks/[name].js",
        chunkFileNames: "chunks/[name].js",
        assetFileNames: "assets/[name].[ext]",
      },
    },
  },
});
