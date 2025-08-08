export const normalizeMake = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9\- ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

export const normalizeModel = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9\- ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
