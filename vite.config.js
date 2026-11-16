/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    test: {
        environment: "node",
        include: ["src/**/*.test.ts"],
        coverage: {
            provider: "v8",
            include: [
                "src/lib/money.ts",
                "src/components/shared/Interactives/money-input.utils.ts",
                "src/features/pos/stores/cart.store.ts",
                "src/features/offline/utils/offline-sale.builder.ts",
                "src/features/whatsapp/utils/order-actions.ts",
                "src/features/catalog/products/utils/product-availability.ts",
                "src/features/finances/reports/utils/report-period.ts",
            ],
        },
    },
});
