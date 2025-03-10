/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    webpack: (config: any) => {
        // Enable importing files from outside src/ directory
        config.watchOptions = {
            ignored: /node_modules/,
            poll: 1000,
        };

        // Phaser webpack config
        config.module.rules.push({
            test: /\.js$/,
            include: [/node_modules\/phaser/],
            use: {
                loader: 'babel-loader',
                options: {
                    presets: ['next/babel'],
                },
            },
        });

        return config;
    },
};

module.exports = nextConfig;