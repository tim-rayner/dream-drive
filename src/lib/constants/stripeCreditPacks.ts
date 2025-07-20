export const creditPacks = {
  // These should be your LIVE mode price IDs from Stripe dashboard
  // Fallback to test price IDs for development
  [process.env.STRIPE_STARTER_PRICE_ID || "price_1Rlz2zBQfFdEbYWybr7pPe9L"]: {
    name: "Starter",
    credits: 1,
  },
  [process.env.STRIPE_EXPLORER_PRICE_ID || "price_1Rlz3MBQfFdEbYWyDUhIOv9F"]: {
    name: "Explorer",
    credits: 10,
  },
  [process.env.STRIPE_CRUISER_PRICE_ID || "price_1Rlz4XBQfFdEbYWyPBF4WedI"]: {
    name: "Cruiser",
    credits: 50,
  },
  [process.env.STRIPE_SCENIC_PRICE_ID || "price_1Rlz50BQfFdEbYWyNsYZ28ec"]: {
    name: "Scenic Pack",
    credits: 100,
  },
  [process.env.STRIPE_GRAND_TOURER_PRICE_ID ||
  "price_1Rlz6OBQfFdEbYWyz2i02tmF"]: {
    name: "Grand Tourer Pack",
    credits: 150,
  },
  [process.env.STRIPE_DEALERSHIP_PRICE_ID || "price_1Rlz7CBQfFdEbYWyuYir6YpY"]:
    { name: "Dealership Pack", credits: 500 },
  [process.env.STRIPE_PRO_STUDIO_PRICE_ID || "price_1Rlz8mBQfFdEbYWyOWRrbKuH"]:
    { name: "Pro Studio", credits: 1000 },
  [process.env.STRIPE_ENTERPRISE_PRICE_ID || "price_1Rlz9NBQfFdEbYWyxIeWBHo4"]:
    { name: "Enterprise", credits: 2500 },
};
