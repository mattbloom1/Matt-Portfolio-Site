// Static export: works on GitHub Pages (preview) and on Vercel.
// The Pages workflow sets NEXT_PUBLIC_BASE_PATH=/Matt-Portfolio-Site; Vercel leaves it empty.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

/** @type {import('next').NextConfig} */
export default {
  output: 'export',
  basePath,
  images: { unoptimized: true },
  reactStrictMode: false, // the stamp engine mounts imperatively once
  trailingSlash: true,
};
