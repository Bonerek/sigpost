import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
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

    // validate_share_token now returns page_id
    const { data: pageId, error: validateError } = await supabase
      .rpc("validate_share_token", { token_value: token });

    if (validateError || !pageId) {
      return new Response(
        JSON.stringify({ valid: false, error: "Invalid or expired share token" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch the page
    const { data: page, error: pageError } = await supabase
      .from("pages")
      .select("id, name, position, user_id")
      .eq("id", pageId)
      .single();

    if (pageError || !page) {
      return new Response(
        JSON.stringify({ valid: false, error: "Page not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = page.user_id;

    // Fetch user settings (only non-sensitive fields)
    const { data: settings } = await supabase
      .from("user_settings")
      .select("column_count")
      .eq("user_id", userId)
      .single();

    // Fetch tabs for this page
    const { data: tabs, error: tabsError } = await supabase
      .from("tabs")
      .select("id, name, color, position, page_id")
      .eq("user_id", userId)
      .eq("page_id", pageId)
      .order("position");

    if (tabsError) throw tabsError;

    // Fetch categories for these tabs
    const tabIds = (tabs || []).map((t: any) => t.id);
    let categories: any[] = [];
    let links: any[] = [];

    if (tabIds.length > 0) {
      const { data: catsData, error: catsError } = await supabase
        .from("categories")
        .select("id, title, color, column_index, position, tab_id, iframe_url, iframe_refresh_interval")
        .eq("user_id", userId)
        .in("tab_id", tabIds)
        .order("column_index")
        .order("position");

      if (catsError) throw catsError;
      categories = catsData || [];

      const categoryIds = categories.map((c: any) => c.id);
      if (categoryIds.length > 0) {
        const { data: linksData, error: linksError } = await supabase
          .from("links")
          .select("id, category_id, title, url, description, icon, position")
          .in("category_id", categoryIds)
          .order("position");

        if (linksError) throw linksError;
        links = linksData || [];
      }
    }

    return new Response(
      JSON.stringify({
        valid: true,
        page: { id: page.id, name: page.name },
        settings: { column_count: settings?.column_count || 3 },
        categories,
        links,
        tabs: tabs || [],
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
