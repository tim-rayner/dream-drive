export interface CreditPack {
  name: string;
  credits: number;
  priceId: string;
}

export const getCreditPacks = (): Record<string, CreditPack> => {
  const packs: Record<string, CreditPack> = {};

  // Starter pack
  if (process.env.STRIPE_STARTER_PRICE_ID) {
    packs[process.env.STRIPE_STARTER_PRICE_ID] = {
      name: "Starter",
      credits: 1,
      priceId: process.env.STRIPE_STARTER_PRICE_ID,
    };
  }

  // Explorer pack
  if (process.env.STRIPE_EXPLORER_PRICE_ID) {
    packs[process.env.STRIPE_EXPLORER_PRICE_ID] = {
      name: "Explorer",
      credits: 10,
      priceId: process.env.STRIPE_EXPLORER_PRICE_ID,
    };
  }

  // Cruiser pack
  if (process.env.STRIPE_CRUISER_PRICE_ID) {
    packs[process.env.STRIPE_CRUISER_PRICE_ID] = {
      name: "Cruiser",
      credits: 50,
      priceId: process.env.STRIPE_CRUISER_PRICE_ID,
    };
  }

  // Scenic Pack
  if (process.env.STRIPE_SCENIC_PRICE_ID) {
    packs[process.env.STRIPE_SCENIC_PRICE_ID] = {
      name: "Scenic Pack",
      credits: 100,
      priceId: process.env.STRIPE_SCENIC_PRICE_ID,
    };
  }

  // Grand Tourer Pack
  if (process.env.STRIPE_GRAND_TOURER_PRICE_ID) {
    packs[process.env.STRIPE_GRAND_TOURER_PRICE_ID] = {
      name: "Grand Tourer Pack",
      credits: 150,
      priceId: process.env.STRIPE_GRAND_TOURER_PRICE_ID,
    };
  }

  // Dealership Pack
  if (process.env.STRIPE_DEALERSHIP_PRICE_ID) {
    packs[process.env.STRIPE_DEALERSHIP_PRICE_ID] = {
      name: "Dealership Pack",
      credits: 500,
      priceId: process.env.STRIPE_DEALERSHIP_PRICE_ID,
    };
  }

  // Pro Studio
  if (process.env.STRIPE_PRO_STUDIO_PRICE_ID) {
    packs[process.env.STRIPE_PRO_STUDIO_PRICE_ID] = {
      name: "Pro Studio",
      credits: 1000,
      priceId: process.env.STRIPE_PRO_STUDIO_PRICE_ID,
    };
  }

  // Enterprise
  if (process.env.STRIPE_ENTERPRISE_PRICE_ID) {
    packs[process.env.STRIPE_ENTERPRISE_PRICE_ID] = {
      name: "Enterprise",
      credits: 2500,
      priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
    };
  }

  return packs;
};

// For backward compatibility, export a function that returns the credit packs
export const creditPacks = getCreditPacks();
