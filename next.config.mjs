/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Set to false for better WebSocket performance
  /**
   * @param {import('webpack').Configuration} config
   * @param {Object} context
   * @returns {import('webpack').Configuration}
   */
  webpack: (config) => {
    config.externals.push({
      bufferutil: "bufferutil",
      "utf-8-validate": "utf-8-validate",
    })
    return config
  },
}

export default nextConfig;
