import { createServer } from 'http';
import client from 'prom-client';

export const METRICS_HOSTNAME = 'localhost';
export const METRICS_PORT = 6155;

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

export const metricsServer = createServer(async (req, res) => {
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

export const shutdown = (): void => {
  console.log('Shutting down...');
  metricsServer.close();
};
