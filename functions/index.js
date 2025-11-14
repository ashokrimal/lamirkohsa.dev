// Example API endpoint
export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({ message: 'Hello from the API!' });
  }
  
  // Handle other HTTP methods
  res.setHeader('Allow', ['GET']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
