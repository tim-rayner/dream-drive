import { supabase, supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

interface DebugResults {
  supabaseClient: boolean;
  supabaseAdminClient: boolean;
  environmentVariables: {
    hasSupabaseUrl: boolean;
    hasSupabaseAnonKey: boolean;
    hasSupabaseServiceKey: boolean;
  };
  generationsTableExists?: boolean;
  generationsTableError?: {
    code: string;
    message: string;
    details: string;
  } | null;
  adminGenerationsTableExists?: boolean;
  adminGenerationsTableError?: {
    code: string;
    message: string;
    details: string;
  } | null;
}

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Database debug endpoint called");

    const results: DebugResults = {
      supabaseClient: !!supabase,
      supabaseAdminClient: !!supabaseAdmin,
      environmentVariables: {
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasSupabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        hasSupabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      },
    };

    // Test basic connection
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("generations")
          .select("count")
          .limit(1);
        results.generationsTableExists = !error;
        results.generationsTableError = error
          ? {
              code: error.code,
              message: error.message,
              details: error.details,
            }
          : null;
      } catch (e) {
        results.generationsTableExists = false;
        results.generationsTableError = {
          code: "UNKNOWN_ERROR",
          message: e instanceof Error ? e.message : "Unknown error",
          details: String(e),
        };
      }
    }

    // Test admin connection
    if (supabaseAdmin) {
      try {
        const { data, error } = await supabaseAdmin
          .from("generations")
          .select("count")
          .limit(1);
        results.adminGenerationsTableExists = !error;
        results.adminGenerationsTableError = error
          ? {
              code: error.code,
              message: error.message,
              details: error.details,
            }
          : null;
      } catch (e) {
        results.adminGenerationsTableExists = false;
        results.adminGenerationsTableError = {
          code: "UNKNOWN_ERROR",
          message: e instanceof Error ? e.message : "Unknown error",
          details: String(e),
        };
      }
    }

    console.log("📊 Database debug results:", results);

    return NextResponse.json({
      success: true,
      debug: results,
    });
  } catch (error) {
    console.error("❌ Error in database debug:", error);
    return NextResponse.json(
      { error: "Database debug failed" },
      { status: 500 }
    );
  }
}
