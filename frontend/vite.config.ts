import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    }
  },
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        icon: true,
        exportType: "named",
        namedExport: "ReactComponent",
      },
    }),
  ],
  build: {
    // Warn only on chunks > 600KB (suppress noise from large vendor libs)
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React stays separate — tiny, always cached
          "vendor-react": ["react", "react-dom", "react-router"],
          // ApexCharts is ~200KB, isolate so it's only loaded when a chart page opens
          "vendor-charts": ["apexcharts", "react-apexcharts"],
          // jVectorMap + India map data is large, isolate it
          "vendor-maps": [
            "@react-jvectormap/core",
            "@react-jvectormap/india",
          ],
        },
      },
    },
  },
});
