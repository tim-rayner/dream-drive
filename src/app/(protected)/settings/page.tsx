"use client";

import ThemeWrapper from "@/components/ThemeWrapper";
import { supabase, useAuth } from "@/context/AuthContext";
import { Refresh as RefreshIcon } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

interface CreditLog {
  id: string;
  amount: number;
  source: string;
  price_id: string;
  session_id?: string;
  created_at: string;
  price_amount?: number;
  price_currency?: string;
}

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const [logs, setLogs] = useState<CreditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const testDatabaseConnection = async () => {
    try {
      // Use the supabase client from AuthContext
      if (!supabase) {
        console.error("❌ Supabase client not initialized");
        return false;
      }

      // Use the user from AuthContext instead of calling auth.getUser()
      if (!user) {
        console.error("❌ No user from AuthContext");
        return false;
      }
      console.log("✅ User authenticated:", user.id);

      // Test credits_log table access
      const { data: testData, error: testError } = await supabase
        .from("credits_log")
        .select("count")
        .limit(1);

      if (testError) {
        console.error("❌ Database access error:", testError);
        return false;
      }
      console.log("✅ Database access successful");
      return true;
    } catch (error) {
      console.error("❌ Database connection test failed:", error);
      return false;
    }
  };

  const fetchLogs = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    try {
      // Test database connection first
      const connectionOk = await testDatabaseConnection();
      if (!connectionOk) {
        throw new Error("Database connection test failed");
      }

      // Use the supabase client from AuthContext
      if (!supabase) {
        throw new Error("Supabase client not initialized");
      }

      // Use the user from AuthContext instead of calling auth.getUser()
      if (!user) {
        console.error("User not authenticated");
        throw new Error("User not authenticated");
      }

      console.log("Fetching logs for user:", user.id);

      const { data, error } = await supabase
        .from("credits_log")
        .select(
          "id, amount, source, price_id, session_id, created_at, price_amount, price_currency"
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Database query error:", error);
        throw error;
      }

      setLogs(data || []);
      setLastUpdated(new Date());
    } catch (err: unknown) {
      console.error("Error in fetchLogs:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(`Failed to load purchase history: ${errorMessage}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Only fetch logs when authentication is ready and user is logged in
    if (!authLoading && user) {
      fetchLogs();
    } else if (!authLoading && !user) {
      setError("Please log in to view your purchase history.");
      setLoading(false);
    }
  }, [authLoading, user]);

  // Auto-refresh purchase history every 30 seconds
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      console.log("Auto-refreshing purchase history...");
      fetchLogs(true);
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [user]);

  // Show loading while auth is initializing
  if (authLoading) {
    return (
      <ThemeWrapper>
        <Box
          sx={{
            minHeight: "100vh",
            background:
              "linear-gradient(135deg, #0F0F23 0%, #1A1A2E 50%, #1E1E3F 100%)",
            py: 4,
          }}
        >
          <Container maxWidth="md">
            <Stack
              spacing={4}
              alignItems="center"
              justifyContent="center"
              sx={{ minHeight: "50vh" }}
            >
              <CircularProgress />
              <Typography color="text.secondary">Loading...</Typography>
            </Stack>
          </Container>
        </Box>
      </ThemeWrapper>
    );
  }

  // Show login prompt if not authenticated
  if (!user) {
    return (
      <ThemeWrapper>
        <Box
          sx={{
            minHeight: "100vh",
            background:
              "linear-gradient(135deg, #0F0F23 0%, #1A1A2E 50%, #1E1E3F 100%)",
            py: 4,
          }}
        >
          <Container maxWidth="md">
            <Stack
              spacing={4}
              alignItems="center"
              justifyContent="center"
              sx={{ minHeight: "50vh" }}
            >
              <Typography variant="h4" color="text.primary" textAlign="center">
                Please log in to view your settings
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() => (window.location.href = "/")}
              >
                Go to Home
              </Button>
            </Stack>
          </Container>
        </Box>
      </ThemeWrapper>
    );
  }

  return (
    <ThemeWrapper>
      <Box
        sx={{
          minHeight: "100vh",
          background:
            "linear-gradient(135deg, #0F0F23 0%, #1A1A2E 50%, #1E1E3F 100%)",
          py: 4,
        }}
      >
        <Container maxWidth="md">
          <Stack spacing={4} alignItems="center">
            <Typography
              variant="h3"
              component="h1"
              align="center"
              sx={{
                background: "linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontWeight: 700,
                mb: 2,
              }}
            >
              User Settings
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              align="center"
              sx={{ mb: 2, maxWidth: 600 }}
            >
              View your credit purchase history below.
            </Typography>
            <Card sx={{ width: "100%", maxWidth: 900 }}>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      Purchase History
                    </Typography>
                    {lastUpdated && (
                      <Typography variant="caption" color="text.secondary">
                        Last updated: {lastUpdated.toLocaleTimeString()}
                      </Typography>
                    )}
                  </Box>
                  <Button
                    onClick={() => fetchLogs(true)}
                    disabled={loading || refreshing}
                    startIcon={<RefreshIcon />}
                    variant="outlined"
                    size="small"
                  >
                    {refreshing ? "Refreshing..." : "Refresh"}
                  </Button>
                </Box>
                {loading ? (
                  <Stack alignItems="center" py={4}>
                    <CircularProgress />
                  </Stack>
                ) : error ? (
                  <Alert severity="error">{error}</Alert>
                ) : logs.length === 0 ? (
                  <Alert severity="info">No purchases found.</Alert>
                ) : (
                  <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Date & Time</TableCell>
                          <TableCell>Credits</TableCell>
                          <TableCell>Price</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {logs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell>
                              {new Date(log.created_at).toLocaleString()}
                            </TableCell>
                            <TableCell>{log.amount}</TableCell>
                            <TableCell>
                              {log.price_amount
                                ? `${
                                    log.price_currency === "GBP"
                                      ? "£"
                                      : log.price_currency
                                  }${log.price_amount.toFixed(2)}`
                                : "Unknown"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </Stack>
        </Container>
      </Box>
    </ThemeWrapper>
  );
}
