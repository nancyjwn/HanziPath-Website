
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: true, // Menampilkan alamat Network IP agar bisa diakses dari perangkat lain (misal: HP) di Wi-Fi yang sama
    port: 5173,
  },
})
