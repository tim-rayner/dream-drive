import PromotionalBanner from "@/components/PromotionalBanner";
import { CTAFooter, FeatureStrip, Hero } from "@/components/marketing";
import { Box } from "@mui/material";

export default function UnauthenticatedHome() {
  return (
    <Box sx={{ minHeight: "100vh" }}>
      <PromotionalBanner />

      <Hero />

      <FeatureStrip />

      <CTAFooter />
    </Box>
  );
}
