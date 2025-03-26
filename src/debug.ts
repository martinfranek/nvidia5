import fs from 'fs/promises';
import express from 'express';
import path from 'path';

const DEBUG_HOSTNAME = '0.0.0.0';
const DEBUG_PORT = 3000;
const SCREENSHOTS_DIR = path.resolve(import.meta.dirname, '../screenshots');

const htmlTemplate = (screenshotList: string) => `
<html>
  <head>
    <title>Screenshots</title>
  </head>
  <body>
    <h1>Screenshots</h1>
    <p>Here are some screenshots of the application:</p>
    <ul style="list-style: none; display: flex; flex-wrap: wrap; gap: 10px;">
      ${screenshotList}
    </ul>
    </script>
  </body>
</html>`;

export const createDebugServer = () => {
  const debugServer = express();

  debugServer.use(express.static(SCREENSHOTS_DIR));

  debugServer.get('/', async (_, res) => {
    const files = await fs.readdir(SCREENSHOTS_DIR);
    const imageList = files
      .map(
        file =>
          `<li><a href="/detail/${file}"><img src="/${file}" width="300" height="200" /></a></li>`,
      )
      .join('');

    res.send(htmlTemplate(imageList));
  });

  debugServer.get('/detail/:screenshot', async (req, res) => {
    const { screenshot } = req.params;

    res.send(`
      <html>
        <head><title>View Screenshot</title></head>
        <body>
          <h1>Screenshot Viewer</h1>
          <a href="/">Back to List</a>
          <br><br>
          <img src="/${screenshot}" style="max-width: 100%;">
        </body>
      </html>
    `);
  });

  debugServer.listen(DEBUG_PORT, DEBUG_HOSTNAME, () => {
    console.log(`Debug server is running on ${DEBUG_HOSTNAME}:${DEBUG_PORT}`);
  });
};
