# Project Graveyard

Nền tảng kết nối cộng đồng lập trình viên, nhà thiết kế và những người sáng tạo để chia sẻ, hợp tác và thương mại hóa các dự án dang dở.

## Tính năng

- Khám phá và tìm kiếm dự án bỏ dở theo danh mục, trạng thái
- Đăng dự án mới và quản lý hồ sơ cá nhân
- Tính phí dịch vụ linh hoạt theo gói và tùy chọn
- Theo dõi giao dịch và quản trị hệ thống (admin)
- Hỗ trợ đa ngôn ngữ (Tiếng Việt / English)

## Công nghệ

- React 18 + TypeScript
- Vite
- Tailwind CSS + shadcn/ui
- React Router
- TanStack Query

## Yêu cầu

- Node.js 18 trở lên
- npm

## Cài đặt và chạy

```bash
# Cài dependencies
npm install

# Chạy development server (http://localhost:8080)
npm run dev

# Build production
npm run build

# Xem trước bản build
npm run preview
```

## Cấu trúc thư mục

```
src/
├── components/   # UI components dùng chung
├── contexts/     # React context (ngôn ngữ, cấu hình giá)
├── data/         # Dữ liệu mock
├── i18n/         # Bản dịch
├── lib/          # Tiện ích
└── pages/        # Các trang ứng dụng
```

## Scripts

| Lệnh | Mô tả |
|------|-------|
| `npm run dev` | Khởi chạy dev server |
| `npm run build` | Build ứng dụng |
| `npm run preview` | Xem trước bản build |
| `npm run lint` | Kiểm tra ESLint |
| `npm test` | Chạy unit tests |

## License

Private — dự án học tập EXE201.
