/** @type {import('next').NextConfig} */
const nextConfig = {
  // The content lives OUTSIDE this app folder (the wiki repo root), read at
  // runtime via the Node fs layer in src/lib. Nothing to configure for that here.
  reactStrictMode: true,
};

export default nextConfig;
