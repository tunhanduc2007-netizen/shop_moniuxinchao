# Moniu Xin chào — Baby and Kid Shop
### Hệ thống quản lý đơn hàng bán hàng online & livestream TikTok chính thức

Ứng dụng web quản lý đơn hàng thương hiệu chính thức **Moniu Xin chào — Baby and Kid Shop**, được thiết kế theo phong cách thân thiện, dễ thương, chuyên nghiệp và tối ưu thao tác chốt đơn siêu tốc cho mẹ và bé.

---

## 🎨 Bảng nhận diện thương hiệu & Design System

Trích xuất trực tiếp từ logo chính thức của **Moniu Xin chào**:

| Tên Token CSS | Mã Màu | Ý Nghĩa / Vị Trí Áp Dụng |
| :--- | :--- | :--- |
| `--brand-primary` | `#FF5B65` | Màu hồng san hô chủ đạo (Sidebar gradient, nút chính, badge mã đơn, highlight) |
| `--brand-primary-hover` | `#E84A54` | Trạng thái hover của các nút chính |
| `--brand-primary-light` | `#FFF0F1` | Nền phụ nhẹ nhàng cho badge, ô nhập, icon card |
| `--brand-secondary` | `#FFAAA6` | Hồng pastel (Khối chữ A, viền mượt) |
| `--brand-yellow` | `#FFC83B` | Vàng mật ong pastel (Khối B, ngôi sao may mắn, trạng thái Chờ xử lý) |
| `--brand-blue` | `#58B4FA` | Xanh da trời pastel (Khối Y, áo onesie chấm bi, trạng thái Đang giao) |
| `--brand-purple` | `#B892FF` | Tím lavender pastel (Khối B, thẻ Doanh thu) |
| `--brand-mint` | `#48C9B0` | Xanh mint pastel (Áo onesie gợn sóng, trạng thái Đã giao / Thành công) |
| `--surface` | `#FFF9F6` | Trắng kem dịu mắt cho toàn bộ bề mặt ứng dụng |
| `--text-primary` | `#3D271D` | Nâu ấm đậm cho tiêu đề và chữ chính |
| `--text-secondary` | `#8C7065` | Nâu cacao mềm cho phụ đề, nhãn phụ |
| `--border` | `#FDE2E4` | Đường viền mảnh pastel hồng kem |

---

## 📁 Tài nguyên thương hiệu đã tạo (`public/branding/`)

Tất cả các tài nguyên đều được tạo từ logo gốc 1024×1024, chuẩn kích thước và trả về **HTTP 200**:

- `public/branding/logo-full.png` (1024×1024): Logo đầy đủ dùng cho màn hình lớn và trang tổng quan.
- `public/branding/logo-mark.png` (256×256): Biểu tượng gọn hiển thị trên Sidebar và mobile header.
- `public/branding/favicon.ico`: Favicon nhúng native cho trình duyệt desktop.
- `public/branding/favicon-32x32.png`: Favicon kích thước 32×32.
- `public/branding/favicon-16x16.png`: Favicon kích thước 16×16.
- `public/branding/apple-touch-icon.png` (180×180): Biểu tượng cho Safari iOS khi thêm vào màn hình chính (Add to Home Screen).
- `public/branding/icon-192.png` (192×192): PWA Android / Chrome App launcher.
- `public/branding/icon-512.png` (512×512): PWA Splash Screen / High-res icon.
- `public/manifest.webmanifest`: Cấu hình Web App Manifest chuẩn PWA.

---

## 🌟 6 Chức năng chính thống nhất thương hiệu

1. **Tổng quan (`OverviewPage.tsx`)**:
   - Banner chào mừng với logo Moniu Xin chào.
   - 5 thẻ chỉ số kinh doanh: Tổng đơn hàng, Đơn thành công, Đang xử lý, Đã hủy, Doanh thu ước tính (màu coral, mint, yellow, rose, lavender).
   - Biểu đồ doanh thu 7 ngày gần nhất (Smooth AreaChart dải màu gradient hồng san hô Moniu).
   - Biểu đồ Donut trạng thái đơn hàng (xanh mint 70%, xanh da trời 14%, vàng pastel 7%, hồng san hô 5%).
   - Danh sách Đơn hàng hôm nay & Bảng đơn hàng gần đây với tiền tố mã `MN-` (ví dụ: `MN-7K9A2B1`).
   - Thẻ theo dõi vận chuyển (GHN, GHTK, J&T Express) và Top 5 sản phẩm thời trang bé yêu bán chạy nhất.

2. **Tạo đơn chốt live (`CreateOrderPage.tsx`)**:
   - Tối ưu tốc độ bấm đơn livestream TikTok đồ em bé.
   - Tự động sinh mã `MN-XXXXXXX` ngẫu nhiên, không trùng lặp.
   - Nút **"Điền mẫu livestream"** để test 1 chạm.
   - Nút chọn nhanh danh mục sản phẩm đồ sơ sinh/trẻ em (`B01` Body chip, `B02` Yếm gấu, `B03` Váy công chúa, `B04` Đồ bộ thun lạnh, `B05` Áo lông cừu).
   - Tự động tính tạm tính, freeship theo ngưỡng cấu hình và tổng thanh toán.

3. **Lịch sử đơn hàng (`OrderHistoryPage.tsx`)**:
   - Tìm kiếm theo mã đơn `MN-...`, tên mẹ, số điện thoại hoặc tên đồ bé.
   - Lọc theo 5 trạng thái (Chờ xử lý, Đang xử lý, Đang giao, Đã giao, Đã hủy) và phương thức thanh toán.
   - Cập nhật trạng thái trực tiếp trên dòng.
   - Phân trang, xuất file CSV định dạng tiếng Việt UTF-8 `MoniuXinChao_Orders_*.csv`.

4. **Vận chuyển (`ShippingPage.tsx`)**:
   - Thống kê 3 hãng GHN, GHTK, J&T Express.
   - Bảng quản lý vận đơn có nút sao chép 1 chạm và dropdown đổi trạng thái vận chuyển.

5. **Báo cáo & Phân tích (`ReportsPage.tsx`)**:
   - Tổng doanh thu, Tổng đơn bé yêu, Giá trị đơn TB (AOV), Tỷ lệ giao thành công.
   - Biểu đồ cột doanh thu theo ngày livestream.
   - Biểu đồ tròn kênh bán hàng TikTok (Live Stream 65%, Showcase 25%, Video gắn link 10%).

6. **Cài đặt shop Moniu (`SettingsPage.tsx`)**:
   - Thông tin shop: Moniu Xin chào — Baby and Kid Shop, Mẹ Sóc (Moniu Admin), TikTok Shop ID.
   - Tiền tố mã đơn mặc định: `MN-`.
   - Cấu hình phí ship mặc định & ngưỡng Freeship.
   - Cấu hình thanh toán COD & chuyển khoản ngân hàng.

---

## 📱 Hướng dẫn kiểm tra Favicon, Bookmark Safari & Add to Home Screen

### 1. Kiểm tra trên trình duyệt Desktop (Chrome, Safari, Edge, Firefox)
- Mở URL: `http://localhost:5173/`
- Quan sát tab trình duyệt: Favicon Moniu Xin chào hiển thị góc trái tab.
- Nhấn `Cmd + D` (Mac) hoặc `Ctrl + D` (Windows) để lưu Bookmark: Tiêu đề gợi ý là `Moniu Xin chào — Baby and Kid Shop` cùng icon biểu tượng thương hiệu.

### 2. Kiểm tra trên iPhone / iPad (Safari)
1. Mở Safari trên iPhone và truy cập địa chỉ website (sử dụng IP mạng LAN hoặc localhost).
2. Bấm nút **Chia sẻ (Share)** hình ô vuông có mũi tên hướng lên ở thanh dưới cùng.
3. Chọn mục **"Thêm vào Màn hình chính" (Add to Home Screen)**.
4. Safari sẽ tự động lấy icon `apple-touch-icon.png` và điền tên ứng dụng là **"Moniu Xin chào"**.
5. Bấm **Thêm (Add)**: Ứng dụng sẽ xuất hiện trên màn hình chính của iPhone như một ứng dụng độc lập (PWA Standalone), khi mở lên sẽ không bị thanh địa chỉ Safari che khuất.

---

## 🚀 Chạy ứng dụng

```bash
# 1. Cài đặt thư viện
npm install

# 2. Khởi chạy máy chủ phát triển
npm run dev

# 3. Build kiểm tra sản phẩm
npm run build
```
Mặc định mở tại: **http://localhost:5173/**
