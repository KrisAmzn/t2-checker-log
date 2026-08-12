
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>T2 Checker - Admin Dashboard</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, 'Amazon Ember', Arial, sans-serif; background: #f5f7fa; min-height: 100vh; }
    
    .login-container {
      display: flex; align-items: center; justify-content: center;
      min-height: 100vh; padding: 20px;
    }
    .login-box {
      background: #fff; padding: 40px; border-radius: 8px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.1); width: 100%; max-width: 360px;
    }
    .login-box h1 { font-size: 18px; color: #232f3e; margin-bottom: 20px; text-align: center; }
    .login-box input {
      width: 100%; padding: 10px 12px; border: 1px solid #ccc;
      border-radius: 4px; font-size: 14px; margin-bottom: 12px;
    }
    .login-box button {
      width: 100%; padding: 10px; background: #ff9900; color: #fff;
      border: none; border-radius: 4px; font-size: 14px; font-weight: 700; cursor: pointer;
    }
    .login-box button:hover { background: #e88b00; }
    .login-error { color: #d13212; font-size: 12px; margin-top: 8px; display: none; }

    /* Dashboard */
    .dashboard { display: none; padding: 20px; max-width: 1200px; margin: 0 auto; }
    .dash-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #e8e8e8;
    }
    .dash-header h1 { font-size: 20px; color: #232f3e; }
    .dash-header .logout { font-size: 12px; color: #666; cursor: pointer; text-decoration: underline; }

    /* 统计卡片 */
    .stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-bottom: 20px; }
    .stat-card {
      background: #fff; padding: 16px; border-radius: 6px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.08); text-align: center;
    }
    .stat-card .stat-value { font-size: 24px; font-weight: 700; color: #0066c0; }
    .stat-card .stat-label { font-size: 11px; color: #666; margin-top: 4px; }

    /* 控制栏 */
    .controls {
      display: flex; gap: 10px; align-items: center; flex-wrap: wrap;
      margin-bottom: 16px; padding: 12px; background: #fff;
      border-radius: 6px; box-shadow: 0 1px 4px rgba(0,0,0,0.08);
    }
    .controls select, .controls input {
      padding: 6px 10px; border: 1px solid #ccc; border-radius: 4px; font-size: 12px;
    }
    .controls button {
      padding: 6px 14px; border-radius: 4px; font-size: 12px;
      font-weight: 600; cursor: pointer; border: none;
    }
    .btn-primary { background: #0066c0; color: #fff; }
    .btn-primary:hover { background: #004d99; }
    .btn-export { background: #28a745; color: #fff; }
    .btn-export:hover { background: #218838; }
    .btn-refresh { background: #6c757d; color: #fff; }
    .btn-refresh:hover { background: #5a6268; }

    /* 数据表格 */
    .table-container { background: #fff; border-radius: 6px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th { background: #232f3e; color: #fff; padding: 10px 8px; text-align: left; white-space: nowrap; }
    td { padding: 8px; border-bottom: 1px solid #f0f0f0; }
    tr:hover { background: #f8f9fa; }
    .badge {
      display: inline-block; padding: 2px 6px; border-radius: 3px;
      font-size: 10px; font-weight: 600;
    }
    .badge-pass { background: #d4edda; color: #155724; }
    .badge-reject { background: #f8d7da; color: #721c24; }
    .badge-error { background: #f5c6cb; color: #721c24; }
    .badge-warn { background: #fff3cd; color: #856404; }
    .badge-other { background: #e2e3e5; color: #383d41; }
    .no-data { text-align: center; padding: 40px; color: #999; }
  </style>
</head>
<body>

<!-- 登录页 -->
<div class="login-container" id="login-page">
  <div class="login-box">
    <h1>T2 Checker Admin</h1>
    <input type="password" id="admin-key" placeholder="请输入管理密码">
    <button onclick="doLogin()">登录</button>
    <div class="login-error" id="login-error">密码错误，请重试</div>
  </div>
</div>

<!-- Dashboard -->
<div class="dashboard" id="dashboard">
  <div class="dash-header">
    <h1>T2 Escalation Checker - 使用数据</h1>
    <span class="logout" onclick="doLogout()">退出登录</span>
  </div>

  <!-- 统计卡片 -->
  <div class="stats-row" id="stats-row"></div>

  <!-- 控制栏 -->
  <div class="controls">
    <select id="filter-year"></select>
    <select id="filter-month">
      <option value="01">1月</option><option value="02">2月</option>
      <option value="03">3月</option><option value="04">4月</option>
      <option value="05">5月</option><option value="06">6月</option>
      <option value="07">7月</option><option value="08">8月</option>
      <option value="09">9月</option><option value="10">10月</option>
      <option value="11">11月</option><option value="12">12月</option>
    </select>
    <select id="filter-action">
      <option value="">全部操作</option>
      <option value="check">check</option>
      <option value="check_complete">check_complete</option>
      <option value="check_start">check_start</option>
      <option value="force_escalation">force_escalation</option>
      <option value="panel_open">panel_open</option>
    </select>
    <input type="text" id="filter-user" placeholder="筛选用户...">
    <button class="btn-primary" onclick="loadData()">查询</button>
    <button class="btn-refresh" onclick="loadData()">刷新</button>
    <button class="btn-export" onclick="exportCSV()">导出 CSV</button>
  </div>

  <!-- 数据表格 -->
  <div class="table-container">
    <table id="data-table">
      <thead>
        <tr>
          <th>日期</th><th>时间(UTC)</th><th>用户</th><th>操作</th>
          <th>Booking ID</th><th>Issue Type</th><th>结果</th>
          <th>原因</th><th>Steps</th><th>耗时(ms)</th>
        </tr>
      </thead>
      <tbody id="table-body"></tbody>
    </table>
    <div class="no-data" id="no-data" style="display:none;">暂无数据</div>
  </div>
</div>

<script>
  let adminKey = '';
  let currentData = [];

  // 初始化年份和月份
  (function() {
    const now = new Date();
    const yearSelect = document.getElementById('filter-year');
    for (let y = now.getFullYear(); y >= 2026; y--) {
      yearSelect.innerHTML += '<option value="' + y + '">' + y + '年</option>';
    }
    document.getElementById('filter-month').value = String(now.getMonth() + 1).padStart(2, '0');
  })();

  function doLogin() {
    adminKey = document.getElementById('admin-key').value.trim();
    if (!adminKey) return;

    // 验证密码（尝试请求API）
    fetch('/api/export?key=' + encodeURIComponent(adminKey) + '&format=json')
      .then(r => {
        if (r.status === 401) {
          document.getElementById('login-error').style.display = 'block';
          return null;
        }
        return r.json();
      })
      .then(data => {
        if (data && !data.error) {
          document.getElementById('login-page').style.display = 'none';
          document.getElementById('dashboard').style.display = 'block';
          currentData = data.logs || [];
          renderTable(currentData);
          renderStats(currentData);
        }
      })
      .catch(() => {
        document.getElementById('login-error').style.display = 'block';
      });
  }

  function doLogout() {
    adminKey = '';
    currentData = [];
    document.getElementById('login-page').style.display = '';
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('admin-key').value = '';
  }

  function loadData() {
    const year = document.getElementById('filter-year').value;
    const month = document.getElementById('filter-month').value;
    const action = document.getElementById('filter-action').value;
    const user = document.getElementById('filter-user').value.trim();

    let url = '/api/export?key=' + encodeURIComponent(adminKey) +
      '&year=' + year + '&month=' + month;
    if (action) url += '&action_type=' + action;
    if (user) url += '&user=' + user;

    fetch(url)
      .then(r => r.json())
      .then(data => {
        if (data.error) { alert('Error: ' + data.error); return; }
        currentData = data.logs || [];
        renderTable(currentData);
        renderStats(currentData);
      })
      .catch(e => alert('请求失败: ' + e.message));
  }

  function renderStats(logs) {
    const totalChecks = logs.filter(l => ['check', 'check_complete'].includes(l.action_type)).length;
    const uniqueUsers = [...new Set(logs.map(l => l.user_alias).filter(u => u && u !== 'unknown'))].length;
    const forceEsc = logs.filter(l => l.action_type === 'force_escalation').length;
    const errors = logs.filter(l => l.details && l.details.result === 'error').length;
    const rejects = logs.filter(l => l.details && l.details.result === 'REJECT').length;

    document.getElementById('stats-row').innerHTML = [
      statCard(logs.length, '总记录数'),
      statCard(totalChecks, '检查次数'),
      statCard(uniqueUsers, '活跃用户'),
      statCard(forceEsc, '坚持升级'),
      statCard(rejects, '不满足条件'),
      statCard(errors, '错误次数')
    ].join('');
  }

  function statCard(value, label) {
    return '<div class="stat-card"><div class="stat-value">' + value + '</div><div class="stat-label">' + label + '</div></div>';
  }

  function renderTable(logs) {
    const tbody = document.getElementById('table-body');
    const noData = document.getElementById('no-data');

    if (!logs.length) {
      tbody.innerHTML = '';
      noData.style.display = 'block';
      return;
    }
    noData.style.display = 'none';

    tbody.innerHTML = logs.map(log => {
      const d = log.details || {};
      const ts = log.client_timestamp || '';
      const result = d.result || '';
      let badgeClass = 'badge-other';
      if (result === 'REJECT') badgeClass = 'badge-reject';
      else if (result === 'error') badgeClass = 'badge-error';
      else if (result === 'PASS' || result === 'eligible') badgeClass = 'badge-pass';
      else if (result === 'needs_review') badgeClass = 'badge-warn';

      return '<tr>' +
        '<td>' + ts.substring(0, 10) + '</td>' +
        '<td>' + ts.substring(11, 19) + '</td>' +
        '<td>' + (log.user_alias || '') + '</td>' +
        '<td>' + (log.action_type || '') + '</td>' +
        '<td>' + (d.booking_id || '') + '</td>' +
        '<td>' + (d.issue_type || '') + '</td>' +
        '<td><span class="badge ' + badgeClass + '">' + result + '</span></td>' +
        '<td>' + (d.reason || '') + '</td>' +
        '<td>' + (d.steps_count || (d.steps ? d.steps.length : '') || '') + '</td>' +
        '<td>' + (d.duration_ms || '') + '</td>' +
        '</tr>';
    }).join('');
  }

  function exportCSV() {
    const year = document.getElementById('filter-year').value;
    const month = document.getElementById('filter-month').value;
    const action = document.getElementById('filter-action').value;
    const user = document.getElementById('filter-user').value.trim();

    let url = '/api/export?key=' + encodeURIComponent(adminKey) +
      '&year=' + year + '&month=' + month + '&format=csv';
    if (action) url += '&action_type=' + action;
    if (user) url += '&user=' + user;

    // 直接打开下载
    window.open(url, '_blank');
  }

  // 回车登录
  document.getElementById('admin-key').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') doLogin();
  });
</script>
</body>
</html>

