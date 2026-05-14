// Cloudflare Pages Function — Proxy for Baidu OCR "文档去手写" API
// API docs: https://cloud.baidu.com/doc/OCR/s/il4tb1jay

const BAIDU_TOKEN_URL = 'https://aip.baidubce.com/oauth/2.0/token';
const BAIDU_ERASE_URL = 'https://aip.baidubce.com/rest/2.0/ocr/v1/remove_handwriting';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Baidu-Key, X-Baidu-Secret',
};

// Simple in-memory token cache
let tokenCache: { token: string; expiresAt: number } | null = null;

async function getAccessToken(apiKey: string, secretKey: string): Promise<string> {
  // Use cached token if still valid (with 5min buffer)
  if (tokenCache && Date.now() < tokenCache.expiresAt - 300_000) {
    return tokenCache.token;
  }

  const url = `${BAIDU_TOKEN_URL}?grant_type=client_credentials&client_id=${apiKey}&client_secret=${secretKey}`;
  const res = await fetch(url, { method: 'POST' });
  const data = await res.json() as any;

  if (!data.access_token) {
    throw new Error(data.error_description || 'Failed to get Baidu access token');
  }

  const expiresIn = data.expires_in || 2592000; // default 30 days
  tokenCache = { token: data.access_token, expiresAt: Date.now() + expiresIn * 1000 };

  return data.access_token;
}

export const onRequest: PagesFunction = async (context) => {
  const { request } = context;

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const apiKey = request.headers.get('X-Baidu-Key') || '';
    const secretKey = request.headers.get('X-Baidu-Secret') || '';

    if (!apiKey || !secretKey) {
      return new Response(JSON.stringify({ error: 'Missing Baidu API Key or Secret Key' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Get access token
    const accessToken = await getAccessToken(apiKey, secretKey);

    // Get image base64 from request body
    const body = await request.json() as { image?: string; enable_detect?: boolean };
    if (!body.image) {
      return new Response(JSON.stringify({ error: 'Missing image data' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Call Baidu API
    const params = new URLSearchParams();
    params.set('image', body.image);
    if (body.enable_detect !== undefined) {
      params.set('enable_detect', String(body.enable_detect));
    }

    const baiduUrl = `${BAIDU_ERASE_URL}?access_token=${accessToken}`;
    const response = await fetch(baiduUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const result = await response.json() as any;

    if (result.error_code) {
      return new Response(JSON.stringify({
        error: `Baidu API Error: ${result.error_msg || result.error_code}`,
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({
      image_processed: result.image_processed,
      log_id: result.log_id,
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};
