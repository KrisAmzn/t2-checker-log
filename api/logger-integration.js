
// logger-integration.js - 展示如何在检查流程中集成 logger
// 这个文件展示集成方式，最终合并到你的主逻辑中

// ========== 初始化 ==========
// 在 content_script 加载时初始化 logger
(async function initLogger() {
  await t2Logger.init();
  t2Logger.logPanelOpen();
})();

// ========== 集成到检查流程 ==========

/**
 * 完整的检查流程（集成了数据上报）
 * 替换你现有的检查逻辑入口
 */
async function startCheck() {
  const issueType = document.getElementById('t2-issue-type').value;
  const bookingId = getBookingIdFromPage(); // 从 OC 页面提取 Booking ID

  if (!issueType) {
    alert('请选择 Issue Type');
    return;
  }

  // 1. 记录：开始检查
  t2Logger.logCheckStart(issueType, bookingId);
  const startTime = Date.now();

  // 2. 执行检查（你的现有逻辑）
  const results = await performCheck(issueType, bookingId);

  // 3. 渲染结果到 UI
  renderResults(results);

  // 4. 判断最终结果
  const hasFail = results.some(r => r.status === 'fail');
  const hasWarn = results.some(r => r.status === 'warn');
  let finalResult;
  if (hasFail) finalResult = 'not_eligible';
  else if (hasWarn) finalResult = 'needs_review';
  else finalResult = 'eligible';

  // 5. 记录：检查完成
  const durationMs = Date.now() - startTime;
  t2Logger.logCheckComplete(issueType, bookingId, finalResult, results, durationMs);

  // 6. 渲染汇总 + 强行升级按钮
  renderSummaryWithForce(results);
}

// ========== 集成到强行升级 ==========

/**
 * 修改后的强行升级确认逻辑（加入数据上报）
 */
function onForceConfirm() {
  const reason = document.getElementById('t2-force-reason').value;
  const comment = document.getElementById('t2-force-comment').value.trim();
  const issueType = document.getElementById('t2-issue-type').value;
  const bookingId = getBookingIdFromPage();

  // 记录强行升级
  t2Logger.logForceEscalation(issueType, bookingId, reason, comment);

  // 关闭弹窗，显示成功
  document.getElementById('t2-modal-overlay').classList.add('hidden');
  showForceSuccess();
}

// ========== 面板关闭时记录 ==========

document.getElementById('t2-close').addEventListener('click', () => {
  t2Logger.logPanelClose();
  document.getElementById('t2-checker-panel').style.display = 'none';
});

// ========== 辅助函数 ==========

/**
 * 从 OC 页面提取当前 Booking ID
 * 根据 OC 页面实际 DOM 结构调整
 */
function getBookingIdFromPage() {
  // 根据 OC Booking 页面的实际结构来提取
  // 以下是几种可能的方式：
  const el = document.querySelector('[data-booking-id]')
    || document.querySelector('.booking-id-value')
    || document.querySelector('#bookingId');

  if (el) return el.textContent.trim() || el.getAttribute('data-booking-id');

  // 或者从 URL 中提取
  const urlMatch = window.location.href.match(/booking[_-]?[Ii]d=([^&]+)/);
  if (urlMatch) return urlMatch[1];

  return 'unknown';
}

