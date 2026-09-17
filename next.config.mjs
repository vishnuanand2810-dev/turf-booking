/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },
    experimental: {
        allowedDevOrigins: [".loca.lt", ".pinggy.link", ".trycloudflare.com"],
    },
};

export default nextConfig;