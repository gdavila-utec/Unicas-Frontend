import { NextApiRequest, NextApiResponse } from 'next';

interface HealthRequest extends NextApiRequest {}

export default function handler(req: HealthRequest, res: NextApiResponse) {
  // Disable any authentication middleware for this route
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({ status: 'healthy' });
}
