const { getAvailablePort, setupDevServer } = require('../index');
const webpack = require('webpack');
const path = require('path');

(async () => {
    const isProduction = process.env.NODE_ENV === 'production';
    const npmServerPort = await getAvailablePort(8000, 9000);
    const phpServerPort = await getAvailablePort(9001, 10000, [npmServerPort]);
    const phpServerDir = path.join(__dirname, 'php');
    const apiPrefix = 'api';

    const config = {
        mode: isProduction ? 'production' : 'development',
        entry: path.join(__dirname, 'src', 'index.js'),
        output: {
            path: path.join(__dirname, 'dist'),
            filename: 'bundle.js',
        },
        // Add any other necessary Webpack configuration options
    };

    await setupDevServer(config, {
        isProduction,
        npmServerPort,
        phpServerPort,
        phpServerDir,
        apiPrefix,
    });

    const compiler = webpack(config);

    compiler.run((err, stats) => {
        if (err) {
            console.error(err);
            return;
        }

        console.log(stats.toString({
            colors: true,
            modules: false,
            children: false,
            chunks: false,
            chunkModules: false,
        }));
    });
})();