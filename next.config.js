/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
    /* config options here */
    webpack: (config, { isServer }) => {
        // Only include onnxruntime-node in server-side bundles
        if (!isServer) {
            config.resolve.alias = {
                ...config.resolve.alias,
                'onnxruntime-node': false,
            };
        }

        // Disable webpack cache completely to avoid snapshot warnings
        config.cache = false;

        return config;
    },
};

module.exports = nextConfig; 