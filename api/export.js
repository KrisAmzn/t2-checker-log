
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 管理员验证
  const adminKey = req.query.key || req.headers['x-admin-key'];
  if (!adminKey || adminKey !== process.env.ADMIN_KEYS) {
    return res.status(401).json({ error: 'Unauthorized. Provide ?key=YOUR_ADMIN_KEY' });
  }

  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;

  if (!token || !repo) {
    return res.status(500).json({ error: 'Missing GITHUB_TOKEN or GITHUB_REPO env vars' });
  }

  try {
    const year = req.query.year || new Date().getFullYear().toString();
    const month = req.query.month || String(new Date().getMonth() + 1).padStart(2, '0');
    const path = `logs/${year}/${month}`;

    // 获取目录
    const dirResp = await fetch(
      `https://api.github.com/repos/${repo}/contents/${path}`,
      { headers: { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github.v3+json' } }
    );

    if (!dirResp.ok) {
      if (dirResp.status === 404) {
        return res.status(200).json({ logs: [], message: `No data for ${year}/${month}` });
      }
      return res.status(dirResp.status).json({ error: 'GitHub API error: ' + dirResp.status });
    }

    const files = await dirResp.json();
    const allLogs = [];

    for (const file of files) {
      if (!file.name.endsWith('.json')) continue;
      const fileResp = await fetch(
        `https://api.github.com/repos/${repo}/contents/${path}/${file.name}`,
        { headers: { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github.v3+json' } }
      );
      if (fileResp.ok) {
        const fileData = await fileResp.json();
        const content = Buffer.from(fileData.content, 'base64').toString('utf-8');
        try {
          const parsed = JSON.parse(content);
          if (Array.isArray(parsed)) allLogs.push(...parsed);
          else allLogs.push(parsed);
        } catch (e) {
          content.split('\n').filter(Boolean).forEach(line => {
            try { allLogs.push(JSON.parse(line)); } catch (e2) {}
          });
        }
      }
    }

    // 筛选
    let filtered = allLogs;
    if (req.query.action_type) {
      filtered = filtered.filter(log => log.action_type === req.query.action_type);
    }
    if (req.query.user) {
      filtered = filtered.filter(log => log.user_alias === req.query.user);
    }

    // CSV格式输出
    if (req.query.format === 'csv') {
      const csvRows = [];
      csvRows.push('Date_CN,Time_CN,User,Action,Booking_ID,Issue_Type,Result,Reason,Reason_Code,Reason_Text,Steps_Count,Duration_ms,Session_ID');

      filtered.forEach(log => {
        const details = log.details || {};
        const ts = log.client_timestamp || '';
        let dateCN = '';
        let timeCN = '';
        if (ts) {
          const d = new Date(ts);
          if (!isNaN(d.getTime())) {
            const china = new Date(d.getTime() + 8 * 60 * 60 * 1000);
            dateCN = china.toISOString().substring(0, 10);
            timeCN = china.toISOString().substring(11, 19);
          }
        }
        const row = [
          dateCN,
          timeCN,
          log.user_alias || '',
          log.action_type || '',
          details.booking_id || '',
          details.issue_type || '',
          details.result || '',
          (details.reason || '').replace(/,/g, ';'),
          details.reason_code || '',
          (details.reason_text || '').replace(/,/g, ';').replace(/\n/g, ' '),
          details.steps_count || (details.steps ? details.steps.length : ''),
          details.duration_ms || '',
          log.session_id || ''
        ];
        csvRows.push(row.join(','));
      });

      const csv = csvRows.join('\n');
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename=t2_checker_log_${year}_${month}.csv`);
      return res.status(200).send('\uFEFF' + csv);
    }

    // JSON格式输出
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json({ total: filtered.length, year, month, logs: filtered });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

