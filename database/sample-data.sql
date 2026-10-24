-- ============================================================
-- Expense Tracker — Sample Data (Demo Only)
-- All amounts are in VND. No real financial data.
-- ============================================================

-- Income categories
INSERT INTO categories (name, type, color, icon) VALUES
('Lương',          'income',  '#10b981', '💰'),
('Thưởng',         'income',  '#34d399', '🎁'),
('Thu nhập phụ',   'income',  '#6ee7b7', '💼'),
('Đầu tư',        'income',  '#a7f3d0', '📈');

-- Expense categories
INSERT INTO categories (name, type, color, icon) VALUES
('Ăn uống',       'expense', '#ef4444', '🍜'),
('Di chuyển',     'expense', '#f97316', '🚗'),
('Nhà ở',         'expense', '#f59e0b', '🏠'),
('Giải trí',      'expense', '#eab308', '🎬'),
('Mua sắm',       'expense', '#a855f7', '🛒'),
('Sức khỏe',      'expense', '#ec4899', '💊'),
('Giáo dục',      'expense', '#3b82f6', '📚'),
('Hóa đơn',       'expense', '#6366f1', '📄');

-- ===================== AUGUST 2026 =====================

-- Income
INSERT INTO transactions (category_id, type, amount, occurred_on, note) VALUES
(1, 'income',  15000000, '2026-08-05', 'Lương tháng 8'),
(3, 'income',   2000000, '2026-08-15', 'Dự án freelance');

-- Expenses
INSERT INTO transactions (category_id, type, amount, occurred_on, note) VALUES
(7,  'expense', 5000000, '2026-08-01', 'Tiền thuê nhà tháng 8'),
(5,  'expense', 1200000, '2026-08-03', 'Đi chợ tuần 1'),
(5,  'expense',  850000, '2026-08-07', 'Ăn ngoài cuối tuần'),
(6,  'expense',  500000, '2026-08-08', 'Xăng xe máy'),
(12, 'expense', 1500000, '2026-08-10', 'Tiền điện nước internet'),
(5,  'expense', 1100000, '2026-08-14', 'Đi chợ tuần 2'),
(8,  'expense',  350000, '2026-08-16', 'Xem phim và cafe'),
(6,  'expense',  200000, '2026-08-18', 'Grab đi làm'),
(5,  'expense',  900000, '2026-08-22', 'Đi chợ tuần 3'),
(9,  'expense', 1500000, '2026-08-25', 'Mua quần áo');

-- ===================== SEPTEMBER 2026 =====================

-- Income
INSERT INTO transactions (category_id, type, amount, occurred_on, note) VALUES
(1, 'income',  15000000, '2026-09-05', 'Lương tháng 9'),
(2, 'income',   3000000, '2026-09-10', 'Thưởng quý 3');

-- Expenses
INSERT INTO transactions (category_id, type, amount, occurred_on, note) VALUES
(7,  'expense', 5000000, '2026-09-01', 'Tiền thuê nhà tháng 9'),
(5,  'expense', 1300000, '2026-09-02', 'Đi chợ tuần 1'),
(6,  'expense',  600000, '2026-09-04', 'Xăng và gửi xe'),
(12, 'expense', 1500000, '2026-09-10', 'Tiền điện nước internet'),
(5,  'expense',  950000, '2026-09-12', 'Đi chợ tuần 2'),
(10, 'expense',  800000, '2026-09-14', 'Khám sức khỏe định kỳ'),
(8,  'expense',  500000, '2026-09-17', 'Karaoke với bạn'),
(5,  'expense', 1100000, '2026-09-20', 'Đi chợ tuần 3'),
(9,  'expense', 2300000, '2026-09-22', 'Mua giày và phụ kiện'),
(6,  'expense',  350000, '2026-09-25', 'Grab và xe buýt'),
(5,  'expense',  800000, '2026-09-28', 'Đi chợ tuần 4');

-- ===================== OCTOBER 2026 =====================

-- Income
INSERT INTO transactions (category_id, type, amount, occurred_on, note) VALUES
(1, 'income',  15000000, '2026-10-05', 'Lương tháng 10'),
(3, 'income',   3500000, '2026-10-12', 'Dạy kèm thêm'),
(4, 'income',   1000000, '2026-10-18', 'Cổ tức quỹ đầu tư');

-- Expenses
INSERT INTO transactions (category_id, type, amount, occurred_on, note) VALUES
(7,  'expense', 5000000, '2026-10-01', 'Tiền thuê nhà tháng 10'),
(5,  'expense', 1200000, '2026-10-03', 'Đi chợ tuần 1'),
(6,  'expense',  450000, '2026-10-04', 'Xăng xe'),
(12, 'expense', 1400000, '2026-10-10', 'Tiền điện nước internet'),
(11, 'expense', 2500000, '2026-10-11', 'Học phí khóa online'),
(5,  'expense', 1050000, '2026-10-14', 'Đi chợ tuần 2'),
(8,  'expense', 1200000, '2026-10-16', 'Du lịch ngắn ngày'),
(10, 'expense',  350000, '2026-10-19', 'Mua thuốc'),
(5,  'expense',  950000, '2026-10-21', 'Đi chợ tuần 3'),
(6,  'expense',  300000, '2026-10-22', 'Di chuyển trong tuần');
