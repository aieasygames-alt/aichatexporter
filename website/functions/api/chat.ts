// Cloudflare Pages Function — API proxy for DeepSeek / OpenAI
// This solves the CORS issue where browsers block direct calls to AI APIs.

const API_ENDPOINTS: Record<string, string> = {
  deepseek: 'https://api.deepseek.com/chat/completions',
  openai: 'https://api.openai.com/v1/chat/completions',
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Provider',
};

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
    const authHeader = request.headers.get('Authorization') || '';
    const provider = request.headers.get('X-Provider') || 'deepseek';
    const apiUrl = API_ENDPOINTS[provider];

    if (!apiUrl) {
      return new Response(JSON.stringify({ error: `Unknown provider: ${provider}` }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Forward the request body as-is
    const body = await request.text();

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body,
    });

    const responseBody = await response.text();

    return new Response(responseBody, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};
