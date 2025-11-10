import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fix for Vercel deployment with multiple lockfiles
  outputFileTracingRoot: process.env.VERCEL ? process.cwd() : __dirname,
  
  // Ensure proper static export for Vercel
  trailingSlash: false,
  
  
  headers() {
    // Required by FHEVM 
    return Promise.resolve([
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
        ],
      },
    ]);
  },
  
  // Optimize for production builds
  experimental: {
    optimizePackageImports: ['lucide-react', '@zama-fhe/relayer-sdk']
  },
  
  // Handle external dependencies that might cause issues
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    // Ensure path aliases work correctly in Vercel
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname),
    };
    
    return config;
  }
};

export default nextConfig;
