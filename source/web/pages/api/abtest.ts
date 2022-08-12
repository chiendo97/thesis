// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { ABTest } from '@Types/api';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ABTest[]>) {
  const resp = await fetch('http://localhost:8080/api/v1/abtest', {
    method: 'POST',
    body: req.body,
  });

  const result: ABTest[] = await resp.json();

  res.status(200).json(result);
}
