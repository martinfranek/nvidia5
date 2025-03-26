import { createServer, Server } from 'http';
import client from 'prom-client';

const METRICS_HOSTNAME = '0.0.0.0';
const METRICS_PORT = 6155;

// setting prometheus metrics
export const availabilityGauge = new client.Gauge({
  name: 'availability',
  help: 'Availability of the card (0 - not available, 1 - available)',
  labelNames: ['shop', 'cardType', 'cardManufacturer', 'cardFamily'],
});

export const priceGauge = new client.Gauge({
  name: 'price',
  help: 'Price of the card',
  labelNames: ['shop', 'cardType', 'cardManufacturer', 'cardFamily'],
});

// prometheus setup
const register = new client.Registry();
register.setDefaultLabels({
  app: 'nvidia5',
});
client.collectDefaultMetrics({ register });
register.registerMetric(availabilityGauge);
register.registerMetric(priceGauge);

export function createMetricsServer() {
  const metricsServer = createServer(async (req, res) => {
    switch (req.url) {
      case '/health':
        res.statusCode = 200;
        res.end('OK');
        return;
      case '/metrics':
        try {
          res.statusCode = 200;
          res.setHeader('content-type', register.contentType);
          res.end(await register.metrics());
          console.log('successfully called /metrics');
        } catch (error) {
          console.log('metrics server error:', error);

          res.statusCode = 500;
          res.end();
        } finally {
          return;
        }
      default:
        break;
    }

    res.statusCode = 400;
    res.end();
  });

  metricsServer.listen(METRICS_PORT, METRICS_HOSTNAME, () => {
    console.log(`Metrics server is running on ${METRICS_HOSTNAME}:${METRICS_PORT}`);
  });
}

export const shutdown = (server: Server): void => {
  console.log('Shutting down...');
  server.close();
};
