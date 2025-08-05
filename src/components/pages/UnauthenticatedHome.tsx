import LoginButton from "@/components/LoginButton";
import PromotionalBanner from "@/components/PromotionalBanner";
import {
  AutoAwesome as AutoAwesomeIcon,
  Map as MapIcon,
  PhotoCamera as PhotoCameraIcon,
} from "@mui/icons-material";
import {
  Box,
  Card,
  CardContent,
  Container,
  Stack,
  Typography,
} from "@mui/material";

export default function UnauthenticatedHome() {
  return (
    <Container maxWidth="md" sx={{ px: { xs: 1, sm: 2 }, mx: "auto" }}>
      <Box
        sx={{
          textAlign: "center",
          py: { xs: 4, sm: 6, md: 8 },
          pt: 0,
          mx: "auto",
          maxWidth: 600,
        }}
      >
        <Stack
          spacing={{ xs: 3, sm: 4 }}
          alignItems="center"
          maxWidth={600}
          mx="auto"
          sx={{ width: "100%" }}
        >
          {/* Promotional Banner */}
          <PromotionalBanner />

          <Typography
            variant="h4"
            component="h2"
            fontWeight={600}
            color="text.primary"
            sx={{
              fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" },
              px: { xs: 2, sm: 0 },
              textAlign: "center",
            }}
          >
            Ready to Create Your DriveDream?
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              mb: 4,
              px: { xs: 2, sm: 0 },
              fontSize: { xs: "0.95rem", sm: "1rem" },
              lineHeight: 1.6,
              textAlign: "center",
            }}
          >
            Sign in to start generating AI-powered car scenes. Upload your car
            photo, choose any location in the world, and watch AI place your car
            in that scene.
          </Typography>

          <LoginButton />

          {/* Feature preview cards */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
              },
              gap: { xs: 2, sm: 3 },
              mt: { xs: 4, sm: 6 },
              width: "100%",
              justifyItems: "center",
            }}
          >
            <Card
              sx={{
                background: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                height: "100%",
                minHeight: { xs: 200, sm: 220 },
              }}
            >
              <CardContent
                sx={{
                  textAlign: "center",
                  py: { xs: 2, sm: 3 },
                  px: { xs: 2, sm: 3 },
                }}
              >
                <PhotoCameraIcon
                  sx={{
                    fontSize: { xs: 36, sm: 40, md: 48 },
                    color: "primary.main",
                    mb: 2,
                  }}
                />
                <Typography
                  variant="h6"
                  component="h3"
                  gutterBottom
                  sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
                >
                  Upload Your Car
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                >
                  Upload a photo of your car and let AI work its magic
                </Typography>
              </CardContent>
            </Card>

            <Card
              sx={{
                background: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                height: "100%",
                minHeight: { xs: 200, sm: 220 },
              }}
            >
              <CardContent
                sx={{
                  textAlign: "center",
                  py: { xs: 2, sm: 3 },
                  px: { xs: 2, sm: 3 },
                }}
              >
                <MapIcon
                  sx={{
                    fontSize: { xs: 36, sm: 40, md: 48 },
                    color: "primary.main",
                    mb: 2,
                  }}
                />
                <Typography
                  variant="h6"
                  component="h3"
                  gutterBottom
                  sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
                >
                  Choose Location
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                >
                  Pick any location in the world using our interactive map
                </Typography>
              </CardContent>
            </Card>

            <Card
              sx={{
                background: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                height: "100%",
                minHeight: { xs: 200, sm: 220 },
                gridColumn: { xs: "1", sm: "span 2", md: "span 1" },
              }}
            >
              <CardContent
                sx={{
                  textAlign: "center",
                  py: { xs: 2, sm: 3 },
                  px: { xs: 2, sm: 3 },
                }}
              >
                <AutoAwesomeIcon
                  sx={{
                    fontSize: { xs: 36, sm: 40, md: 48 },
                    color: "primary.main",
                    mb: 2,
                  }}
                />
                <Typography
                  variant="h6"
                  component="h3"
                  gutterBottom
                  sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
                >
                  Generate AI Scene
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                >
                  Watch as AI seamlessly places your car in the chosen location
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Stack>
      </Box>
    </Container>
  );
}
