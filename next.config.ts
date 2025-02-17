import type { NextConfig } from "next";
import withPWA from 'next-pwa'

const config: NextConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true
})({
  /* config options here */
});

export default config;
