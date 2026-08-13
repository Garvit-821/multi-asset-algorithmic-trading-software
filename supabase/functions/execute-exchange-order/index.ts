import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OrderPayload {
  exchangeId: 'binance' | 'binance_testnet' | 'coinbase' | 'kraken';
  symbol: string;
  side: 'BUY' | 'SELL';
  orderType: 'LIMIT' | 'MARKET';
  price?: number;
  quantity: number;
  clientOrderId?: string;
}

// Server-side Master Key decryption helper
async function getMasterKey(): Promise<CryptoKey> {
  const secretStr = Deno.env.get('VAULT_MASTER_KEY') || 'stratrade_default_server_vault_master_key_32_bytes_len!!';
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    'raw',
    enc.encode(secretStr.padEnd(32, '0').slice(0, 32)),
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );
}

async function decryptServer(encryptedBase64: string): Promise<string> {
  const payload = JSON.parse(atob(encryptedBase64));
  const iv = new Uint8Array(payload.iv);
  const data = new Uint8Array(payload.data);
  const key = await getMasterKey();
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
  const dec = new TextDecoder();
  return dec.decode(decrypted);
}

// Server HMAC-SHA256 computation
async function hmacSha256(message: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', keyMaterial, enc.encode(message));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
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

    const payload: OrderPayload = await req.json();

    // Fetch user exchange keys from database
    const { data: keyRecord, error: keyErr } = await supabase
      .from('user_exchange_keys')
      .select('encrypted_api_key, encrypted_api_secret, passphrase')
      .eq('user_id', user.id)
      .eq('exchange_id', payload.exchangeId)
      .single();

    if (keyErr || !keyRecord) {
      return new Response(
        JSON.stringify({ error: `No active API keys found on server for exchange ${payload.exchangeId}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = await decryptServer(keyRecord.encrypted_api_key);
    const apiSecret = await decryptServer(keyRecord.encrypted_api_secret);

    // Binance / Binance Testnet Order Execution
    if (payload.exchangeId === 'binance' || payload.exchangeId === 'binance_testnet') {
      const baseUrl = payload.exchangeId === 'binance_testnet'
        ? 'https://testnet.binance.vision/api/v3'
        : 'https://api.binance.com/api/v3';

      const formattedSymbol = payload.symbol.replace('/', '').toUpperCase();
      const timestamp = Date.now();
      const queryParams = new URLSearchParams({
        symbol: formattedSymbol,
        side: payload.side,
        type: payload.orderType,
        quantity: payload.quantity.toString(),
        timestamp: timestamp.toString(),
      });

      if (payload.clientOrderId) {
        queryParams.append('newClientOrderId', payload.clientOrderId);
      }

      if (payload.orderType === 'LIMIT' && payload.price) {
        queryParams.append('price', payload.price.toString());
        queryParams.append('timeInForce', 'GTC');
      }

      const signature = await hmacSha256(queryParams.toString(), apiSecret);
      queryParams.append('signature', signature);

      const response = await fetch(`${baseUrl}/order?${queryParams.toString()}`, {
        method: 'POST',
        headers: {
          'X-MBX-APIKEY': apiKey,
        },
      });

      const resData = await response.json();

      if (!response.ok) {
        return new Response(
          JSON.stringify({ error: resData.msg || 'Binance order placement rejected' }),
          { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          orderId: resData.orderId?.toString() || `BIN-${Date.now()}`,
          exchangeId: payload.exchangeId,
          symbol: payload.symbol,
          side: payload.side,
          price: parseFloat(resData.price || payload.price || 0),
          quantity: parseFloat(resData.executedQty || payload.quantity),
          status: resData.status === 'FILLED' ? 'FILLED' : 'NEW',
          timestamp: resData.transactTime || Date.now(),
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generic Unsupported Exchange fallback response
    return new Response(
      JSON.stringify({ error: `Server execution for ${payload.exchangeId} not implemented yet` }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Execution Error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
