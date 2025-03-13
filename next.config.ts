/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    transpilePackages: ['phaser'],
    webpack: (config: any) => {
        // Enable importing files from outside src/ directory
        config.watchOptions = {
            ignored: /node_modules/,
            poll: 1000,
        };

        return config;
    },
};

module.exports = nextConfig;