import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Relative base keeps the build deployable on GitHub Pages as well as any subpath.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
})
