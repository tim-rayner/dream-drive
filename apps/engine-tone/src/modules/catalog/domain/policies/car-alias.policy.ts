// placeholder you can grow (e.g., market-specific precedence rules)
export const aliasApplicable = (y?: number, from?: number, to?: number) => {
  if (!y) return true;
  if (from && y < from) return false;
  if (to && y > to) return false;
  return true;
};
