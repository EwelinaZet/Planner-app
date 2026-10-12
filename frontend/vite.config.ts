import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// W dev /api jest proxowane do Spring Boota, dzięki czemu ciasteczka sesji i CSRF działają bez CORS.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: { '/api': 'http://localhost:8081' },
  },
})
