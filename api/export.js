
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // 密码验证
  const password = req.headers.authorization || req.query.password;
  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const ids = await kv.lrange('log_index', 0, -1);
    const records = [];
    for (const id of ids) {
      const record = await kv.get(id);
      if (record) records.push(record);
    }

    // 生成CSV
    const headers = 'Timestamp,User,BookingID,IssueType,Result,Reason,ForceEscalate,ForceReason,DataSummary';
    const rows = records.map(r => 
      `"${r.timestamp}","${r.user}","${r.bookingId}","${r.issueType}","${r.result}","${r.reason}","${r.forceEscalate}","${r.forceReason}","${(r.dataSummary || '').replace(/"/g, '""')}"`
    );
    const csv = headers + '\n' + rows.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=t2_checker_log.csv');
    return res.status(200).send(csv);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

