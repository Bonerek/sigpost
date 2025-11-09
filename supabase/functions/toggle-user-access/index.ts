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
    const { userId, isActive } = await req.json();

    if (!userId || isActive === undefined) {
      throw new Error('userId and isActive are required');
    }

    // Check if trying to disable admin@admin.local
    const { data: profileData } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .eq('user_id', userId)
      .single();

    if (profileData?.email === 'admin@admin.local' && !isActive) {
      throw new Error('Cannot disable main admin account');
    }

    // Update profile active status
    const { error: updateProfileError } = await supabaseAdmin
      .from('profiles')
      .update({ is_active: isActive })
      .eq('user_id', userId);

    if (updateProfileError) {
      console.error('Error updating profile:', updateProfileError);
      throw updateProfileError;
    }

    // Update auth user - ban or unban
    if (isActive) {
      // Unban user
      const { error } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        { ban_duration: 'none' }
      );
      
      if (error) {
        console.error('Error unbanning user:', error);
        throw error;
      }
    } else {
      // Ban user indefinitely
      const { error } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        { ban_duration: '876000h' } // 100 years
      );
      
      if (error) {
        console.error('Error banning user:', error);
        throw error;
      }
    }

    console.log(`User ${userId} access ${isActive ? 'enabled' : 'disabled'}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `User access ${isActive ? 'enabled' : 'disabled'} successfully` 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in toggle-user-access function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isUnauthorized = errorMessage.includes('Unauthorized');
    const isForbidden = errorMessage.includes('Forbidden');
    const isBadRequest = errorMessage.includes('required') || errorMessage.includes('Cannot disable');
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: isUnauthorized ? 401 : isForbidden ? 403 : isBadRequest ? 400 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
