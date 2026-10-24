(() => {
  'use strict';

  // A small client-side Vietnamese layer for the most common admin controls.
  // Anything not listed here remains in the upstream application's language.
  const dictionary = {
    'welcome to grafana': 'Chào mừng đến với Grafana', 'sign in': 'Đăng nhập', 'log in': 'Đăng nhập', 'email or username': 'Email hoặc tên đăng nhập',
    'email address / username': 'Email / tên đăng nhập', 'email address': 'Địa chỉ email',
    'email': 'Email', 'password': 'Mật khẩu', 'username': 'Tên đăng nhập', 'remember me': 'Ghi nhớ đăng nhập',
    'forgot your password?': 'Quên mật khẩu?', 'forgotten your password?': 'Quên mật khẩu?', 'login': 'Đăng nhập', 'logout': 'Đăng xuất', 'log out': 'Đăng xuất',
    'you must login to view this resource.': 'Bạn cần đăng nhập để xem nội dung này.', 'close message': 'Đóng thông báo',
    'home': 'Trang chủ', 'dashboard': 'Bảng điều khiển', 'dashboards': 'Các bảng điều khiển',
    'file': 'Tệp', 'object': 'Đối tượng', 'tools': 'Công cụ', 'more': 'Thêm', 'welcome': 'Chào mừng',
    'search': 'Tìm kiếm', 'search dashboards': 'Tìm bảng điều khiển', 'recently viewed': 'Đã xem gần đây',
    'starred': 'Được đánh dấu', 'favorites': 'Yêu thích', 'alerting': 'Cảnh báo', 'connections': 'Kết nối',
    'data sources': 'Nguồn dữ liệu', 'administration': 'Quản trị', 'configuration': 'Cấu hình',
    'users': 'Người dùng', 'teams': 'Nhóm', 'plugins': 'Tiện ích', 'preferences': 'Tùy chọn',
    'server admin': 'Quản trị máy chủ', 'organization': 'Tổ chức', 'general': 'Chung', 'security': 'Bảo mật',
    'save': 'Lưu', 'save dashboard': 'Lưu bảng điều khiển', 'save changes': 'Lưu thay đổi',
    'cancel': 'Hủy', 'close': 'Đóng', 'edit': 'Chỉnh sửa', 'delete': 'Xóa', 'remove': 'Gỡ',
    'add': 'Thêm', 'new': 'Mới', 'create': 'Tạo', 'update': 'Cập nhật', 'refresh': 'Làm mới',
    'apply': 'Áp dụng', 'submit': 'Gửi', 'confirm': 'Xác nhận', 'yes': 'Có', 'no': 'Không',
    'name': 'Tên', 'description': 'Mô tả', 'type': 'Loại', 'status': 'Trạng thái', 'enabled': 'Đã bật',
    'disabled': 'Đã tắt', 'loading...': 'Đang tải...', 'error': 'Lỗi', 'success': 'Thành công',
    'no data': 'Không có dữ liệu', 'no data sources found': 'Không tìm thấy nguồn dữ liệu',
    'time range': 'Khoảng thời gian', 'last 5 minutes': '5 phút gần nhất', 'last 15 minutes': '15 phút gần nhất',
    'last 1 hour': '1 giờ gần nhất', 'last 6 hours': '6 giờ gần nhất', 'last 24 hours': '24 giờ gần nhất',
    'last 7 days': '7 ngày gần nhất', 'from': 'Từ', 'to': 'Đến', 'timezone': 'Múi giờ',
    'share': 'Chia sẻ', 'export': 'Xuất', 'import': 'Nhập', 'copy': 'Sao chép', 'view': 'Xem',
    'overview': 'Tổng quan', 'explore': 'Khám phá', 'metrics': 'Chỉ số', 'logs': 'Nhật ký',
    'queries': 'Truy vấn', 'panels': 'Bảng', 'variables': 'Biến', 'annotations': 'Chú thích',
    'database': 'Cơ sở dữ liệu', 'databases': 'Cơ sở dữ liệu', 'servers': 'Máy chủ', 'objects': 'Đối tượng',
    'schemas': 'Lược đồ', 'tables': 'Bảng', 'columns': 'Cột', 'indexes': 'Chỉ mục', 'views': 'Khung nhìn',
    'functions': 'Hàm', 'triggers': 'Trigger', 'login/group roles': 'Vai trò đăng nhập/nhóm',
    'properties': 'Thuộc tính', 'query tool': 'Công cụ truy vấn', 'backup': 'Sao lưu', 'restore': 'Khôi phục',
    'maintenance': 'Bảo trì', 'statistics': 'Thống kê', 'dependencies': 'Phụ thuộc',
    'dependents': 'Đối tượng phụ thuộc', 'object explorer': 'Trình duyệt đối tượng', 'browser': 'Trình duyệt',
    'dashboard settings': 'Cài đặt bảng điều khiển', 'panel title': 'Tiêu đề bảng', 'add panel': 'Thêm bảng',
    'add visualization': 'Thêm biểu đồ', 'visualization': 'Biểu đồ', 'table view': 'Dạng bảng',
    'graph': 'Biểu đồ', 'bar chart': 'Biểu đồ cột', 'time series': 'Chuỗi thời gian',
    'no matches found': 'Không tìm thấy kết quả', 'loading': 'Đang tải', 'help': 'Trợ giúp',
    'need help?': 'Cần trợ giúp?', 'tutorials': 'Hướng dẫn', 'community': 'Cộng đồng', 'public slack': 'Slack cộng đồng',
    'the steps below will guide you to quickly finish setting up your grafana installation.': 'Các bước dưới đây sẽ giúp bạn nhanh chóng hoàn tất thiết lập Grafana.',
    'skip to main content': 'Bỏ qua đến nội dung chính', 'go to home': 'Về trang chủ', 'advanced tutorials': 'Hướng dẫn nâng cao',
    'complete add your first data source': 'Hoàn tất: thêm nguồn dữ liệu đầu tiên',
    'complete create your first dashboard': 'Hoàn tất: tạo bảng điều khiển đầu tiên', 'basic': 'Cơ bản',
    'remove this panel': 'Xóa bảng này', 'news': 'Tin tức', 'profile': 'Hồ sơ',
    'documentation': 'Tài liệu', 'feedback': 'Gửi phản hồi', 'version': 'Phiên bản',
    'database server': 'Máy chủ cơ sở dữ liệu', 'connect to server': 'Kết nối máy chủ',
    'disconnect from server': 'Ngắt kết nối máy chủ', 'refresh...': 'Đang làm mới...',
    'create a new dashboard': 'Tạo bảng điều khiển mới', 'new dashboard': 'Bảng điều khiển mới',
    'folder': 'Thư mục', 'folders': 'Thư mục', 'create folder': 'Tạo thư mục',
    'alert rules': 'Quy tắc cảnh báo', 'contact points': 'Điểm liên hệ', 'notification policies': 'Chính sách thông báo',
    'recording rules': 'Quy tắc ghi', 'silences': 'Tạm ngưng cảnh báo', 'data source': 'Nguồn dữ liệu',
    'org preferences': 'Tùy chọn tổ chức', 'language': 'Ngôn ngữ',
    'default': 'Mặc định', 'english': 'Tiếng Anh', 'save & test': 'Lưu và kiểm tra', 'test': 'Kiểm tra',
    'host': 'Máy chủ', 'port': 'Cổng', 'maintenance database': 'Cơ sở dữ liệu bảo trì',
    'service': 'Dịch vụ', 'connect': 'Kết nối', 'disconnect': 'Ngắt kết nối', 'refresh all': 'Làm mới tất cả',
    'add new server': 'Thêm máy chủ mới', 'register server': 'Đăng ký máy chủ', 'connection': 'Kết nối',
    'host name/address': 'Tên máy chủ/địa chỉ', 'save password': 'Lưu mật khẩu', 'view/edit data': 'Xem/chỉnh sửa dữ liệu',
    'edit data': 'Chỉnh sửa dữ liệu', 'sql': 'SQL', 'get started': 'Bắt đầu', 'create your first dashboard': 'Tạo bảng điều khiển đầu tiên',
    'data connections': 'Kết nối dữ liệu', 'connect data': 'Kết nối dữ liệu', 'last 30 minutes': '30 phút gần nhất',
    'quick links': 'Liên kết nhanh', 'getting started': 'Bắt đầu', 'configure pgadmin': 'Cấu hình pgAdmin',
    'feature rich | maximises postgresql | open source': 'Đầy đủ tính năng | Tối ưu PostgreSQL | Mã nguồn mở',
    'processes': 'Tiến trình', 'request rate': 'Tốc độ yêu cầu', 'http requests': 'Yêu cầu HTTP',
    'http request rate': 'Tốc độ yêu cầu HTTP', 'error rate': 'Tỷ lệ lỗi', 'latency': 'Độ trễ',
    'memory usage': 'Mức sử dụng bộ nhớ', 'cpu usage': 'Mức sử dụng CPU', 'container': 'Container',
    'application': 'Ứng dụng', 'infrastructure': 'Hạ tầng', 'transactions': 'Giao dịch',
    'expense tracker - application': 'Quản lý chi tiêu - Ứng dụng',
    'expense tracker - infrastructure': 'Quản lý chi tiêu - Hạ tầng',
    'pgadmin is an open source administration and management tool for the postgresql database. it includes a graphical administration interface, an sql query tool, a procedural code debugger and much more. the tool is designed to answer the needs of developers, dbas and system administrators alike.': 'pgAdmin là công cụ mã nguồn mở để quản trị và quản lý cơ sở dữ liệu PostgreSQL. Công cụ có giao diện quản trị đồ họa, công cụ truy vấn SQL, trình gỡ lỗi mã thủ tục và nhiều tính năng khác, đáp ứng nhu cầu của nhà phát triển, DBA và quản trị hệ thống.',
  };
  const textOriginals = new WeakMap();
  const attrOriginals = new WeakMap();
  let enabled = localStorage.getItem('expense-admin-language') !== 'en';

  const escapeRe = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const entries = Object.entries(dictionary).sort((a, b) => b[0].length - a[0].length);

  function translateText(original) {
    let result = original;
    for (const [english, vietnamese] of entries) {
      const re = new RegExp(`(^|[^\\p{L}\\p{N}])${escapeRe(english)}(?=$|[^\\p{L}\\p{N}])`, 'giu');
      result = result.replace(re, (_match, prefix) => prefix + vietnamese);
    }
    return result;
  }

  function translateAttributes(element) {
    if (!(element instanceof Element)) return;
    for (const attribute of ['placeholder', 'aria-label', 'title', 'data-tooltip-content']) {
      if (!element.hasAttribute(attribute)) continue;
      let originals = attrOriginals.get(element);
      if (!originals) { originals = {}; attrOriginals.set(element, originals); }
      if (!(attribute in originals)) originals[attribute] = element.getAttribute(attribute);
      const original = originals[attribute];
      const value = enabled ? translateText(original) : original;
      if (element.getAttribute(attribute) !== value) element.setAttribute(attribute, value);
    }
  }

  function translateElement(element) {
    if (!(element instanceof Element)) return;
    translateAttributes(element);
    if (element.matches('input, textarea, code, pre, script, style, svg, [contenteditable="true"]') ||
        element.closest('input, textarea, code, pre, script, style, svg, [contenteditable="true"]')) return;
    element.querySelectorAll('[placeholder], [aria-label], [title], [data-tooltip-content]')
      .forEach(translateAttributes);

    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const node of nodes) {
      if (!node.nodeValue.trim()) continue;
      if (!textOriginals.has(node)) textOriginals.set(node, node.nodeValue);
      const original = textOriginals.get(node);
      const value = enabled ? translateText(original) : original;
      if (node.nodeValue !== value) node.nodeValue = value;
    }
  }

  function apply(root = document.body) {
    if (!root) return;
    translateElement(root);
    const button = document.getElementById('expense-vietnamese-toggle');
    if (button) button.textContent = enabled ? '🌐 Tiếng Việt' : '🌐 English';
  }

  function installToggle() {
    if (!document.body || document.getElementById('expense-vietnamese-toggle')) return;
    const button = document.createElement('button');
    button.id = 'expense-vietnamese-toggle';
    button.type = 'button';
    button.textContent = enabled ? '🌐 Tiếng Việt' : '🌐 English';
    button.title = 'Chuyển đổi ngôn ngữ giao diện';
    Object.assign(button.style, {
      position: 'fixed', right: '16px', bottom: '16px', zIndex: '2147483647',
      border: '1px solid #8b9aaa', borderRadius: '18px', padding: '8px 13px',
      background: '#fff', color: '#17212b', boxShadow: '0 2px 10px #0003',
      font: '14px system-ui, sans-serif', cursor: 'pointer'
    });
    button.addEventListener('click', () => {
      enabled = !enabled;
      localStorage.setItem('expense-admin-language', enabled ? 'vi' : 'en');
      apply();
    });
    document.body.appendChild(button);
  }

  function start() {
    installToggle();
    apply();
    new MutationObserver((records) => {
      for (const record of records) {
        if (record.type === 'childList') record.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) translateElement(node);
          if (node.nodeType === Node.TEXT_NODE && node.nodeValue.trim()) {
            if (!textOriginals.has(node)) textOriginals.set(node, node.nodeValue);
            const source = textOriginals.get(node);
            const value = enabled ? translateText(source) : source;
            if (node.nodeValue !== value) node.nodeValue = value;
          }
        });
        else if (record.type === 'attributes') translateAttributes(record.target);
      }
      installToggle();
    }).observe(document.body, { childList: true, subtree: true, attributes: true,
      attributeFilter: ['placeholder', 'aria-label', 'title', 'data-tooltip-content'] });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
