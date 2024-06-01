const path = require('path');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { setupDevServer } = require('../index');

module.exports = async function (env, argv) {
    const isProduction = env.production;

    const phpServerDir = path.join(__dirname, 'php');
    const apiPrefix = 'api';

    const config = {
        mode: isProduction ? 'production' : 'development',
        entry: path.join(__dirname, 'src', 'index.js'),
        output: {
            path: path.join(__dirname, 'dist'),
            filename: 'bundle.js',
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: 'src/index.html',
            }),
        ],
        // Add any other necessary Webpack configuration options
    };

    await setupDevServer(config, {
        phpServerDir,
        apiPrefix,
    });

    return config;
};