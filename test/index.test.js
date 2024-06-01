// __tests__/index.test.js
const { getAvailablePort } = require('../index');

test('finds an available port', async () => {
    const port = await getAvailablePort(8000, 8005);
    expect(port).toBeGreaterThanOrEqual(8000);
    expect(port).toBeLessThanOrEqual(8005);
});
