/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "books.google.com",
        pathname: "/books/content*",
      },
      {
        protocol: "https",
        hostname: "books.googleusercontent.com",
        pathname: "/books/content*",
      },
    ],
  },
};

export default nextConfig;
