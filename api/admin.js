
export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const adminKey = process.env.ADMIN_KEYS;

  // GET - 验证管理员密码
  if (req.method === 'GET') {
    const key = req.query.key;
    if (!key || key !== adminKey) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    return res.status(200).json({ success: true, message: 'Admin verified' });
  }

  // POST - 管理员操作（如清除日志等）
  if (req.method === 'POST') {
    const key = req.headers['x-admin-key'] || req.body.key;
    if (!key || key !== adminKey) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const action = req.body.action;

    if (action === 'get_stats') {
      // 获取基本统计信息
      const token = process.env.GITHUB_TOKEN;
      const repo = process.env.GITHUB_REPO;

      if (!token || !repo) {
        return res.status(500).json({ error: 'Missing env vars' });
      }

      try {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const path = `logs/${year}/${month}`;

        const dirResp = await fetch(
          `https://api.github.com/repos/${repo}/contents/${path}`,
          { headers: { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github.v3+json' } }
        );

        if (!dirResp.ok) {
          return res.status(200).json({ stats: { files: 0, month: `${year}-${month}` } });
        }

        const files = await dirResp.json();
        const jsonFiles = files.filter(f => f.name.endsWith('.json'));

        return res.status(200).json({
          stats: {
            files: jsonFiles.length,
            month: `${year}-${month}`,
            file_list: jsonFiles.map(f => f.name)
          }
        });
      } catch (error) {
        return res.status(500).json({ error: error.message });
      }
    }

    return res.status(400).json({ error: 'Unknown action' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

