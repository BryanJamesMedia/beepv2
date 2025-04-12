import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const WEAVY_URL = 'https://f5fffafbb27144e7842e0673387775d9.weavy.io';
const WEAVY_API_KEY = 'wys_273MseFIJj4TOCq2yHbMlb2YR5wDQN3etBGw';

// In-memory token store (in production, use a database)
const tokenStore = new Map<string, { token: string; expiresAt: number }>();

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get user from Supabase auth
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (userError || !user) {
      throw userError || new Error('User not found')
    }

    // Check if we need to refresh the token
    const url = new URL(req.url);
    const refresh = url.searchParams.get('refresh') === 'true';
    
    // Check for existing valid token
    if (!refresh) {
      const existingToken = tokenStore.get(user.id);
      if (existingToken && existingToken.expiresAt > Date.now() + (5 * 60 * 1000)) { // 5 min buffer
        return new Response(
          JSON.stringify({ 
            token: existingToken.token,
            expiresIn: Math.floor((existingToken.expiresAt - Date.now()) / 1000)
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      }
    }

    // Step 1: Create/Update Weavy user
    const weavyUserResponse = await fetch(`${WEAVY_URL}/api/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WEAVY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        uid: user.id,
        name: user.email?.split('@')[0] || user.id,
        email: user.email
      })
    })

    if (!weavyUserResponse.ok) {
      throw new Error(`Failed to create/update Weavy user: ${await weavyUserResponse.text()}`)
    }

    // Step 2: Generate Weavy token for the user
    const tokenResponse = await fetch(
      `${WEAVY_URL}/api/users/${user.id}/tokens`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WEAVY_API_KEY}`
        },
        body: JSON.stringify({ expires_in: 3600 }) // Token expires in 1 hour
      }
    )

    if (!tokenResponse.ok) {
      throw new Error(`Failed to generate token: ${await tokenResponse.text()}`)
    }

    const { access_token } = await tokenResponse.json()
    
    // Store the new token
    const expiresAt = Date.now() + (3600 * 1000); // 1 hour from now
    tokenStore.set(user.id, { token: access_token, expiresAt });

    return new Response(
      JSON.stringify({ 
        token: access_token,
        expiresIn: 3600
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in weavy-token function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})