/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "standalone",
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "gyvefyqrbxkwcenenkiy.supabase.co",
                pathname: "/storage/v1/object/public/**",
            },
        ],
    },
};

export default nextConfig;
