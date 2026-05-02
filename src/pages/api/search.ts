import type { NextApiRequest, NextApiResponse } from 'next';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { q, lang = 'ja' } = req.query;
  if (typeof q !== 'string' || !q.trim()) {
    res.status(200).json([]);
    return;
  }

  const base = process.env.WP_API_URL?.replace(/\/+$/, '');
  if (!base) {
    res.status(500).json([]);
    return;
  }

  const url = `${base}/posts?search=${encodeURIComponent(q)}&lang=${lang}&_embed&acf_format=standard&per_page=20`;
  const wpRes = await fetch(url);
  if (!wpRes.ok) {
    res.status(wpRes.status).json([]);
    return;
  }

  const data = await wpRes.json();
  res.status(200).json(data);
};
