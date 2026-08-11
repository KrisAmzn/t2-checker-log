
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const GITHUB_REPO = process.env.GITHUB_REPO;

  if (!GITHUB_TOKEN || !GITHUB_REPO) {
    return res.status(500).json({ error: 'Server config error: missing env vars' });
  }

  try {
    const logEntry = req.body;

    if (!logEntry.user_alias || !logEntry.action_type) {
      return res.status(400).json({ error: 'Missing: user_alias, action_type' });
    }

    logEntry.server_timestamp = new Date().toISOString();

    // 按月份存储
    const now = new Date();
    const fileName = `logs/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/data.json`;

    // 读取已有数据
    let existingData = [];
    let fileSha = null;

    const getRes = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/contents/${fileName}?ref=main`,
      {
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );

    if (getRes.ok) {
      const fileData = await getRes.json();
      fileSha = fileData.sha;
      existingData = JSON.parse(Buffer.from(fileData.content, 'base64').toString('utf-8'));
    }

    existingData.push(logEntry);

    // 写回 GitHub
    const putBody = {
      message: `[log] ${logEntry.user_alias} - ${logEntry.action_type}`,
      content: Buffer.from(JSON.stringify(existingData, null, 2)).toString('base64'),
      branch: 'main'
    };
    if (fileSha) putBody.sha = fileSha;

    const putRes = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/contents/${fileName}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github.v3+json'
        },
        body: JSON.stringify(putBody)
      }
    );

    if (!putRes.ok) {
      const err = await putRes.json();
      return res.status(500).json({ error: err.message });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

