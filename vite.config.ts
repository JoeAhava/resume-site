import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	// server: {
	// 	proxy: {
	// 		"/models/": {
	// 			target: "https://huggingface.co",
	// 			changeOrigin: true,
	// 			secure: false,
	// 		},
	// 	},
	// },
	optimizeDeps: {
		exclude: ["@xenova/transformers"],
	},
});
