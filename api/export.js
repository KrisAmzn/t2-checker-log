
export default async function handler(req, res) {
  // 只允许 GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;

  if (!token || !repo) {
    return res.status(500).json({ error: 'Missing GITHUB_TOKEN or GITHUB_REPO env vars' });
  }

  try {
    // 获取 logs 目录结构
    const year = req.query.year || new Date().getFullYear().toString();
    const month = req.query.month || String(new Date().getMonth() + 1).padStart(2, '0');
    const path = `logs/${year}/${month}`;

    const dirResp = await fetch(
      `https://api.github.com/repos/${repo}/contents/${path}`,
      {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );

    if (!dirResp.ok) {
      if (dirResp.status === 404) {
        return res.status(200).json({ logs: [], message: `No data found for ${year}/${month}` });
      }
      return res.status(dirResp.status).json({ error: 'GitHub API error: ' + dirResp.status });
    }

    const files = await dirResp.json();

    // 读取每个日志文件的内容
    const allLogs = [];

    for (const file of files) {
      if (!file.name.endsWith('.json')) continue;

      const fileResp = await fetch(
        `https://api.github.com/repos/${repo}/contents/${path}/${file.name}`,
        {
          headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );

      if (fileResp.ok) {
        const fileData = await fileResp.json();
        // GitHub 返回 base64 编码的内容
        const content = Buffer.from(fileData.content, 'base64').toString('utf-8');
        try {
          const parsed = JSON.parse(content);
          // 如果是数组直接合并，如果是对象包一层
          if (Array.isArray(parsed)) {
            allLogs.push(...parsed);
          } else {
            allLogs.push(parsed);
          }
        } catch (e) {
          // 如果文件内容不是标准JSON，尝试按行解析
          content.split('\n').filter(Boolean).forEach(function(line) {
            try { allLogs.push(JSON.parse(line)); } catch (e2) {}
          });
        }
      }
    }

    // 支持筛选
    let filtered = allLogs;

    if (req.query.action_type) {
      filtered = filtered.filter(log => log.action_type === req.query.action_type);
    }

    if (req.query.user) {
      filtered = filtered.filter(log => log.user_alias === req.query.user);
    }

    // 返回结果
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json({
      total: filtered.length,
      year: year,
      month: month,
      logs: filtered
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

