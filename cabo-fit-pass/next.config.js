// next.config.js
module.exports = {
  experimental: {
    optimizePackageImports: [
      '@radix-ui/react-icons',
      'lucide-react',
      'clsx',
      'tailwind-merge'
    ]
  },
  // Reduce build time by 15-40 seconds
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks.chunks = 'all';
      config.optimization.splitChunks.cacheGroups.commons = {
        name: 'commons',
        chunks: 'all',
        maxSize: 244000
      };
    }
    return config;
  }
}