
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>T2 Checker - Admin Dashboard</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Amazon Ember', -apple-system, Arial, sans-serif;
      background: #f4f6f8;
      padding: 24px;
      color: #232f3e;
    }
    h1 {
      font-size: 20px;
      margin-bottom: 20px;
      color: #232f3e;
    }
    .admin-controls {
      background: #fff;
      padding: 16px 20px;
      border-radius: 8px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.1);
      margin-bottom: 20px;
      display: flex;
      gap: 12px;
      align-items: flex-end;
      flex-wrap: wrap;
    }
    .admin-controls .field {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .admin-controls label {
      font-size: 11px;
      font-weight: 600;
      color: #555;
      text-transform: uppercase;
    }
    .admin-controls input,
    .admin-controls select {
      padding: 8px 10px;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 13px;
      min-width: 120px;
    }
    .admin-controls button {
      padding: 8px 20px;
      background: #ff9900;
      color: #fff;
      border: none;
      border-radius: 4px;
      font-weight: 600;
      cursor: pointer;
      font-size: 13px;
    }
    .admin-controls button:hover { background: #e88b00; }

    /* 统计卡片 */
    .stats-row {
      display: flex;
      gap: 16px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }
    .stat-card {
      background: #fff;
      padding: 16px 20px;
      border-radius: 8px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.1);
      flex: 1;
      min-width: 150px;
    }
    .stat-card .stat-value {
      font-size: 28px;
      font-weight: 700;
      color: #232f3e;
    }
    .stat-card .stat-label {
      font-size: 12px;
      color: #888;
      margin-top: 4px;
    }

    /* 数据表格 */
    .data-table-wrapper {
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .data-table-wrapper h3 {
      padding: 14px 20px;
      font-size: 14px;
      border-bottom: 1px solid #eee;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }
    th {
      background: #f9fafb;
      padding: 10px 12px;
      text-align: left;
      font-weight: 600;
      color: #555;
      border-bottom: 1px solid #eee;
    }
    td {
      padding: 9px 12px;
      border-bottom: 1px solid #f5f5f5;
      color: #333;
    }
    tr:hover td { background: #fafbfc; }

    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 11px;
      font-weight: 600;
    }
    .badge.eligible { background: #e6f9e6; color: #1d8102; }
    .badge.not-eligible { background: #fce9e9; color: #d13212; }
    .badge.needs-review { background: #fef8e6; color: #b8860b; }

    .empty-state {
      text-align: center;
      padding: 40px;
      color: #888;
      font-size: 14px;
    }

    /* Auth 区域 */
    .auth-section {
      background: #fff;
      padding: 24px;
      border-radius: 8px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.1);
      max-width: 400px;
      margin: 60px auto;
      text-align: center;
    }
    .auth-section input {
      width: 100%;
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 4px;
      margin: 12px 0;
      font-size: 14px;
    }
    .auth-section button {
      width: 100%;
      padding: 10px;
      background: #232f3e;
      color: #fff;
      border: none;
      border-radius: 4px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
    }
    .hidden { display: none; }
  </style>
</head>
<body>

  <!-- 登录验证 -->
  <div id="auth-section" class="auth-section">
    <h1>🔐 T2 Checker Admin</h1>
    <p style="color:#666; font-size:13px; margin-top:8px;">请输入管理员密钥</p>
    <input type="password" id="admin-key-input" placeholder="Admin Key">
    <button onclick="authenticate()">登录</button>
    <p id="auth-error" style="color:#d13212; font-size:12px; margin-top:8px;" class="hidden">密钥错误，请重试</p>
  </div>

  <!-- 主面板（登录后显示） -->
  <div id="main-panel" class="hidden">
    <h1>📊 T2 Checker - 使用数据管理</h1>

    <!-- 筛选控制 -->
    <div class="admin-controls">
      <div class="field">
        <label>年份</label>
        <select id="filter-year">
          <option value="2026">2026</option>
          <option value="2025">2025</option>
        </select>
      </div>
      <div class="field">
        <label>月份</label>
        <select id="filter-month">
          <option value="01">01</option>
          <option value="02">02</option>
          <option value="03">03</option>
          <option value="04">04</option>
          <option value="05">05</option>
          <option value="06">06</option>
          <option value="07">07</option>
          <option value="08" selected>08</option>
          <option value="09">09</option>
          <option value="10">10</option>
          <option value="11">11</option>
          <option value="12">12</option>
        </select>
      </div>
      <div class="field">
        <label>用户 (可选)</label>
        <input type="text" id="filter-user" placeholder="alias">
      </div>
      <button onclick="fetchData()">查询</button>
      <button onclick="exportCSV()" style="background:#232f3e;">导出 CSV</button>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-value" id="stat-total">-</div>
        <div class="stat-label">总使用次数</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" id="stat-users">-</div>
        <div class="stat-label">独立用户数</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" id="stat-eligible">-</div>
        <div class="stat-label">满足条件</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" id="stat-not-eligible">-</div>
        <div class="stat-label">不满足条件</div>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="data-table-wrapper">
      <h3>使用记录明细</h3>
      <table>
        <thead>
          <tr>
            <th>时间</th>
            <th>用户</th>
            <th>操作类型</th>
            <th>Booking ID</th>
            <th>Issue Type</th>
            <th>结果</th>
          </tr>
        </thead>
        <tbody id="data-tbody">
          <tr><td colspan="6" class="empty-state">请点击"查询"加载数据</td></tr>
        </tbody>
      </table>
    </div>
  </div>

  <script>
    const API_BASE = 'https://t2-checker-log.vercel.app';
    let adminKey = '';
    let currentLogs = [];

    // 登录验证
    async function authenticate() {
      const key = document.getElementById('admin-key-input').value.trim();
      if (!key) return;

      try {
        const res = await fetch(`${API_BASE}/api/admin?year=2026&month=08`, {
          headers: { 'Authorization': `Bearer ${key}` }
        });

        if (res.ok || res.status === 404) {
          // 404 也算成功（只是没数据）
          adminKey = key;
          document.getElementById('auth-section').classList.add('hidden');
          document.getElementById('main-panel').classList.remove('hidden');
          fetchData();
        } else {
          document.getElementById('auth-error').classList.remove('hidden');
        }
      } catch (e) {
        document.getElementById('auth-error').classList.remove('hidden');
      }
    }

    // 查询数据
    async function fetchData() {
      const year = document.getElementById('filter-year').value;
      const month = document.getElementById('filter-month').value;
      const user = document.getElementById('filter-user').value.trim();

      let url = `${API_BASE}/api/admin?year=${year}&month=${month}`;
      if (user) url += `&user_alias=${user}`;

      try {
        const res = await fetch(url, {
          headers: { 'Authorization': `Bearer ${adminKey}` }
        });

        if (res.status === 404) {
          renderEmpty('该时间段暂无数据');
          return;
        }

        const data = await res.json();
        currentLogs = data.logs || [];
        renderStats(data.summary, currentLogs);
        renderTable(currentLogs);
      } catch (e) {
        renderEmpty('查询失败: ' + e.message);
      }
    }

    // 渲染统计
    function renderStats(summary, logs) {
      document.getElementById('stat-total').textContent = summary.total || 0;
      document.getElementById('stat-users').textContent = summary.unique_users || 0;

      const eligible = logs.filter(l => l.details?.result === 'eligible').length;
      const notEligible = logs.filter(l => l.details?.result === 'not_eligible').length;
      document.getElementById('stat-eligible').textContent = eligible;
      document.getElementById('stat-not-eligible').textContent = notEligible;
    }

    // 渲染表格
    function renderTable(logs) {
      const tbody = document.getElementById('data-tbody');

      if (!logs.length) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-state">暂无数据</td></tr>';
        return;
      }

      tbody.innerHTML = logs.map(log => {
        const time = new Date(log.client_timestamp || log.server_timestamp).toLocaleString('zh-CN');
        const result = log.details?.result || '-';
        const badgeClass = result === 'eligible' ? 'eligible' : result === 'not_eligible' ? 'not-eligible' : 'needs-review';

        return `<tr>
          <td>${time}</td>
          <td>${log.user_alias}</td>
          <td>${log.action_type}</td>
          <td>${log.details?.booking_id || '-'}</td>
          <td>${log.details?.issue_type || '-'}</td>
          <td>${result !== '-' ? `<span class="badge ${badgeClass}">${result}</span>` : '-'}</td>
        </tr>`;
      }).join('');
    }

    // 空状态
    function renderEmpty(msg) {
      document.getElementById('stat-total').textContent = '0';
      document.getElementById('stat-users').textContent = '0';
      document.getElementById('stat-eligible').textContent = '0';
      document.getElementById('stat-not-eligible').textContent = '0';
      document.getElementById('data-tbody').innerHTML = `<tr><td colspan="6" class="empty-state">${msg}</td></tr>`;
    }

    // 导出 CSV
    function exportCSV() {
      if (!currentLogs.length) { alert('没有数据可导出'); return; }

      const headers = ['时间', '用户', '操作类型', 'Booking ID', 'Issue Type', '结果', '耗时(ms)'];
      const rows = currentLogs.map(log => [
        log.client_timestamp || log.server_timestamp,
        log.user_alias,
        log.action_type,
        log.details?.booking_id || '',
        log.details?.issue_type || '',
        log.details?.result || '',
        log.details?.duration_ms || ''
      ]);

      const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `t2_checker_logs_${document.getElementById('filter-year').value}_${document.getElementById('filter-month').value}.csv`;
      a.click();
    }

    // Enter 键登录
    document.getElementById('admin-key-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') authenticate();
    });
  </script>
</body>
</html>

