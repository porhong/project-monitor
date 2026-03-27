/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep native modules out of the webpack bundle — they run server-side only
  serverExternalPackages: ["better-sqlite3"],
}

export default nextConfig
