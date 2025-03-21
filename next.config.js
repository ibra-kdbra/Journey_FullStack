/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "uploadthing.com" },
      { protocol: "https", hostname: "utfs.io" },
      { protocol: "https", hostname: "img.clerk.com" },
      { protocol: "https", hostname: "subdomain" }, // Ensure this is a valid domain
      { protocol: "https", hostname: "files.stripe.com" },
      { protocol: "https", hostname: "pixner.net" },
    ],
  },
  reactStrictMode: false,
};

module.exports = nextConfig;
