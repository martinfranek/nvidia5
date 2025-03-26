import fs from 'fs/promises';
import { format } from 'date-fns';

export const writeToFile = async (shopName: string, shopResult: string) => {
  const file = await fs.open(`logs/${shopName}.txt`, 'a');
  await file.write(shopResult);
  await file.close();
};

export const formatTimestamp = () => format(new Date(), 'dd.MM.yyyy HH:mm:ss');

export const createLogLine = (
  shopName: string,
  cardName: string,
  availability: string,
  price: number | string,
) => {
  return `${formatTimestamp()} - ${shopName} - ${cardName} - ${availability} - ${price}\n`;
};
