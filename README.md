# Dự Án TikTok Shop E-commerce

Dự án này được tái cấu trúc theo hướng dẫn từ tài liệu sửa chữa dự án.

## Cấu trúc thư mục

Dự án được tổ chức theo cấu trúc sau:

```
./tiktok-shop-ecommerce/     # Thư mục gốc cho ứng dụng e-commerce
│
├── client/                # Frontend React + Vite
│   ├── public/            # Chứa các file tĩnh không cần xử lý
│   │   └── images/        # Chứa các file ảnh sản phẩm mẫu hoặc ảnh tĩnh dùng chung
│   ├── src/               # Mã nguồn chính của frontend
│   │   ├── assets/        # Tài nguyên được import vào code
│   │   ├── components/    # Các React components tái sử dụng
│   │   ├── contexts/      # React Contexts
│   │   ├── hooks/         # Các custom React Hooks
│   │   ├── layouts/       # Các layout chính của trang
│   │   ├── lib/           # Các hàm tiện ích, cấu hình thư viện
│   │   ├── pages/         # Các trang hoàn chỉnh
│   │   ├── services/      # Các hàm gọi API backend
│   │   ├── styles/        # Các file CSS global hoặc modules
│   │   ├── App.tsx        # Component gốc, định nghĩa routes chính
│   │   └── main.tsx       # Điểm khởi chạy ứng dụng React
│   ├── index.html         # File HTML gốc của Vite
│   ├── package.json       # Dependencies và scripts cho client
│   ├── postcss.config.js  # Cấu hình PostCSS
│   ├── tailwind.config.js # Cấu hình Tailwind CSS
│   └── vite.config.ts     # Cấu hình Vite
│
└── server/                # Backend Node.js + Express
    ├── src/               # Mã nguồn chính của backend
    │   ├── config/        # Các file cấu hình
    │   ├── controllers/   # Logic xử lý request
    │   ├── db/            # Kết nối DB, migrations
    │   │   └── schema.ts  # Schema database
    │   ├── middleware/    # Các middleware
    │   ├── models/        # Định nghĩa models
    │   ├── routes/        # Định nghĩa các API routes
    │   ├── services/      # Logic nghiệp vụ phức tạp
    │   ├── utils/         # Các hàm tiện ích backend
    │   └── index.ts       # Điểm khởi chạy server Express
    ├── uploads/           # Thư mục lưu trữ ảnh sản phẩm do người dùng tải lên
    ├── package.json       # Dependencies và scripts cho server
    └── tsconfig.json      # Cấu hình TypeScript cho server
```