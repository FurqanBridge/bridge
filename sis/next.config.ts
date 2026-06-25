import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* Allow accessing the dev server from devices on the local network,
     e.g. a phone or another computer on the same WiFi using your
     machine's local IP address (the 172.x.x.x / 192.168.x.x address
     shown in the terminal when running `npm run dev`). */
  allowedDevOrigins: ['172.30.1.37'],
}

export default nextConfig
