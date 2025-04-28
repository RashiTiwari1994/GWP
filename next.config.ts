import type { NextConfig } from 'next';
import nextBundleAnalyzer from '@next/bundle-analyzer';

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'rashi-wallet-pass-bucket.s3.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: `${process.env.NEXT_PUBLIC_AWS_S3_BUCKET}.s3.amazonaws.com`,
      },
    ],
  },
};

const withBundleAnalyzer = nextBundleAnalyzer({ enabled: process.env.ANALYZE === 'true' });

module.exports = withBundleAnalyzer(nextConfig);
