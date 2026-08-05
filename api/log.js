
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // 允许跨域
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = req.body;
    const id = `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const record = {
      id,
      timestamp: data.timestamp || new Date().toISOString(),
      user: data.user || 'unknown',
      bookingId: data.bookingId || '',
      issueType: data.issueType || '',
      result: data.result || '',
      reason: data.reason || '',
      forceEscalate: data.forceEscalate || false,
      forceReason: data.forceReason || '',
      dataSummary: data.dataSummary || ''
    };

    // 存储单条记录
    await kv.set(id, record);
    
    // 维护索引列表（最近1000条）
    await kv.lpush('log_index', id);
    await kv.ltrim('log_index', 0, 999);

    return res.status(200).json({ status: 'success', id });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
}

