# Hệ thống Quản lý Chi tiêu Cá nhân (Expense Tracker)

> **Môn học:** Đồ án / Bài tập lớn Triển khai Hệ thống  
> **Mã số sinh viên (MSSV):** `DTC245180161`  
> **Repository:** [https://github.com/manhnopro983-max/DTC245180161](https://github.com/manhnopro983-max/DTC245180161)  
> **Nền tảng triển khai:** Docker & Docker Compose (10 dịch vụ)

---

## 1. Giới thiệu & Tính năng Ứng dụng

Ứng dụng web quản lý chi tiêu cá nhân/gia đình giúp theo dõi các khoản thu nhập và chi tiêu, phân loại theo danh mục linh hoạt, trực quan hóa dòng tiền và hỗ trợ ra quyết định tài chính. Toàn bộ hệ thống được container hóa và tích hợp đầy đủ công nghệ giám sát (Monitoring) và quản lý nhật ký tập trung (Logging) theo tiêu chuẩn DevOps.

### Tính năng chính:
- 📊 **Dashboard Tổng quan:** Thống kê Tổng thu, Tổng chi, Số dư thực tế và biểu đồ diễn biến tài chính.
- 💸 **Quản lý Giao dịch:** Thêm, xem, sửa, xóa các giao dịch thu/chi kèm ngày phát sinh, số tiền (VND), danh mục và ghi chú.
- 🏷️ **Quản lý Danh mục:** Phân loại danh mục Thu (Lương, Thưởng, Đầu tư...) và Chi (Ăn uống, Nhà ở, Đi lại, Mua sắm...), hỗ trợ biểu tượng (icon) và màu sắc nhận diện.
- 🔍 **Bộ lọc thông minh:** Lọc giao dịch theo khoảng ngày, loại thu/chi, danh mục và hỗ trợ phân trang.
- 📈 **Báo cáo Phân tích:** Biểu đồ tỷ trọng chi tiêu (Doughnut chart) và biểu đồ biến động thu chi qua các tháng (Bar chart) sử dụng Chart.js.
- 💵 **Chuẩn tiền tệ:** Sử dụng kiểu số nguyên chính xác `NUMERIC(15,0)` cho tiền tệ VND, không có sai số thập phân.

---

## 2. Kiến trúc Hệ thống (System Architecture)

```text
                                  +-------------------------------------------------------------+
                                  |                     NGƯỜI DÙNG / TRÌNH DUYỆT                 |
                                  +-------------------------------------------------------------+
                                           | (HTTP Port 80)                       | (Port 8080)
                                           v                                      v
+-----------------------------------------------------------------------------------------------+
| NGINX REVERSE PROXY (Port 80 & 8080)                                                          |
|  - Cổng tiếp nhận duy nhất, ẩn server tokens                                                 |
|  - Chặn công khai /metrics (HTTP 403 Forbidden)                                               |
|  - Áp dụng 5 Security Headers (CSP, X-Frame-Options, X-Content-Type-Options...)               |
|  - Proxy tiếng Việt cho pgAdmin & Grafana (Port 8080)                                         |
+-----------------------------------------------------------------------------------------------+
       |                                           |                                  |
[Mạng frontend]                             [Mạng backend]                     [Mạng monitoring]
       |                                           |                                  |
       v                                           v                                  v
+---------------------+                     +---------------------+            +---------------------+
|   expense-app       | ----------------->  |   expense-postgres  |            |  expense-prometheus |
|  (Node.js Express)  |                     |   (PostgreSQL 16)   |            |    (Port 9090)      |
|  Non-root: appuser  |                     |  Cổng 5432 nội bộ   |            +---------------------+
+---------------------+                     +---------------------+               ^      ^      ^
       |                                           ^        ^                     |      |      |
       | /metrics                                  |        |                     |      |      |
       +-------------------------------------------+--------|---------------------+      |      |
                                                   |        |                            |      |
                                        +----------------+  |  +--------------------+    |      |
                                        | expense-pgadmin|  |  |  postgres-exporter |----+      |
                                        |  (Port 5050)   |  |  |    (Port 9187)     |           |
                                        +----------------+  |  +--------------------+           |
                                                            |                                   |
                                                            |  +--------------------+           |
                                                            |  |  expense-cadvisor  |-----------+
                                                            |  |    (Port 8080)     |
                                                            |  +--------------------+
                                                            |
                                                   +------------------------------------+
                                                   |          HỆ THỐNG LOGGING          |
                                                   | Docker Socket -> Promtail -> Loki  |
                                                   +------------------------------------+
                                                                    |
                                                                    v
                                                            +--------------------+
                                                            |  expense-grafana   |
                                                            | (Dashboards & Logs)|
                                                            +--------------------+
```

### Danh sách 10 Dịch vụ Docker Compose:

| Dịch vụ | Image | Mạng phân vùng | Vai trò kỹ thuật |
|---|---|---|---|
| `app` | `node:20-alpine` | `frontend`, `backend`, `monitoring` | Web application (Express REST API + SPA) |
| `postgres` | `postgres:16-alpine` | `backend` | Cơ sở dữ liệu quan hệ PostgreSQL 16 |
| `pgadmin` | `dpage/pgadmin4:8.14` | `backend` | Giao diện quản trị database |
| `nginx` | `nginx:1.27-alpine` | `frontend`, `backend`, `monitoring` | Reverse Proxy, Security Headers, Local Proxy |
| `prometheus` | `prom/prometheus:v2.54.1` | `monitoring` | Thu thập và lưu trữ metrics định kỳ |
| `grafana` | `grafana/grafana:11.3.0` | `monitoring` | Trực quan hóa metrics và truy vấn nhật ký |
| `cadvisor` | `ghcr.io/google/cadvisor:v0.60.6` | `monitoring` | Thu thập metrics CPU, RAM, Network container |
| `postgres-exporter` | `prometheuscommunity/postgres-exporter:v0.15.0` | `backend`, `monitoring` | Thu thập chỉ số nội tại PostgreSQL |
| `loki` | `grafana/loki:3.2.1` | `monitoring` | Hệ thống lưu trữ log tập trung |
| `promtail` | `grafana/promtail:3.2.1` | `monitoring` | Thu thập Docker logs và gửi về Loki |

---

## 3. Yêu cầu Môi trường & Hướng dẫn Cài đặt

### Yêu cầu tiên quyết:
- [Docker Engine](https://docs.docker.com/engine/install/) ≥ 24.x
- [Docker Compose](https://docs.docker.com/compose/install/) ≥ 2.x
- Git

### Các bước cài đặt và khởi chạy:

#### 1. Clone repository
```bash
git clone https://github.com/manhnopro983-max/DTC245180161.git
cd DTC245180161
```

#### 2. Thiết lập Biến môi trường
```bash
cp .env.example .env
```
*Tệp `.env.example` đã cấu hình sẵn các giá trị mặc định cho môi trường demo. Bạn có thể chỉnh sửa mật khẩu trong `.env` nếu cần.*

#### 3. Khởi chạy toàn bộ hệ thống
```bash
docker compose up -d --build
```

#### 4. Kiểm tra trạng thái 10 containers
```bash
docker compose ps
# Tất cả 10 dịch vụ phải ở trạng thái "Up" hoặc "Up (healthy)"
```

#### 5. Xem log theo thời gian thực (nếu cần)
```bash
docker compose logs -f app       # Xem log ứng dụng web
docker compose logs -f nginx     # Xem log truy cập proxy
docker compose logs -f promtail  # Xem log bộ thu thập nhật ký
```

#### 6. Dừng hệ thống
```bash
docker compose down        # Dừng và giữ nguyên dữ liệu volumes
docker compose down -v     # Dừng và xóa toàn bộ dữ liệu volumes
```

---

## 4. Danh mục Địa chỉ Truy cập & Tài khoản Demo

| Dịch vụ | Địa chỉ URL | Tài khoản / Mật khẩu | Ghi chú |
|---|---|---|---|
| **Website Quản lý Chi tiêu** | [http://localhost](http://localhost) | *Không cần đăng nhập* | Điểm truy cập chính qua Nginx cổng 80 |
| **pgAdmin (Bản Tiếng Việt)** | [http://pgadmin.localhost:8080](http://pgadmin.localhost:8080) | `admin@example.com`<br>`change_me_pgadmin_password` | Proxy Nginx kèm script Việt hóa |
| **pgAdmin (Cổng trực tiếp)** | [http://localhost:5050](http://localhost:5050) | `admin@example.com`<br>`change_me_pgadmin_password` | Cổng trực tiếp của pgAdmin 4 |
| **Grafana (Bản Tiếng Việt)** | [http://grafana.localhost:8080](http://grafana.localhost:8080) | `admin`<br>`change_me_grafana_password` | Proxy Nginx kèm script Việt hóa |
| **Grafana (Cổng trực tiếp)** | [http://localhost:3001](http://localhost:3001) | `admin`<br>`change_me_grafana_password` | Xem Dashboards và truy vấn Explore |
| **API Health Check** | [http://localhost/api/health](http://localhost/api/health) | *Công khai* | Trả về `{"status":"ok"}` |
| **Database Server** | `postgres:5432` *(nội bộ)* | `expense_app`<br>`change_me_app_secure_password` | Tài khoản ứng dụng (quyền CRUD) |

> 💡 *Trình duyệt Chrome và Edge mặc định tự phân giải các tên miền kết thúc bằng `.localhost` về `127.0.0.1`, bạn có thể nhấp mở trực tiếp các đường link trên.*

---

## 5. Giám sát & Quản lý Nhật ký (Observability)

### 5.1. Prometheus Targets
Prometheus tự động scrape 4 mục tiêu định kỳ mỗi 15 giây. Kiểm tra trạng thái:
```bash
docker exec expense-prometheus wget -qO- 'http://localhost:9090/api/v1/targets'
```
*Cả 4 targets: `cadvisor`, `expense-app`, `postgres-exporter`, `prometheus` đều ở trạng thái `UP`.*

### 5.2. Grafana Dashboards
Hệ thống tự động nạp sẵn 2 dashboard tại thư mục **Expense Tracker**:
1. **Expense Tracker - Application:**
   - Tần suất yêu cầu (Request Rate req/s) phân loại theo HTTP method.
   - Độ trễ xử lý (Latency p50, p90, p99).
   - Tỷ lệ lỗi HTTP 4xx và 5xx.
   - Tần suất thao tác CRUD giao dịch.
   - Chiếm dụng bộ nhớ của tiến trình Node.js (Heap, RSS).
2. **Expense Tracker - Infrastructure:**
   - Mức sử dụng CPU và Memory của từng container qua cAdvisor.
   - Trạng thái PostgreSQL (`UP`), số kết nối hoạt động, kích thước DB và TPS.
   - Lưu lượng mạng (Network I/O) theo từng service.

### 5.3. Truy vấn Nhật ký LogQL (Grafana Explore)
Mở **Grafana ➔ Explore ➔ Data source: Loki** và chạy các câu truy vấn sau:
- **Xem toàn bộ log của ứng dụng:**
  ```logql
  {service="app"}
  ```
- **Lọc riêng các sự kiện giao dịch nghiệp vụ:**
  ```logql
  {service="app"} |= "transaction"
  ```
- **Lọc các mã phản hồi lỗi HTTP 4xx hoặc 5xx trên Nginx:**
  ```logql
  {service="nginx"} |~ "(4[0-9]{2}|5[0-9]{2})"
  ```

---

## 6. Các Biện pháp Bảo mật Đã Áp dụng (Hardening)

1. **Non-root Container:** Ứng dụng Express thực thi dưới quyền user `appuser` (UID: 1001), không sử dụng quyền root.
2. **Network Isolation:** Phân chia 3 bridge networks riêng biệt (`frontend`, `backend`, `monitoring`). CSDL PostgreSQL tuyệt đối không mở cổng ra ngoài host.
3. **Phân quyền Database Tối thiểu (Least Privilege):** Ứng dụng kết nối bằng user `expense_app` chỉ có quyền `SELECT, INSERT, UPDATE, DELETE` trên các bảng public; tước bỏ hoàn toàn quyền DDL (không thể DROP hay ALTER schema).
4. **Security Headers tại Nginx:** Áp dụng đầy đủ 5 tiêu đề an ninh:
   - `X-Content-Type-Options: nosniff`
   - `X-Frame-Options: SAMEORIGIN`
   - `X-XSS-Protection: 1; mode=block`
   - `Referrer-Policy: strict-origin-when-cross-origin`
   - `Content-Security-Policy` hạn chế nguồn tài nguyên ngoài.
5. **Chống SQL Injection:** 100% câu truy vấn cơ sở dữ liệu sử dụng tham số hóa (Parameterized queries `$1, $2...`).
6. **Chặn công khai Endpoint Metrics:** Nginx chặn truy cập bên ngoài vào `/metrics` (trả về HTTP 403 Forbidden).
7. **Ẩn thông tin phiên bản máy chủ:** Bật chỉ thị `server_tokens off;` trong Nginx.
8. **Bảo mật Secret:** Không đưa mật khẩu hoặc file `.env` lên Git; quản lý độc lập qua `.env.example`.

---

## 7. Cấu trúc Dự án

```text
DTC245180161/
├── app/
│   ├── src/
│   │   ├── index.js                  # Máy chủ Express & định tuyến 404/500
│   │   ├── db.js                     # Quản lý kết nối PostgreSQL pool
│   │   ├── middleware/
│   │   │   └── metrics.js            # Đo lường Prometheus metrics
│   │   ├── routes/
│   │   │   ├── categories.js         # API quản lý danh mục
│   │   │   ├── transactions.js       # API quản lý giao dịch
│   │   │   └── reports.js            # API tổng hợp báo cáo thu chi
│   │   └── public/                   # Frontend SPA (HTML5/CSS3/Vanilla JS)
│   ├── package.json
│   └── Dockerfile
├── database/
│   ├── init.sql                      # Schema CSDL, check constraints & triggers
│   ├── sample-data.sql               # Dữ liệu mẫu ban đầu (VND)
│   ├── 03-app-user.sh                # Script tạo DB user quyền tối thiểu
│   └── pgadmin-servers.json          # Tự động đăng ký máy chủ cho pgAdmin
├── nginx/
│   ├── nginx.conf                    # Reverse proxy, security headers & routing
│   ├── vietnamese-ui.js              # Script hỗ trợ giao diện tiếng Việt
│   └── certs/.gitkeep                # Thư mục chứng chỉ TLS (tùy chọn)
├── monitoring/
│   ├── prometheus/prometheus.yml     # Cấu hình scrape 4 targets
│   └── grafana/provisioning/
│       ├── datasources/datasource.yml # Provisioning Prometheus & Loki
│       └── dashboards/
│           ├── dashboard.yml
│           ├── app-dashboard.json     # Dashboard ứng dụng
│           └── infra-dashboard.json   # Dashboard hạ tầng & CSDL
├── logging/
│   ├── loki/loki-config.yml          # Cấu hình lưu trữ và chunking Loki
│   └── promtail/promtail-config.yml   # Cấu hình đọc Docker logs
├── docs/
│   ├── BAO_CAO_EXPENSE_TRACKER.docx  # Báo cáo Word môn học (16 trang)
│   └── images/                       # Ảnh chụp giao diện thực tế
├── tools/
│   ├── build_report.py               # Script hỗ trợ xuất báo cáo Word
│   └── contact_report.py             # Script tạo contact sheet trang báo cáo
├── docker-compose.yml                # Khởi chạy đồng bộ 10 dịch vụ
├── .env.example                      # Mẫu biến môi trường
├── .gitignore                        # Cấu hình bỏ qua tệp nhạy cảm
└── README.md                         # Hướng dẫn chi tiết dự án
```

---

## 8. Lịch sử Commit

Repository tuân thủ chuẩn 3 mốc commit tiếng Việt theo đúng yêu cầu đề bài:

1. **Commit 1:** `Cấu hình Nginx làm reverse proxy (có HTTPS tự ký hoặc security headers cơ bản)`
2. **Commit 2:** `Tích hợp Prometheus + Grafana để giám sát container, web server và database`
3. **Commit 3:** `Triển khai hệ thống log tập trung Loki + Promtail, truy vấn log bằng LogQL (ít nhất 2–3 query)`
