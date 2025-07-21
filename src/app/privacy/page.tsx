"use client";

import ThemeWrapper from "@/components/ThemeWrapper";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import { Box, Button, Container, Stack, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

export default function PrivacyPolicy() {
  const router = useRouter();

  return (
    <ThemeWrapper>
      <Box
        sx={{
          minHeight: "100vh",
          background:
            "linear-gradient(135deg, #0F0F23 0%, #1A1A2E 50%, #1E1E3F 100%)",
          py: { xs: 2, sm: 4 },
          px: { xs: 1, sm: 2 },
        }}
      >
        <Container maxWidth="lg">
          {/* Header */}
          <Box sx={{ mb: { xs: 3, sm: 4 } }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => router.back()}
              sx={{
                color: "text.secondary",
                mb: 2,
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                },
              }}
            >
              Back
            </Button>
            <Typography
              variant="h1"
              component="h1"
              sx={{
                fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
                fontWeight: 700,
                background: "linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                mb: 1,
              }}
            >
              Privacy Policy
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                fontSize: { xs: "1rem", sm: "1.125rem" },
                lineHeight: 1.6,
              }}
            >
              Last updated: December 2024
            </Typography>
          </Box>

          {/* Content */}
          <Stack spacing={{ xs: 4, sm: 6 }}>
            {/* Introduction */}
            <Box>
              <Typography
                variant="h2"
                component="h2"
                sx={{
                  fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
                  fontWeight: 600,
                  mb: 2,
                  color: "text.primary",
                }}
              >
                Introduction
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontSize: { xs: "0.95rem", sm: "1rem" },
                  lineHeight: 1.7,
                  color: "text.secondary",
                }}
              >
                DriveDream AI Studio (&quot;we,&quot; &quot;our,&quot; or
                &quot;us&quot;) is committed to protecting your privacy. This
                Privacy Policy explains how we collect, use, disclose, and
                safeguard your information when you use our AI-powered car scene
                generation service.
              </Typography>
            </Box>

            {/* Information We Collect */}
            <Box>
              <Typography
                variant="h2"
                component="h2"
                sx={{
                  fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
                  fontWeight: 600,
                  mb: 2,
                  color: "text.primary",
                }}
              >
                Information We Collect
              </Typography>

              <Stack spacing={3}>
                <Box>
                  <Typography
                    variant="h3"
                    component="h3"
                    sx={{
                      fontSize: { xs: "1.25rem", sm: "1.5rem" },
                      fontWeight: 600,
                      mb: 1,
                      color: "text.primary",
                    }}
                  >
                    Personal Information
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: { xs: "0.95rem", sm: "1rem" },
                      lineHeight: 1.7,
                      color: "text.secondary",
                    }}
                  >
                    • Account information (email address, name) when you sign up
                    <br />
                    • Profile information you choose to provide
                    <br />
                    • Payment information (processed securely through Stripe)
                    <br />• Communication preferences and settings
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="h3"
                    component="h3"
                    sx={{
                      fontSize: { xs: "1.25rem", sm: "1.5rem" },
                      fontWeight: 600,
                      mb: 1,
                      color: "text.primary",
                    }}
                  >
                    Usage Information
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: { xs: "0.95rem", sm: "1rem" },
                      lineHeight: 1.7,
                      color: "text.secondary",
                    }}
                  >
                    • Images you upload for AI processing
                    <br />
                    • Location data you select for scene generation
                    <br />
                    • Generated AI images and associated metadata
                    <br />
                    • Usage patterns and feature interactions
                    <br />• Technical information (device type, browser, IP
                    address)
                  </Typography>
                </Box>
              </Stack>
            </Box>

            {/* How We Use Information */}
            <Box>
              <Typography
                variant="h2"
                component="h2"
                sx={{
                  fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
                  fontWeight: 600,
                  mb: 2,
                  color: "text.primary",
                }}
              >
                How We Use Your Information
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontSize: { xs: "0.95rem", sm: "1rem" },
                  lineHeight: 1.7,
                  color: "text.secondary",
                }}
              >
                We use the information we collect to:
                <br />
                • Provide and maintain our AI image generation service
                <br />
                • Process your car photos and generate AI scenes
                <br />
                • Manage your account and process payments
                <br />
                • Improve our service and develop new features
                <br />
                • Communicate with you about updates and support
                <br />
                • Ensure security and prevent fraud
                <br />• Comply with legal obligations
              </Typography>
            </Box>

            {/* Information Sharing */}
            <Box>
              <Typography
                variant="h2"
                component="h2"
                sx={{
                  fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
                  fontWeight: 600,
                  mb: 2,
                  color: "text.primary",
                }}
              >
                Information Sharing and Disclosure
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontSize: { xs: "0.95rem", sm: "1rem" },
                  lineHeight: 1.7,
                  color: "text.secondary",
                }}
              >
                We do not sell, trade, or rent your personal information to
                third parties. We may share your information only in the
                following circumstances:
                <br />
                • With your explicit consent
                <br />
                • With service providers who assist in operating our service
                (payment processing, cloud storage, AI processing)
                <br />
                • To comply with legal requirements or protect our rights
                <br />• In connection with a business transfer or merger
              </Typography>
            </Box>

            {/* Data Security */}
            <Box>
              <Typography
                variant="h2"
                component="h2"
                sx={{
                  fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
                  fontWeight: 600,
                  mb: 2,
                  color: "text.primary",
                }}
              >
                Data Security
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontSize: { xs: "0.95rem", sm: "1rem" },
                  lineHeight: 1.7,
                  color: "text.secondary",
                }}
              >
                We implement appropriate technical and organizational measures
                to protect your personal information against unauthorized
                access, alteration, disclosure, or destruction. This includes
                encryption, secure servers, and regular security assessments.
              </Typography>
            </Box>

            {/* Data Retention */}
            <Box>
              <Typography
                variant="h2"
                component="h2"
                sx={{
                  fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
                  fontWeight: 600,
                  mb: 2,
                  color: "text.primary",
                }}
              >
                Data Retention
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontSize: { xs: "0.95rem", sm: "1rem" },
                  lineHeight: 1.7,
                  color: "text.secondary",
                }}
              >
                We retain your personal information for as long as necessary to
                provide our services and fulfill the purposes outlined in this
                Privacy Policy. You may request deletion of your account and
                associated data at any time through your account settings.
              </Typography>
            </Box>

            {/* Your Rights */}
            <Box>
              <Typography
                variant="h2"
                component="h2"
                sx={{
                  fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
                  fontWeight: 600,
                  mb: 2,
                  color: "text.primary",
                }}
              >
                Your Rights
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontSize: { xs: "0.95rem", sm: "1rem" },
                  lineHeight: 1.7,
                  color: "text.secondary",
                }}
              >
                You have the right to:
                <br />
                • Access and review your personal information
                <br />
                • Correct inaccurate or incomplete information
                <br />
                • Request deletion of your personal information
                <br />
                • Opt out of marketing communications
                <br />
                • Export your data in a portable format
                <br />• Lodge a complaint with relevant authorities
              </Typography>
            </Box>

            {/* Cookies and Tracking */}
            <Box>
              <Typography
                variant="h2"
                component="h2"
                sx={{
                  fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
                  fontWeight: 600,
                  mb: 2,
                  color: "text.primary",
                }}
              >
                Cookies and Tracking Technologies
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontSize: { xs: "0.95rem", sm: "1rem" },
                  lineHeight: 1.7,
                  color: "text.secondary",
                }}
              >
                We use cookies and similar technologies to enhance your
                experience, analyze usage, and provide personalized content. You
                can control cookie settings through your browser preferences,
                though disabling certain cookies may affect service
                functionality.
              </Typography>
            </Box>

            {/* Third-Party Services */}
            <Box>
              <Typography
                variant="h2"
                component="h2"
                sx={{
                  fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
                  fontWeight: 600,
                  mb: 2,
                  color: "text.primary",
                }}
              >
                Third-Party Services
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontSize: { xs: "0.95rem", sm: "1rem" },
                  lineHeight: 1.7,
                  color: "text.secondary",
                }}
              >
                Our service integrates with third-party services including:
                <br />
                • Google Maps for location selection
                <br />
                • Stripe for payment processing
                <br />
                • Supabase for data storage and authentication
                <br />
                • AI processing services for image generation
                <br />
                Each third-party service has its own privacy policy, and we
                encourage you to review them.
              </Typography>
            </Box>

            {/* Children's Privacy */}
            <Box>
              <Typography
                variant="h2"
                component="h2"
                sx={{
                  fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
                  fontWeight: 600,
                  mb: 2,
                  color: "text.primary",
                }}
              >
                Children&apos;s Privacy
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontSize: { xs: "0.95rem", sm: "1rem" },
                  lineHeight: 1.7,
                  color: "text.secondary",
                }}
              >
                Our service is not intended for children under 13 years of age.
                We do not knowingly collect personal information from children
                under 13. If you believe we have collected information from a
                child under 13, please contact us immediately.
              </Typography>
            </Box>

            {/* International Transfers */}
            <Box>
              <Typography
                variant="h2"
                component="h2"
                sx={{
                  fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
                  fontWeight: 600,
                  mb: 2,
                  color: "text.primary",
                }}
              >
                International Data Transfers
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontSize: { xs: "0.95rem", sm: "1rem" },
                  lineHeight: 1.7,
                  color: "text.secondary",
                }}
              >
                Your information may be transferred to and processed in
                countries other than your own. We ensure appropriate safeguards
                are in place to protect your data in accordance with applicable
                data protection laws.
              </Typography>
            </Box>

            {/* Changes to Policy */}
            <Box>
              <Typography
                variant="h2"
                component="h2"
                sx={{
                  fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
                  fontWeight: 600,
                  mb: 2,
                  color: "text.primary",
                }}
              >
                Changes to This Privacy Policy
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontSize: { xs: "0.95rem", sm: "1rem" },
                  lineHeight: 1.7,
                  color: "text.secondary",
                }}
              >
                We may update this Privacy Policy from time to time. We will
                notify you of any material &quot;material&quot; changes by
                posting the new Privacy Policy on this page and updating the
                &quot;Last updated&quot; date. Your continued use of our service
                after such changes constitutes acceptance of the updated policy.
              </Typography>
            </Box>

            {/* Contact Information */}
            <Box>
              <Typography
                variant="h2"
                component="h2"
                sx={{
                  fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
                  fontWeight: 600,
                  mb: 2,
                  color: "text.primary",
                }}
              >
                Contact Us
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontSize: { xs: "0.95rem", sm: "1rem" },
                  lineHeight: 1.7,
                  color: "text.secondary",
                }}
              >
                If you have any questions about this Privacy Policy or our data
                practices, please contact us at:
                <br />
                Email: privacy@drivedream.ai
                <br />
                We will respond to your inquiry within 30 days.
              </Typography>
            </Box>
          </Stack>
        </Container>
      </Box>
    </ThemeWrapper>
  );
}
