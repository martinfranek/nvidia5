import { PlaywrightCrawler, RequestQueue } from 'crawlee';
import { CronJob } from 'cron';

import { shops } from './cards/shops';
import { AVAILABILITY, formatAvailability } from './scrappableStats/availability';
import { formatPrice } from './scrappableStats/price';
import {
  availabilityGauge,
  METRICS_HOSTNAME,
  METRICS_PORT,
  metricsServer,
  priceGauge,
  shutdown,
} from './metrics';
import { createLogLine, writeToFile } from './logging';

async function crawlShops() {
  for (const shop of shops) {
    console.log(`Checking ${shop.name}...`);
    const requestQueue = await RequestQueue.open();

    const allCardsPerShop = Object.values(shop.cards).flat();
    for (const { type, manufacturer, family, url } of allCardsPerShop) {
      await requestQueue.addRequest({
        url: `${shop.url}/${url}`,
        userData: { card: { type, manufacturer, family } },
      });
    }
    let shopResult = '';

    const crawler = new PlaywrightCrawler({
      requestQueue,
      async requestHandler({
        request: {
          userData: { card },
        },
        page,
      }) {
        const availabilitySelector = await page.waitForSelector(`.${shop.availabilityClass}`);
        const availability = formatAvailability(
          await availabilitySelector?.evaluate(node => node.textContent),
        );
        const priceSelector = await page.waitForSelector(shop.priceClass);
        const price = formatPrice(await priceSelector?.evaluate(node => node.textContent));

        availabilityGauge
          .labels(shop.name, card.type, card.manufacturer, card.family)
          .set(availability === AVAILABILITY.NOT_AVAILABLE ? 0 : 1);

        priceGauge
          .labels(shop.name, card.type, card.manufacturer, card.family)
          .set(typeof price === 'number' ? price : 0);

        shopResult += createLogLine(
          shop.name,
          `${card.type} ${card.manufacturer} ${card.family}`,
          availability,
          price,
        );
      },
      maxRequestsPerCrawl: 50,
      headless: true,
    });
    await crawler.run();
    await writeToFile(shop.name, shopResult);

    await requestQueue.drop();
  }
}

metricsServer.listen(METRICS_PORT, METRICS_HOSTNAME, () => {
  console.log(`Metrics server is running on ${METRICS_HOSTNAME}:${METRICS_PORT}`);
});

async function setupCron() {
  try {
    const job = new CronJob('*/2 * * * *', crawlShops);
    job.start();
    console.log('cron crawlShops started...');
  } catch (error) {
    console.error('Error setting up server: ', error);
  }
}
setupCron();

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('SIGHUP', shutdown);
