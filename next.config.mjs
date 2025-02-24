/**
 * @description
 * This file configures Next.js for the application.
 * 
 * Key Features:
 * - Allows importing images from specified remote domains via the 'images.remotePatterns' setting.
 * - Currently includes "localhost" and "the-odds-api.com" as example image hosts.
 * 
 * @notes
 * - If you use different sports data sites, replace or add them in the remotePatterns below.
 */

const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "localhost"
      },
      {
        protocol: "https",
        hostname: "the-odds-api.com"
      }
    ]
  }
}

export default nextConfig
