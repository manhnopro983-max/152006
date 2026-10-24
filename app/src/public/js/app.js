/* ============================================================
   Expense Tracker — Frontend Application
   ============================================================ */

const App = {
  // ---------- State ----------
  currentTab: 'dashboard',
  categories: [],
  charts: {},
  pagination: { limit: 20, offset: 0, total: 0 },

  // ---------- Initialization ----------
  init() {
    this.setupNavigation();
    this.setupMobileMenu();
    this.setDefaultDates();
    this.loadCategories().then(() => {
      this.switchTab('dashboard');
    });
  },

  // ---------- Navigation ----------
  setupNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const tab = item.dataset.tab;
        if (tab) this.switchTab(tab);
      });
    });
  },

  setupMobileMenu() {
    const toggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    if (toggle) {
      toggle.addEventListener('click', () => sidebar.classList.toggle('open'));
    }
    // Close sidebar on nav click (mobile)
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        if (window.innerWidth <= 768) sidebar.classList.remove('open');
      });
    });
  },

  switchTab(tab) {
    this.currentTab = tab;
    // Update nav
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const navEl = document.querySelector(`[data-tab="${tab}"]`);
    if (navEl) navEl.classList.add('active');
    // Show/hide sections
    document.querySelectorAll('.tab-content').forEach(s => s.classList.remove('active'));
    const section = document.getElementById(tab);
    if (section) section.classList.add('active');
    // Load data
    switch (tab) {
      case 'dashboard':    this.loadDashboard(); break;
      case 'transactions': this.loadTransactions(); break;
      case 'categories':   this.renderCategories(); break;
      case 'reports':      this.loadReports(); break;
    }
  },

  // ---------- Date Helpers ----------
  setDefaultDates() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const firstDay = `${year}-${month}-01`;
    const lastDay = new Date(year, now.getMonth() + 1, 0);
    const lastDayStr = `${year}-${month}-${String(lastDay.getDate()).padStart(2, '0')}`;

    const dashMonth = document.getElementById('dashboard-month');
    if (dashMonth) dashMonth.value = `${year}-${month}`;

    const filterStart = document.getElementById('filter-start');
    const filterEnd = document.getElementById('filter-end');
    if (filterStart) filterStart.value = firstDay;
    if (filterEnd) filterEnd.value = lastDayStr;

    const reportStart = document.getElementById('report-start');
    const reportEnd = document.getElementById('report-end');
    if (reportStart) reportStart.value = firstDay;
    if (reportEnd) reportEnd.value = lastDayStr;

    // Listen for dashboard month change
    if (dashMonth) {
      dashMonth.addEventListener('change', () => this.loadDashboard());
    }
  },

  getDashboardDateRange() {
    const monthVal = document.getElementById('dashboard-month')?.value;
    if (!monthVal) return {};
    const [y, m] = monthVal.split('-');
    const startDate = `${y}-${m}-01`;
    const lastDay = new Date(parseInt(y), parseInt(m), 0).getDate();
    const endDate = `${y}-${m}-${String(lastDay).padStart(2, '0')}`;
    return { startDate, endDate };
  },

  // ---------- Format Helpers ----------
  formatCurrency(amount) {
    const num = Number(amount);
    return num.toLocaleString('vi-VN') + ' ₫';
  },

  formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  },

  formatMonthLabel(monthStr) {
    const [y, m] = monthStr.split('-');
    return `T${parseInt(m)}/${y}`;
  },

  // ---------- API Helpers ----------
  async api(url, options = {}) {
    try {
      const res = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi không xác định');
      return data;
    } catch (err) {
      this.showToast(err.message, 'error');
      throw err;
    }
  },

  // ---------- Categories ----------
  async loadCategories() {
    try {
      this.categories = await this.api('/api/categories');
      this.populateCategoryFilters();
    } catch (e) { /* already toasted */ }
  },

  populateCategoryFilters() {
    const selects = [
      document.getElementById('filter-category'),
    ];
    selects.forEach(sel => {
      if (!sel) return;
      const val = sel.value;
      sel.innerHTML = '<option value="">Tất cả</option>';
      this.categories.forEach(c => {
        sel.innerHTML += `<option value="${c.id}">${c.icon} ${c.name} (${c.type === 'income' ? 'Thu' : 'Chi'})</option>`;
      });
      sel.value = val;
    });
  },

  renderCategories() {
    const incomeGrid = document.getElementById('income-categories');
    const expenseGrid = document.getElementById('expense-categories');
    if (!incomeGrid || !expenseGrid) return;

    const incomeCategories = this.categories.filter(c => c.type === 'income');
    const expenseCategories = this.categories.filter(c => c.type === 'expense');

    incomeGrid.innerHTML = incomeCategories.length === 0
      ? '<p class="empty-state">Chưa có danh mục thu</p>'
      : incomeCategories.map(c => this.renderCategoryCard(c)).join('');

    expenseGrid.innerHTML = expenseCategories.length === 0
      ? '<p class="empty-state">Chưa có danh mục chi</p>'
      : expenseCategories.map(c => this.renderCategoryCard(c)).join('');
  },

  renderCategoryCard(cat) {
    return `
      <div class="category-card ${cat.is_active ? '' : 'inactive'}">
        <div class="category-icon" style="background: ${cat.color}22; color: ${cat.color}">
          ${cat.icon}
        </div>
        <div class="category-info">
          <div class="category-name">${this.escapeHtml(cat.name)}</div>
          <div class="category-type">${cat.type === 'income' ? 'Thu nhập' : 'Chi tiêu'}${cat.is_active ? '' : ' • Đã ẩn'}</div>
        </div>
        <div class="category-actions">
          <button class="btn btn-sm btn-edit" onclick="App.showCategoryForm(${cat.id})">✏️</button>
          <button class="btn btn-sm btn-danger" onclick="App.deleteCategory(${cat.id})">🗑️</button>
        </div>
      </div>
    `;
  },

  showCategoryForm(id = null) {
    const cat = id ? this.categories.find(c => c.id === id) : null;
    const title = cat ? 'Sửa danh mục' : 'Thêm danh mục';
    const colors = ['#10b981','#34d399','#ef4444','#f97316','#f59e0b','#eab308','#a855f7','#ec4899','#3b82f6','#6366f1','#14b8a6','#8b5cf6'];

    const html = `
      <form id="category-form" onsubmit="App.saveCategory(event, ${id})">
        <div class="form-group">
          <label>Tên danh mục *</label>
          <input type="text" class="input-field" id="cat-name" value="${cat ? this.escapeHtml(cat.name) : ''}" required maxlength="100" placeholder="VD: Ăn uống">
        </div>
        ${!cat ? `
        <div class="form-group">
          <label>Loại *</label>
          <select class="input-field" id="cat-type" required>
            <option value="expense">Chi tiêu</option>
            <option value="income">Thu nhập</option>
          </select>
        </div>
        ` : ''}
        <div class="form-group">
          <label>Biểu tượng</label>
          <input type="text" class="input-field" id="cat-icon" value="${cat ? cat.icon : '📁'}" maxlength="10" placeholder="📁">
        </div>
        <div class="form-group">
          <label>Màu sắc</label>
          <div class="color-options" id="color-options">
            ${colors.map(c => `
              <div class="color-option ${cat && cat.color === c ? 'selected' : (!cat && c === '#6366f1' ? 'selected' : '')}"
                   style="background: ${c}" data-color="${c}"
                   onclick="App.selectColor(this)"></div>
            `).join('')}
          </div>
          <input type="hidden" id="cat-color" value="${cat ? cat.color : '#6366f1'}">
        </div>
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" onclick="App.hideModal()">Hủy</button>
          <button type="submit" class="btn btn-primary">${cat ? 'Cập nhật' : 'Tạo mới'}</button>
        </div>
      </form>
    `;

    this.showModal(title, html);
  },

  selectColor(el) {
    document.querySelectorAll('.color-option').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
    document.getElementById('cat-color').value = el.dataset.color;
  },

  async saveCategory(e, id) {
    e.preventDefault();
    const body = {
      name: document.getElementById('cat-name').value,
      icon: document.getElementById('cat-icon').value || '📁',
      color: document.getElementById('cat-color').value,
    };
    if (!id) body.type = document.getElementById('cat-type').value;

    try {
      if (id) {
        await this.api(`/api/categories/${id}`, { method: 'PUT', body: JSON.stringify(body) });
        this.showToast('Đã cập nhật danh mục', 'success');
      } else {
        await this.api('/api/categories', { method: 'POST', body: JSON.stringify(body) });
        this.showToast('Đã tạo danh mục mới', 'success');
      }
      this.hideModal();
      await this.loadCategories();
      this.renderCategories();
    } catch (e) { /* already toasted */ }
  },

  async deleteCategory(id) {
    const cat = this.categories.find(c => c.id === id);
    if (!confirm(`Bạn có chắc muốn xóa danh mục "${cat?.name}"?`)) return;
    try {
      const result = await this.api(`/api/categories/${id}`, { method: 'DELETE' });
      this.showToast(result.message, 'success');
      await this.loadCategories();
      this.renderCategories();
    } catch (e) { /* already toasted */ }
  },

  // ---------- Dashboard ----------
  async loadDashboard() {
    const { startDate, endDate } = this.getDashboardDateRange();
    const params = new URLSearchParams();
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);

    try {
      // Load summary
      const summary = await this.api(`/api/reports/summary?${params}`);
      document.getElementById('stat-income').textContent = this.formatCurrency(summary.total_income);
      document.getElementById('stat-expense').textContent = this.formatCurrency(summary.total_expense);
      document.getElementById('stat-balance').textContent = this.formatCurrency(summary.balance);
      document.getElementById('stat-count').textContent = summary.transaction_count;

      // Color the balance
      const balEl = document.getElementById('stat-balance');
      balEl.style.color = Number(summary.balance) >= 0 ? 'var(--income)' : 'var(--expense)';

      // Load charts
      this.loadMonthlyChart();
      this.loadCategoryChart(startDate, endDate);

      // Load recent transactions
      this.loadRecentTransactions(startDate, endDate);
    } catch (e) { /* already toasted */ }
  },

  async loadMonthlyChart() {
    try {
      const data = await this.api('/api/reports/monthly?months=6');
      const ctx = document.getElementById('monthly-chart');
      if (!ctx) return;

      if (this.charts.monthly) this.charts.monthly.destroy();

      this.charts.monthly = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: data.map(d => this.formatMonthLabel(d.month)),
          datasets: [
            {
              label: 'Thu nhập',
              data: data.map(d => Number(d.income)),
              backgroundColor: 'rgba(16, 185, 129, 0.7)',
              borderColor: '#10b981',
              borderWidth: 2,
              borderRadius: 6,
              borderSkipped: false,
            },
            {
              label: 'Chi tiêu',
              data: data.map(d => Number(d.expense)),
              backgroundColor: 'rgba(239, 68, 68, 0.7)',
              borderColor: '#ef4444',
              borderWidth: 2,
              borderRadius: 6,
              borderSkipped: false,
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { labels: { color: '#94a3b8', font: { family: 'Inter' } } },
            tooltip: {
              callbacks: {
                label: (ctx) => `${ctx.dataset.label}: ${App.formatCurrency(ctx.raw)}`
              }
            }
          },
          scales: {
            x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(45,53,85,0.4)' } },
            y: {
              ticks: {
                color: '#94a3b8',
                callback: (v) => (v / 1000000).toFixed(0) + 'M'
              },
              grid: { color: 'rgba(45,53,85,0.4)' }
            }
          }
        }
      });
    } catch (e) { /* already toasted */ }
  },

  async loadCategoryChart(startDate, endDate) {
    try {
      const params = new URLSearchParams({ type: 'expense' });
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);
      const data = await this.api(`/api/reports/by-category?${params}`);

      const ctx = document.getElementById('category-chart');
      if (!ctx) return;

      if (this.charts.category) this.charts.category.destroy();

      if (data.length === 0) {
        this.charts.category = null;
        return;
      }

      this.charts.category = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: data.map(d => `${d.category_icon} ${d.category_name}`),
          datasets: [{
            data: data.map(d => Number(d.total)),
            backgroundColor: data.map(d => d.category_color || '#6366f1'),
            borderColor: '#1a1f35',
            borderWidth: 3,
            hoverOffset: 8,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '55%',
          plugins: {
            legend: {
              position: 'right',
              labels: { color: '#94a3b8', font: { family: 'Inter', size: 12 }, padding: 12 }
            },
            tooltip: {
              callbacks: {
                label: (ctx) => {
                  const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                  const pct = ((ctx.raw / total) * 100).toFixed(1);
                  return `${ctx.label}: ${App.formatCurrency(ctx.raw)} (${pct}%)`;
                }
              }
            }
          }
        }
      });
    } catch (e) { /* already toasted */ }
  },

  async loadRecentTransactions(startDate, endDate) {
    try {
      const params = new URLSearchParams({ limit: '5' });
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);
      const { data } = await this.api(`/api/transactions?${params}`);

      const container = document.getElementById('recent-transactions');
      if (!container) return;

      if (data.length === 0) {
        container.innerHTML = '<p class="empty-state">Chưa có giao dịch trong tháng này</p>';
        return;
      }

      container.innerHTML = `
        <table class="data-table">
          <thead>
            <tr><th>Ngày</th><th>Loại</th><th>Danh mục</th><th>Số tiền</th><th>Ghi chú</th></tr>
          </thead>
          <tbody>
            ${data.map(tx => `
              <tr>
                <td>${this.formatDate(tx.occurred_on)}</td>
                <td><span class="badge badge-${tx.type}">${tx.type === 'income' ? '📈 Thu' : '📉 Chi'}</span></td>
                <td>${tx.category_icon || ''} ${this.escapeHtml(tx.category_name)}</td>
                <td class="amount-${tx.type}">${tx.type === 'income' ? '+' : '-'}${this.formatCurrency(tx.amount)}</td>
                <td>${this.escapeHtml(tx.note || '—')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } catch (e) { /* already toasted */ }
  },

  // ---------- Transactions ----------
  async loadTransactions() {
    const params = new URLSearchParams();
    const startDate = document.getElementById('filter-start')?.value;
    const endDate = document.getElementById('filter-end')?.value;
    const type = document.getElementById('filter-type')?.value;
    const categoryId = document.getElementById('filter-category')?.value;

    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    if (type) params.set('type', type);
    if (categoryId) params.set('categoryId', categoryId);
    params.set('limit', this.pagination.limit);
    params.set('offset', this.pagination.offset);

    try {
      const result = await this.api(`/api/transactions?${params}`);
      this.pagination.total = result.total;
      this.renderTransactionsTable(result.data);
      this.renderPagination();
    } catch (e) { /* already toasted */ }
  },

  renderTransactionsTable(transactions) {
    const tbody = document.getElementById('transactions-tbody');
    if (!tbody) return;

    if (transactions.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="empty-state">Không có giao dịch nào</td></tr>';
      return;
    }

    tbody.innerHTML = transactions.map(tx => `
      <tr>
        <td>${this.formatDate(tx.occurred_on)}</td>
        <td><span class="badge badge-${tx.type}">${tx.type === 'income' ? '📈 Thu' : '📉 Chi'}</span></td>
        <td>${tx.category_icon || ''} ${this.escapeHtml(tx.category_name)}</td>
        <td class="amount-${tx.type}">${tx.type === 'income' ? '+' : '-'}${this.formatCurrency(tx.amount)}</td>
        <td>${this.escapeHtml(tx.note || '—')}</td>
        <td class="actions">
          <button class="btn btn-sm btn-edit" onclick="App.showTransactionForm(${tx.id})">✏️</button>
          <button class="btn btn-sm btn-danger" onclick="App.deleteTransaction(${tx.id})">🗑️</button>
        </td>
      </tr>
    `).join('');
  },

  renderPagination() {
    const container = document.getElementById('transactions-pagination');
    if (!container) return;

    const { limit, offset, total } = this.pagination;
    const currentPage = Math.floor(offset / limit) + 1;
    const totalPages = Math.ceil(total / limit);

    if (totalPages <= 1) {
      container.innerHTML = `<span class="page-info">Tổng: ${total} giao dịch</span>`;
      return;
    }

    container.innerHTML = `
      <button ${currentPage <= 1 ? 'disabled' : ''} onclick="App.goToPage(${currentPage - 1})">← Trước</button>
      <span class="page-info">Trang ${currentPage}/${totalPages} (${total} giao dịch)</span>
      <button ${currentPage >= totalPages ? 'disabled' : ''} onclick="App.goToPage(${currentPage + 1})">Sau →</button>
    `;
  },

  goToPage(page) {
    this.pagination.offset = (page - 1) * this.pagination.limit;
    this.loadTransactions();
  },

  showTransactionForm(id = null) {
    const title = id ? 'Sửa giao dịch' : 'Thêm giao dịch';

    const incomeCategories = this.categories.filter(c => c.type === 'income' && c.is_active);
    const expenseCategories = this.categories.filter(c => c.type === 'expense' && c.is_active);

    const html = `
      <form id="transaction-form" onsubmit="App.saveTransaction(event, ${id})">
        <div class="form-row">
          <div class="form-group">
            <label>Loại giao dịch *</label>
            <select class="input-field" id="tx-type" required onchange="App.updateCategoryOptions()">
              <option value="expense">Chi tiêu</option>
              <option value="income">Thu nhập</option>
            </select>
          </div>
          <div class="form-group">
            <label>Danh mục *</label>
            <select class="input-field" id="tx-category" required>
              ${expenseCategories.map(c => `<option value="${c.id}">${c.icon} ${c.name}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Số tiền (VND) *</label>
            <input type="number" class="input-field" id="tx-amount" required min="1" max="999999999999" placeholder="VD: 500000">
          </div>
          <div class="form-group">
            <label>Ngày *</label>
            <input type="date" class="input-field" id="tx-date" required value="${new Date().toISOString().split('T')[0]}">
          </div>
        </div>
        <div class="form-group">
          <label>Ghi chú</label>
          <textarea class="input-field" id="tx-note" maxlength="500" placeholder="Mô tả giao dịch..."></textarea>
        </div>
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" onclick="App.hideModal()">Hủy</button>
          <button type="submit" class="btn btn-primary">${id ? 'Cập nhật' : 'Thêm'}</button>
        </div>
      </form>
    `;

    this.showModal(title, html);

    // If editing, load existing data
    if (id) this.loadTransactionForEdit(id);
  },

  async loadTransactionForEdit(id) {
    try {
      const tx = await this.api(`/api/transactions/${id}`);
      document.getElementById('tx-type').value = tx.type;
      this.updateCategoryOptions();
      document.getElementById('tx-category').value = tx.category_id;
      document.getElementById('tx-amount').value = tx.amount;
      document.getElementById('tx-date').value = tx.occurred_on.split('T')[0];
      document.getElementById('tx-note').value = tx.note || '';
    } catch (e) { /* already toasted */ }
  },

  updateCategoryOptions() {
    const type = document.getElementById('tx-type').value;
    const select = document.getElementById('tx-category');
    const filtered = this.categories.filter(c => c.type === type && c.is_active);
    select.innerHTML = filtered.map(c => `<option value="${c.id}">${c.icon} ${c.name}</option>`).join('');
    if (filtered.length === 0) {
      select.innerHTML = '<option value="">Chưa có danh mục phù hợp</option>';
    }
  },

  async saveTransaction(e, id) {
    e.preventDefault();
    const body = {
      type: document.getElementById('tx-type').value,
      category_id: document.getElementById('tx-category').value,
      amount: document.getElementById('tx-amount').value,
      occurred_on: document.getElementById('tx-date').value,
      note: document.getElementById('tx-note').value,
    };

    try {
      if (id) {
        await this.api(`/api/transactions/${id}`, { method: 'PUT', body: JSON.stringify(body) });
        this.showToast('Đã cập nhật giao dịch', 'success');
      } else {
        await this.api('/api/transactions', { method: 'POST', body: JSON.stringify(body) });
        this.showToast('Đã thêm giao dịch mới', 'success');
      }
      this.hideModal();
      this.loadTransactions();
    } catch (e) { /* already toasted */ }
  },

  async deleteTransaction(id) {
    if (!confirm('Bạn có chắc muốn xóa giao dịch này?')) return;
    try {
      await this.api(`/api/transactions/${id}`, { method: 'DELETE' });
      this.showToast('Đã xóa giao dịch', 'success');
      this.loadTransactions();
    } catch (e) { /* already toasted */ }
  },

  // ---------- Reports ----------
  async loadReports() {
    const startDate = document.getElementById('report-start')?.value;
    const endDate = document.getElementById('report-end')?.value;

    const params = new URLSearchParams();
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);

    try {
      // Summary
      const summary = await this.api(`/api/reports/summary?${params}`);
      document.getElementById('report-income').textContent = this.formatCurrency(summary.total_income);
      document.getElementById('report-expense').textContent = this.formatCurrency(summary.total_expense);
      const balEl = document.getElementById('report-balance');
      balEl.textContent = this.formatCurrency(summary.balance);

      // Category breakdown (expenses)
      const expenseParams = new URLSearchParams(params);
      expenseParams.set('type', 'expense');
      const categoryData = await this.api(`/api/reports/by-category?${expenseParams}`);

      // Pie chart
      this.renderReportPieChart(categoryData);

      // Category table
      this.renderReportCategoryTable(categoryData, Number(summary.total_expense));
    } catch (e) { /* already toasted */ }
  },

  renderReportPieChart(data) {
    const ctx = document.getElementById('report-pie-chart');
    if (!ctx) return;

    if (this.charts.reportPie) this.charts.reportPie.destroy();

    if (data.length === 0) {
      this.charts.reportPie = null;
      return;
    }

    this.charts.reportPie = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: data.map(d => `${d.category_icon} ${d.category_name}`),
        datasets: [{
          data: data.map(d => Number(d.total)),
          backgroundColor: data.map(d => d.category_color || '#6366f1'),
          borderColor: '#1a1f35',
          borderWidth: 3,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#94a3b8', font: { family: 'Inter' }, padding: 16 }
          },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                const pct = ((ctx.raw / total) * 100).toFixed(1);
                return `${ctx.label}: ${App.formatCurrency(ctx.raw)} (${pct}%)`;
              }
            }
          }
        }
      }
    });
  },

  renderReportCategoryTable(data, totalExpense) {
    const container = document.getElementById('report-category-table');
    if (!container) return;

    if (data.length === 0) {
      container.innerHTML = '<p class="empty-state">Không có dữ liệu</p>';
      return;
    }

    container.innerHTML = `
      <table class="data-table">
        <thead>
          <tr><th>Danh mục</th><th>Số tiền</th><th>Tỷ trọng</th><th>Giao dịch</th></tr>
        </thead>
        <tbody>
          ${data.map(d => {
            const pct = totalExpense > 0 ? ((Number(d.total) / totalExpense) * 100).toFixed(1) : 0;
            return `
              <tr>
                <td>
                  <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${d.category_color};margin-right:8px;"></span>
                  ${d.category_icon} ${this.escapeHtml(d.category_name)}
                </td>
                <td class="amount-expense">${this.formatCurrency(d.total)}</td>
                <td>
                  <div style="display:flex;align-items:center;gap:8px;">
                    <div style="flex:1;height:6px;background:var(--bg-secondary);border-radius:3px;overflow:hidden;">
                      <div style="height:100%;width:${pct}%;background:${d.category_color};border-radius:3px;"></div>
                    </div>
                    <span style="min-width:45px;text-align:right;font-size:0.85rem;">${pct}%</span>
                  </div>
                </td>
                <td>${d.transaction_count}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
  },

  // ---------- Modal ----------
  showModal(title, bodyHtml) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = bodyHtml;
    document.getElementById('modal-overlay').classList.add('active');
  },

  hideModal() {
    document.getElementById('modal-overlay').classList.remove('active');
  },

  // ---------- Toast ----------
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3200);
  },

  // ---------- Utilities ----------
  escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },
};

// ---------- Init on DOM ready ----------
document.addEventListener('DOMContentLoaded', () => App.init());

// Close modal on overlay click
document.getElementById('modal-overlay')?.addEventListener('click', (e) => {
  if (e.target.id === 'modal-overlay') App.hideModal();
});

// Close modal on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') App.hideModal();
});
