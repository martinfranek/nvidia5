import { launchOptions } from 'camoufox-js';
import { PlaywrightCrawler, RequestQueue } from 'crawlee';
import { CronJob } from 'cron';
import { firefox } from 'playwright';

import { shops } from './cards/shops.js';
import { AVAILABILITY, formatAvailability } from './scrappableStats/availability.js';
import { formatPrice } from './scrappableStats/price.js';
import { availabilityGauge, createMetricsServer, priceGauge, shutdown } from './metrics.js';
import { createLogLine, formatTimestamp, writeToFile } from './logging.js';
import { createDebugServer } from './debug.js';

// testing purposes
// const allShops = [shops.find(shop => shop.name === 'Datart')!];

createMetricsServer();
createDebugServer();

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
      // options
      requestQueue,
      navigationTimeoutSecs: 15,
      maxRequestRetries: 0,
      maxRequestsPerCrawl: 50,
      headless: true,
      persistCookiesPerSession: false,
      launchContext: {
        launcher: firefox,
        launchOptions: await launchOptions({ headless: true }),
      },
      // TODO: enable once impit rust binaries are ready for Linux arm64 glibc (https://github.com/apify/impit/tree/master/impit-node)
      // postNavigationHooks: [
      //   async ({ handleCloudflareChallenge }) => {
      //     await handleCloudflareChallenge();
      //   },
      // ],
      // handlers
      async requestHandler({
        page,
        request: {
          userData: { card },
        },
      }) {
        try {
          const [availabilityElement, priceElement] = await Promise.all([
            page.waitForSelector(`.${shop.availabilityClass}`, {
              timeout: 5000,
            }),
            page.waitForSelector(shop.priceClass, { timeout: 5000 }),
          ]);
          const availabilityText = await availabilityElement?.evaluate(node => node.textContent);
          const priceText = await priceElement?.evaluate(node => node.textContent);
          const availability = formatAvailability(availabilityText);
          const price = formatPrice(priceText);

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
        } catch (error) {
          console.error('Error in requestHandler: ', error);
          await page.screenshot({
            path: `screenshots/failed to find selectors-${formatTimestamp()}-${shop.name}-${
              card.type
            }-${card.manufacturer}-${card.family}.png`,
          });
        }
      },
      async failedRequestHandler(
        {
          page,
          request: {
            userData: { card },
          },
        },
        error,
      ) {
        console.error('Request failed due to: ', error);
        await page.screenshot({
          path: `screenshots/${formatTimestamp()}-${shop.name}-${card.type}-${card.manufacturer}-${
            card.family
          }.png`,
        });
      },
    });
    await crawler.run();
    await writeToFile(shop.name, shopResult);

    await requestQueue.drop();
  }
}

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
