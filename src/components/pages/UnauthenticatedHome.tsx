import PromotionalBanner from "@/components/PromotionalBanner";
import {
  CTAFooter,
  FeatureStrip,
  Hero,
  MediaHighlight,
} from "@/components/marketing";
import { Box } from "@mui/material";

export default function UnauthenticatedHome() {
  return (
    <Box sx={{ minHeight: "100vh" }}>
      {/* Promotional Banner */}
      <PromotionalBanner />

      {/* Hero Section with Background Carousel */}
      <Hero />

      {/* Feature Strip */}
      <FeatureStrip />

      {/* Media Highlight */}
      <MediaHighlight />

      {/* CTA Footer */}
      <CTAFooter />
    </Box>
  );
}
