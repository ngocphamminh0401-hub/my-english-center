# Hệ thống Quản lý Phòng khám Nha khoa

Hệ thống quản lý thông tin bệnh viện (HIS) dành cho phòng khám nha khoa, xây dựng theo kiến trúc monorepo với Next.js (frontend) và NestJS (backend).

## Tính năng

| Module | Mô tả |
|---|---|
| **Dashboard** | Thống kê tổng quan, lịch làm việc trong ngày, cảnh báo hệ thống |
| **Bệnh nhân** | Quản lý hồ sơ bệnh nhân, tiền sử bệnh, sơ đồ răng |
| **Lịch hẹn** | Đặt & theo dõi lịch hẹn theo bác sĩ, gửi thông báo tự động |
| **Điều trị** | Phiếu khám, chỉ định thủ thuật, đơn thuốc, ảnh X-quang |
| **Tài chính** | Hoá đơn, thanh toán, theo dõi công nợ bệnh nhân & labo |
| **Kho** | Nhập/xuất vật tư, quản lý phiếu labo, nhà cung cấp |
| **Nhân sự** | Lịch làm việc, chấm công, quản lý ngày phép |
| **Báo cáo** | Xuất báo cáo doanh thu, bệnh nhân, tồn kho (Excel/PDF) |
| **Admin** | Tài khoản, phân quyền, cấu hình hệ thống, backup |

## Kiến trúc

```
d:\ĐATN/
├── apps/
│   ├── web/          # Next.js 15 — giao diện người dùng (port 3000)
│   └── api/          # NestJS 10 — REST API (port 3001)
└── packages/
    └── database/     # Prisma schema & migrations dùng chung
```

## Công nghệ

**Frontend**
- Next.js 15 (App Router) + React 19
- Tailwind CSS + shadcn/ui + Radix UI
- Zustand (state) + TanStack Query (data fetching)
- FullCalendar, Recharts, React Hook Form + Zod

**Backend**
- NestJS 10 + Passport JWT
- Prisma 6 (ORM) + PostgreSQL
- BullMQ + Redis (hàng đợi công việc)
- ExcelJS + PDFKit (xuất báo cáo)

**Công cụ**
- pnpm workspaces (monorepo)
- TypeScript strict mode
- Node.js ≥ 20

## Yêu cầu hệ thống

- Node.js ≥ 20
- pnpm ≥ 9
- PostgreSQL ≥ 15
- Redis ≥ 7

## Cài đặt & Chạy

**1. Clone và cài dependencies**

```bash
git clone <repo-url>
cd ĐATN
pnpm install
```

**2. Cấu hình biến môi trường**

Tạo file `.env` trong `apps/api/`:

```env
DATABASE_URL="postgresql://postgres:<password>@localhost:5432/HIS?schema=public"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-secret-key"
PORT=3001
FRONTEND_URL="http://localhost:3000"
```

Tạo file `.env` trong `packages/database/`:

```env
DATABASE_URL="postgresql://postgres:<password>@localhost:5432/HIS?schema=public"
```

**3. Khởi tạo database**

```bash
cd packages/database
pnpm prisma migrate deploy
pnpm prisma db seed
```

**4. Chạy ứng dụng**

```bash
# Chạy API (từ thư mục gốc hoặc apps/api)
cd apps/api
pnpm dev

# Chạy frontend (từ thư mục gốc hoặc apps/web)
pnpm dev          # hoặc: cd apps/web && pnpm dev
```

Truy cập: `http://localhost:3000`

## Scripts

| Lệnh (từ thư mục gốc) | Mô tả |
|---|---|
| `pnpm dev` | Khởi động frontend dev server |
| `pnpm build` | Build frontend production |
| `pnpm type-check` | Kiểm tra TypeScript |

| Lệnh (trong `apps/api`) | Mô tả |
|---|---|
| `pnpm dev` | Khởi động API với watch mode |
| `pnpm build` | Biên dịch TypeScript |
| `pnpm start` | Chạy bản build production |

## Cơ sở dữ liệu

Schema gồm **36 bảng** được tổ chức theo 5 nhóm chức năng:

- **Hệ thống & xác thực** — TaiKhoan, NhanVien, PhanQuyen, CauHinhHeThong
- **Bệnh nhân** — BenhNhan, TienSuBenh, HoSoRang, SystemLog
- **Lịch hẹn** — LichHen, ThongBaoLichHen
- **Điều trị** — PhieuKham, ChiTietDieuTri, DanhMucThuThuat, HinhAnhXQuang, DonThuoc, ...
- **Tài chính** — ThanhToan, CongNo, KhoanThu, KhoanChi, ...
- **Kho** — VatTieu, PhieuNhapKho, PhieuXuatKho, PhieuLabo, NhaCungCap, ...
- **Nhân sự** — LichLamViec, ChamCong, NgayPhep

## API

Base URL: `http://localhost:3001/api`

Một số endpoint chính:

```
POST   /api/auth/login
GET    /api/patients
POST   /api/patients
GET    /api/patients/:maBN
GET    /api/patients/:maBN/dental-chart
GET    /api/appointments
POST   /api/appointments
PATCH  /api/appointments/:maLH
GET    /api/appointments/doctors
```

Tất cả endpoint (trừ `/auth/login`) yêu cầu header `Authorization: Bearer <token>`.

## Phân quyền

| Vai trò | Mô tả |
|---|---|
| `admin` | Toàn quyền hệ thống |
| `bacsi` | Khám bệnh, điều trị, đơn thuốc |
| `letan` | Tiếp nhận, đặt lịch hẹn |
| `ketoan` | Thanh toán, báo cáo tài chính |
| `kithuat` | Kho, labo |
