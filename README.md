# Webpack DevServer with PHP

## Overview

This project sets up a development server using Webpack and PHP. It ensures that the PHP server runs concurrently with the Webpack development server, allowing you to develop and test PHP applications seamlessly.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Testing](#testing)
- [Configuration](#configuration)
- [License](#license)

## Installation

1. **Clone the repository:**

   ```bash
   git clone git@github.com:amenophis1er/webpack-php-proxy-server.git
   cd webpack-php-proxy-server
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

## Usage

To set up the development server, you need to modify your Webpack configuration to include the `setupDevServer` function.

### Webpack Configuration

1. **Create or modify your Webpack configuration file:**

   ```javascript
   // webpack.config.js
   const { setupDevServer } = require('webpack-php-proxy-server');

   module.exports = async function (env, argv) {
     const phpServerDir = 'examples'; // Change to your PHP server directory
     const apiPrefix = 'api'; // Change to your desired API prefix

     const config = {
       // Your existing Webpack configuration
     };

     await setupDevServer(config, {
       port: 8080, // Optional, specify a port for Webpack dev server
       phpServerDir,
       apiPrefix,
     });

     return config;
   };
   ```

2. **Run the development server:**

   ```bash
   npm start
   ```

   This will start both the Webpack development server and the PHP server.

## Testing

This project includes tests for the server setup functions using Jest. To run the tests, follow these steps:

1. **Install testing dependencies:**

   ```bash
   npm install --save-dev jest
   ```

2. **Run the tests:**

   ```bash
   npm test
   ```

### Example Tests

The following test cases are included:

- **Testing the `getAvailablePort` function:**

  ```javascript
  const { getAvailablePort } = require('webpack-php-proxy-server');

  test('finds an available port', async () => {
    const port = await getAvailablePort(8000, 8005);
    expect(port).toBeGreaterThanOrEqual(8000);
    expect(port).toBeLessThanOrEqual(8005);
  });
  ```

## Configuration

The main configuration options for `setupDevServer` are:

- `port`: (Optional) Port number for the Webpack development server. If not provided, an available port will be used.
- `phpServerDir`: Directory to serve PHP files from.
- `apiPrefix`: (Optional) Prefix for API routes. Defaults to `api`.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
