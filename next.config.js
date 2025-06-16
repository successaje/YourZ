/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      'ipfs.io',
      'ipfs.infura.io',
      'placehold.co',
      'lh3.googleusercontent.com',
      'i.seadn.io',
      'opensea.mypinata.cloud',
      'gateway.pinata.cloud',
      'ipfs.thirdwebcdn.com'
    ],
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
}

module.exports = nextConfig 