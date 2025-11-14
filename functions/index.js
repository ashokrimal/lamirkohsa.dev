// Cloudflare Pages Function
export async function onRequest(context) {
  try {
    const { request } = context;
    
    // Handle different HTTP methods
    if (request.method === 'GET') {
      return new Response(JSON.stringify({ message: "Hello from Cloudflare Pages Functions!" }), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    if (request.method === 'POST') {
      const body = await request.json();
      return new Response(JSON.stringify({ received: body }), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    // Method not allowed
    return new Response('Method Not Allowed', { 
      status: 405,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

// Next.js API route handler (fallback for local development)
export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({ message: 'Hello from the API!' });
  }
  
  if (req.method === 'POST') {
    return res.status(200).json({ received: req.body });
  }
  
  // Handle other HTTP methods
  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
