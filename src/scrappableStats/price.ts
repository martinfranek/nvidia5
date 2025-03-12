export function formatPrice(rawPrice?: string | null): number | string {
  if (!rawPrice || rawPrice === 'Cena nebyla stanovena') {
    return 'Cannot determine price';
  }

  return parseInt(
    rawPrice
      .replace(/\n/gm, '')
      .replace(/\s/gm, '')
      .replace(/&nbsp;/gm, '')
      .replace(/Kč/gm, '')
      .trim(),
    10,
  );
}
