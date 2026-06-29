import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve("."),
      "server-only": path.resolve("./tests/__mocks__/server-only.ts"),
    },
  },
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./tests/setup.ts"],
    exclude: ["tests/e2e/**", "node_modules/**"],
    env: {
      NODE_ENV: "test",
      NEXT_PUBLIC_APP_URL: "http://localhost:3000",
      NEXT_PUBLIC_SUPABASE_URL: "https://test.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "test-anon-key",
      SUPABASE_SERVICE_ROLE_KEY: "test-service-role-key",
      AI_PROVIDER: "openai",
      OPENAI_API_KEY: "sk-test-openai-key",
      STRIPE_SECRET_KEY: "sk_test_stripe_key",
      STRIPE_WEBHOOK_SECRET: "whsec_test",
      STRIPE_PRICE_PRO_MONTHLY: "price_pro_monthly_test",
      STRIPE_PRICE_PRO_YEARLY: "price_pro_yearly_test",
      STRIPE_PRICE_ULTIMATE_MONTHLY: "price_ultimate_monthly_test",
      STRIPE_PRICE_ULTIMATE_YEARLY: "price_ultimate_yearly_test",
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["lib/**", "stores/**", "components/**"],
      exclude: ["tests/**", "node_modules/**", "**/__mocks__/**"],
    },
  },
});
