/**
 * @fileoverview Configuration for setting up a development server with Webpack and PHP.
 * @author Amen AMOUZOU
 * @version 1.0.0
 * @license MIT
 */
const { spawn } = require('child_process');
const net = require('net');
const path = require('path');

/**
 * Finds an available port within the specified range.
 * @param {number} startPort - The starting port number.
 * @param {number} endPort - The ending port number.
 * @param {number[]} [exclude=[]] - An array of ports to exclude.
 * @returns {Promise<number>} A promise that resolves to the available port number.
 * @throws {Error} If no available port is found within the specified range.
 */
async function getAvailablePort(startPort, endPort, exclude = []) {
    for (let port = startPort; port <= endPort; port++) {
        if (exclude.includes(port)) {
            continue;
        }
        try {
            await new Promise((resolve, reject) => {
                const server = net.createServer();
                server.unref();
                server.on('error', reject);
                server.listen(port, () => {
                    server.close(resolve);
                });
            });
            return port;
        } catch (error) {
            // Port is in use, try the next one
        }
    }
    throw new Error(`No available ports found between ${startPort} and ${endPort}`);
}

/**
 * Sets up the development server configuration for Webpack.
 * @param {Object} config - The Webpack configuration object.
 * @param {Object} options - The options for setting up the development server.
 * @param {number} [options.port] - The port number for the Webpack development server.
 * @param {string} options.phpServerDir - The directory to serve PHP files from.
 * @param {string} [options.apiPrefix='api'] - The prefix for the API routes.
 * @returns {Promise<void>} A promise that resolves when the setup is complete.
 */
async function setupDevServer(config, options) {
    const { port, phpServerDir, apiPrefix = 'api' } = options;

    let phpServerPort = await getAvailablePort(9001, 10000, [port]);
    let phpServer;

    const startPHPServer = async () => {
        const phpServerCmd = 'php';
        const phpServerArgs = ['-S', `localhost:${phpServerPort}`, '-t', phpServerDir];

        phpServer = spawn(phpServerCmd, phpServerArgs);

        console.log(`[PHP Server] Starting PHP server on http://localhost:${phpServerPort}`);
        console.log(`[PHP Server] Serving files from: ${path.resolve(phpServerDir)}`);

        phpServer.stdout.on('data', (data) => {
            console.log(`[PHP Server] ${data}`);
        });

        phpServer.stderr.on('data', async (data) => {
            console.error(`[PHP Server] ${data}`);
            if (data.toString().includes('Address already in use')) {
                console.log(`[PHP Server] Port ${phpServerPort} is already in use. Trying another port...`);
                phpServerPort = await getAvailablePort(phpServerPort + 1, 10000, [port]);
                phpServer.kill();
                await startPHPServer();
            }
        });

        phpServer.on('error', (error) => {
            console.error(`[PHP Server] Error: ${error.message}`);
        });

        phpServer.on('close', (code) => {
            console.log(`[PHP Server] PHP server process exited with code ${code}`);
        });
    };

    await startPHPServer();

    config.devServer = {
        static: path.join(__dirname, 'dist'),
        watchFiles: ['./src/index.html'],
        compress: true,
        port: port || (await getAvailablePort(8000, 9000)),
        open: true,
        proxy: [
            {
                context: [`/${apiPrefix}`],
                target: `http://localhost:${phpServerPort}`,
                changeOrigin: true,
                secure: false,
                pathRewrite: {
                    [`^/${apiPrefix}`]: '/',
                },
            },
        ],
        setupMiddlewares: (middlewares, devServer) => {
            if (!devServer) {
                throw new Error('webpack-dev-server is not defined');
            }

            process.on('SIGINT', () => {
                console.log('[PHP Server] Stopping PHP server...');
                phpServer.kill();
                process.exit();
            });

            devServer.compiler.hooks.done.tap('PHPServerShutdown', () => {
                console.log('[PHP Server] Webpack compilation done.');
            });

            devServer.compiler.hooks.shutdown.tap('PHPServerShutdown', () => {
                console.log('[PHP Server] Webpack DevServer closed. Stopping PHP server...');
                phpServer.kill();
            });

            return middlewares;
        },
    };
}

module.exports = {
    setupDevServer,
    getAvailablePort,
};

/**
 * Usage Example:
 *
 * ```javascript
 * const { setupDevServer } = require('webpack-php-proxy-server');
 *
 * module.exports = async function (env, argv) {
 *     const phpServerDir = 'examples';
 *     const apiPrefix = 'api';
 *
 *     const config = {
 *         // ... your existing Webpack configuration ...
 *     };
 *
 *     await setupDevServer(config, {
 *         port: 8080, // Optional, if not provided, an available port will be used
 *         phpServerDir,
 *         apiPrefix,
 *     });
 *
 *     return config;
 * };
 * ```
 */