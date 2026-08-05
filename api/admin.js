
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 密码验证
  const password = req.headers.authorization || req.query.password;
  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 50;
    const start = (page - 1) * pageSize;
    const end = start + pageSize - 1;

    // 获取索引
    const ids = await kv.lrange('log_index', start, end);
    const total = await kv.llen('log_index');

    // 批量获取记录
    const records = [];
    for (const id of ids) {
      const record = await kv.get(id);
      if (record) records.push(record);
    }

    return res.status(200).json({
      total,
      page,
      pageSize,
      records
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

