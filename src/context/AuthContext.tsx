"use client";

import { createClient, Session, User } from "@supabase/supabase-js";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface PublicProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  profile: PublicProfile | null;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<PublicProfile | null>(null);

  // On mount: get session and listen for changes
  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setSession(session);
      setUser(session?.user ?? null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );
    setLoading(false);
    return () => {
      mounted = false;
      listener?.subscription.unsubscribe();
    };
  }, []);

  // Preload public profile when user changes
  useEffect(() => {
    if (user) {
      supabase
        .from("public_profiles")
        .select("*")
        .eq("id", user.id)
        .single()
        .then(({ data, error }) => {
          if (!error && data) setProfile(data);
          else setProfile(null);
        });
    } else {
      setProfile(null);
    }
  }, [user]);

  const login = () => {
    supabase.auth.signInWithOAuth({ provider: "google" });
  };
  const logout = () => {
    supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{ user, session, loading, profile, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export { supabase };
