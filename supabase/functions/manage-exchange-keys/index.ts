import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface KeyPayload {
  action: 'save_keys' | 'get_status' | 'delete_keys' | 'test_connection';
  exchangeId?: string;
  apiKey?: string;
  apiSecret?: string;
  passphrase?: string;
  isTestnet?: boolean;
}

// AES-GCM Server Encryption helper
async function getMasterKey(): Promise<CryptoKey> {
  const secretStr = Deno.env.get('VAULT_MASTER_KEY') || 'stratrade_default_server_vault_master_key_32_bytes_len!!';
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(secretStr.padEnd(32, '0').slice(0, 32)),
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );
  return keyMaterial;
}

async function encryptServer(text: string): Promise<string> {
  const key = await getMasterKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(text));
  const payload = {
    iv: Array.from(iv),
    data: Array.from(new Uint8Array(encrypted)),
  };
  return btoa(JSON.stringify(payload));
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized user session' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body: KeyPayload = await req.json();

    if (body.action === 'save_keys') {
      if (!body.exchangeId || !body.apiKey || !body.apiSecret) {
        return new Response(JSON.stringify({ error: 'Missing required key fields' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const encryptedKey = await encryptServer(body.apiKey);
      const encryptedSecret = await encryptServer(body.apiSecret);

      const { error: dbError } = await supabase.from('user_exchange_keys').upsert({
        user_id: user.id,
        exchange_id: body.exchangeId,
        encrypted_api_key: encryptedKey,
        encrypted_api_secret: encryptedSecret,
        passphrase: body.passphrase || null,
        is_testnet: body.isTestnet || false,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id, exchange_id' });

      if (dbError) {
        return new Response(JSON.stringify({ error: dbError.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ success: true, message: 'Keys securely stored on server vault' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (body.action === 'get_status') {
      const { data: keys, error: fetchErr } = await supabase
        .from('user_exchange_keys')
        .select('exchange_id, is_testnet, updated_at');

      if (fetchErr) {
        return new Response(JSON.stringify({ error: fetchErr.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const configuredExchanges = (keys || []).map((k: { exchange_id: string }) => k.exchange_id);
      return new Response(JSON.stringify({ success: true, configuredExchanges }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (body.action === 'delete_keys') {
      if (!body.exchangeId) {
        return new Response(JSON.stringify({ error: 'Missing exchangeId' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { error: delErr } = await supabase
        .from('user_exchange_keys')
        .delete()
        .eq('user_id', user.id)
        .eq('exchange_id', body.exchangeId);

      if (delErr) {
        return new Response(JSON.stringify({ error: delErr.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ success: true, message: 'Keys deleted' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Unsupported action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
