/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'gravatar.com',
                pathname: '/**',
            },
            // {
            //     protocol: 'https',
            //     hostname: 'avatars.githubusercontent.com',
            //     pathname: '/**',
            // },
        ],
    },
};

export default nextConfig;
