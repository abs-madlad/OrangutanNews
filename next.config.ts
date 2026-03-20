import type { NextConfig } from 'next';
import { imageHosts } from './image-hosts.config.js';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: imageHosts.map(host => ({
      protocol: host.protocol as 'https' | 'http',
      hostname: host.hostname,
    })),
  },
};

export default nextConfig;
