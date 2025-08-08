"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { supabase, useAuth } from "./AuthContext";

interface CreditsContextType {
  credits: number | null;
  loading: boolean;
  refreshCredits: () => Promise<void>;
  updateCredits: (newAmount: number) => void;
}

const CreditsContext = createContext<CreditsContextType>({
  credits: null,
  loading: false,
  refreshCredits: async () => {},
  updateCredits: () => {},
});

export function CreditsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchCredits = async () => {
    if (!user) {
      setCredits(null);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("credits")
        .select("available_credits")
        .eq("id", user.id)
        .single();

      if (error && error.code === "PGRST116") {
        // No credits row exists, create one with 0 credits
        const { data: newData, error: insertError } = await supabase
          .from("credits")
          .insert({ id: user.id, available_credits: 0 })
          .select("available_credits")
          .single();

        if (!insertError) {
          setCredits(newData.available_credits);
        }
      } else if (!error && data) {
        setCredits(data.available_credits);
      }
    } catch (error) {
      console.error("Error fetching credits:", error);
    } finally {
      setLoading(false);
    }
  };

  const refreshCredits = async () => {
    await fetchCredits();
  };

  const updateCredits = (newAmount: number) => {
    setCredits(newAmount);
  };

  // Fetch credits when user changes
  useEffect(() => {
    fetchCredits();
  }, [user]);

  return (
    <CreditsContext.Provider
      value={{ credits, loading, refreshCredits, updateCredits }}
    >
      {children}
    </CreditsContext.Provider>
  );
}

export function useCredits() {
  const context = useContext(CreditsContext);
  return context;
}
