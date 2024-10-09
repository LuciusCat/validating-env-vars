import { defineConfig, loadEnv } from "vite";
import { validateEnv } from "./src/utils/validate/validateEnv";
import { envSchema } from "./src/utils/envSchema";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  try {
    const env = loadEnv(mode, process.cwd());

    validateEnv(env, envSchema, mode);
    return {
      plugins: [react()],
    };
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
});
