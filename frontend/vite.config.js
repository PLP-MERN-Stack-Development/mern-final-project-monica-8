import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // 🎯 ADD THIS BLOCK FOR PROXY CONFIGURATION 🎯
  server: {
    // This tells the Vite development server to forward 
    // any request starting with '/api' 
    proxy: {
      '/api': {
        // Change the target to your backend's URL/Port (which is 5000 based on your server.js)
        target: 'http://localhost:5000', 
        
        // Rewrite the origin header to match the target. This is usually required for CORS.
        changeOrigin: true, 
        
        // (Optional but helpful for logging)
        // configure: (proxy, options) => {
        //   proxy.on('error', (err, req, res) => {
        //     console.error('Proxy error:', err);
        //   });
        // },
      },
    },
  },
})