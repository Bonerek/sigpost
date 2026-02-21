import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token } = await req.json();

    if (!token || typeof token !== "string") {
      return new Response(
        JSON.stringify({ error: "Token is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Use the secure function to validate token and get user_id
    const { data: userId, error: validateError } = await supabase
      .rpc("validate_share_token", { token_value: token });

    if (validateError || !userId) {
      return new Response(
        JSON.stringify({ valid: false, error: "Invalid or expired share token" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch user settings (only non-sensitive fields)
    const { data: settings, error: settingsError } = await supabase
      .from("user_settings")
      .select("column_count, custom_text")
      .eq("user_id", userId)
      .eq("share_enabled", true)
      .single();

    if (settingsError || !settings) {
      return new Response(
        JSON.stringify({ valid: false, error: "Settings not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch categories for this user (including tab_id and iframe settings)
    const { data: categories, error: categoriesError } = await supabase
      .from("categories")
      .select("id, title, color, column_index, position, tab_id, iframe_url, iframe_refresh_interval")
      .eq("user_id", userId)
      .order("column_index")
      .order("position");

    if (categoriesError) {
      throw categoriesError;
    }

    // Fetch links for these categories
    const categoryIds = categories?.map((c) => c.id) || [];
    let links: any[] = [];
    
    if (categoryIds.length > 0) {
      const { data: linksData, error: linksError } = await supabase
        .from("links")
        .select("id, category_id, title, url, description, icon, position")
        .in("category_id", categoryIds)
        .order("position");

      if (linksError) {
        throw linksError;
      }
      links = linksData || [];
    }

    // Fetch tabs for this user
    const { data: tabs, error: tabsError } = await supabase
      .from("tabs")
      .select("id, name, color, position, page_id")
      .eq("user_id", userId)
      .order("position");

    if (tabsError) {
      throw tabsError;
    }

    // Fetch pages for this user
    const { data: pages, error: pagesError } = await supabase
      .from("pages")
      .select("id, name, position")
      .eq("user_id", userId)
      .order("position");

    if (pagesError) {
      throw pagesError;
    }

    return new Response(
      JSON.stringify({
        valid: true,
        settings: {
          column_count: settings.column_count,
          custom_text: settings.custom_text,
        },
        categories: categories || [],
        links: links,
        tabs: tabs || [],
        pages: pages || [],
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error validating share token:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
