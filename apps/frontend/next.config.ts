import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        mysql2: false,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };

      config.externals = config.externals || [];
      config.externals.push({
        'mysql2/promise': 'commonjs mysql2/promise',
        'mysql2': 'commonjs mysql2'
      });
    }
    return config;
  },

  transpilePackages: ['@trilitech/types'],

  serverExternalPackages: ['mysql2']
};

export default nextConfig;