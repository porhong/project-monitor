/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep native modules out of the webpack bundle — they run server-side only
  serverExternalPackages: ["better-sqlite3"],

  // Produce a minimal self-contained server for Docker
  output: "standalone",

  // Ensure native binaries and migration files are included in the output trace
  outputFileTracingIncludes: {
    "/**": [
      "./node_modules/better-sqlite3/**/*",
      "./drizzle/**/*",
    ],
  },
}

export default nextConfig
