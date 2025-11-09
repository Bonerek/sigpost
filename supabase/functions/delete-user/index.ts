import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.80.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Verify the user is authenticated
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Check if user is admin
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (roleError || !roleData) {
      throw new Error('Forbidden: Admin access required');
    }

    // Get request data
    const { userId } = await req.json();

    if (!userId) {
      throw new Error('userId is required');
    }

    // Prevent deleting own account
    if (userId === user.id) {
      throw new Error('Cannot delete your own account');
    }

    // Check if trying to delete admin@admin.local
    const { data: profileData } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .eq('user_id', userId)
      .single();

    if (profileData?.email === 'admin@admin.local') {
      throw new Error('Cannot delete main admin account');
    }

    // Delete user - this will trigger cascade delete of profile and all related data
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteError) {
      console.error('Error deleting user:', deleteError);
      throw deleteError;
    }

    console.log(`User ${userId} deleted successfully with all related data`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'User and all related data deleted successfully' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in delete-user function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isUnauthorized = errorMessage.includes('Unauthorized');
    const isForbidden = errorMessage.includes('Forbidden');
    const isBadRequest = errorMessage.includes('required') || errorMessage.includes('Cannot');
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: isUnauthorized ? 401 : isForbidden ? 403 : isBadRequest ? 400 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
