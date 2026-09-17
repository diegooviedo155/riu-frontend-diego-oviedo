export function normalizeHeroText(value: string | null | undefined): string {
  if (!value) {
    return '';
  }
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}
