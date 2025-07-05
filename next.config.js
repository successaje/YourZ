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
      'ipfs.thirdwebcdn.com',
      'picsum.photos'
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Client-side only configurations
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        child_process: false,
        tty: false,
        // Add these lines to handle the indexedDB issue
        'idb-keyval': false,
        '@walletconnect/ethereum-provider': false,
        '@walletconnect/universal-provider': false,
      };
    }
    return config;
  },
  // Add this to ensure certain modules are only loaded on the client side
  experimental: {
    esmExternals: 'loose',
  },
  // Add this to handle dynamic imports with SSR
  typescript: {
    ignoreBuildErrors: true,
  },
  // Enable React 18 concurrent features
  reactRoot: true,
}

module.exports = nextConfig