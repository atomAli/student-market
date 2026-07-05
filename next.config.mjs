/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "img4.idealista.it" },
      { protocol: "https", hostname: "**.idealista.it" },
    ],
  },
};

export default nextConfig;
