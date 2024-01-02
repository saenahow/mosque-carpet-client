import type { NextApiRequest, NextApiResponse } from 'next'
 
export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ message : string }>
) {
  res.status(401).json({ message: "Unauthorize" })
}