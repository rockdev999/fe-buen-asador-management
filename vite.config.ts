/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import path from "path";

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    // `npm run analyze` genera stats.html con el treemap del bundle.
    mode === "analyze" &&
    visualizer({
      filename: "stats.html",
      template: "treemap",
      gzipSize: true,
      brotliSize: true,
      open: true,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    env: { TZ: "America/La_Paz" },
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "json-summary"],
      include: [
        "src/lib/money.ts",
        "src/components/shared/Interactives/money-input.utils.ts",
        "src/features/pos/stores/cart.store.ts",
        "src/features/offline/utils/offline-sale.builder.ts",
        "src/features/whatsapp/utils/order-actions.ts",
        "src/features/catalog/products/utils/product-availability.ts",
        "src/features/finances/reports/utils/report-period.ts",
        "src/services/interceptors/error-message.ts",
        "src/utils/validation-errors.ts",
        "src/features/pos/mappers/order.mapper.ts",
        "src/features/whatsapp/stores/whatsapp-orders.store.ts",
        "src/features/whatsapp/mappers/whatsapp-order.mapper.ts",
        "src/lib/formatters.ts",
        "src/features/catalog/products/mappers/product.mapper.ts",
        "src/utils/kardex.ts",
        "src/features/pos/models/stock-warning.ts",
      ],
    },
  },
}));
