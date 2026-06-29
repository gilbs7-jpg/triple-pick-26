import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      '5173--main--worldcup26--jason-gilbert672--3fuve9fnbpv4a.pit-1.try.coder.app'
    ]
  }
})