import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

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

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Check if caller is admin
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (roleError || !roleData) {
      throw new Error('Forbidden: Admin access required');
    }

    const { userId, newRole } = await req.json();

    if (!userId || !newRole) {
      throw new Error('userId and newRole are required');
    }

    if (!['admin', 'user'].includes(newRole)) {
      throw new Error('Invalid role. Must be "admin" or "user"');
    }

    // Prevent changing own role
    if (userId === user.id) {
      throw new Error('Cannot change your own role');
    }

    // Update the role
    const { error: deleteError } = await supabaseAdmin
      .from('user_roles')
      .delete()
      .eq('user_id', userId);

    if (deleteError) {
      console.error('Error deleting old role:', deleteError);
      throw deleteError;
    }

    const { error: insertError } = await supabaseAdmin
      .from('user_roles')
      .insert({ user_id: userId, role: newRole });

    if (insertError) {
      console.error('Error inserting new role:', insertError);
      throw insertError;
    }

    console.log(`User ${userId} role changed to ${newRole}`);

    return new Response(
      JSON.stringify({ success: true, message: `Role changed to ${newRole}` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in change-user-role function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isUnauthorized = errorMessage.includes('Unauthorized');
    const isForbidden = errorMessage.includes('Forbidden');
    const isBadRequest = errorMessage.includes('required') || errorMessage.includes('Cannot change') || errorMessage.includes('Invalid role');
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: isUnauthorized ? 401 : isForbidden ? 403 : isBadRequest ? 400 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
