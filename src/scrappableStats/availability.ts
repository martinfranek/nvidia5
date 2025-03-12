export const AVAILABILITY = {
  NOT_AVAILABLE: 'Not available',
  AVAILABLE: 'Available',
} as const;

export const notAvailableStrings: string[] = [
  'Neznámá dostupnost',
  'Není skladem',
  'Očekáváme do',
  'Na objednávku',
  'Naskladníme',
  'Currently Unavailable',
  'Expected',
  'Na dotaz',
];

export function formatAvailability(rawAvailability?: string | null) {
  if (!rawAvailability) {
    return 'Cannot determine availability';
  }

  const formattedAvailability = rawAvailability.replace(/\n/gm, '').trim();
  if (notAvailableStrings.some(s => formattedAvailability.includes(s))) {
    return AVAILABILITY.NOT_AVAILABLE;
  }

  // FIXME: replace with proper handling
  // return AVAILABILITY.AVAILABLE;
  return formattedAvailability;
}
