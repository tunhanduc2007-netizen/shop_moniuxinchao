-- ========================================================================
-- MONIU XIN CHÀO — HỆ THỐNG CƠ SỞ DỮ LIỆU ĐÁM MÂY SUPABASE (FULL CHUẨN)
-- Bao gồm: Khách hàng, Đơn hàng, Sản phẩm 330 mẫu, Cài đặt Shop & Tự động tính Rank
-- ========================================================================

-- 1. BẢNG KHÁCH HÀNG & BẢNG XẾP HẠNG RANKING (CUSTOMERS)
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone VARCHAR(20) UNIQUE NOT NULL,                       -- Số điện thoại (Khóa chính nhận diện khách)
  name VARCHAR(100) NOT NULL,                              -- Tên khách / Nickname TikTok
  address TEXT,                                            -- Địa chỉ giao hàng quen thuộc
  rank VARCHAR(50) DEFAULT 'Mầm Nhỏ',                      -- Mầm Nhỏ, Bé Ngoan, Mẹ Thông Thái, Mẹ Kim Cương
  total_orders INT DEFAULT 0,                              -- Tổng số đơn đã chốt thành công
  total_spent NUMERIC DEFAULT 0,                           -- Tổng số tiền đã mua tại shop
  notes TEXT,                                              -- Ghi chú size bé / đặc điểm khách
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. BẢNG ĐƠN HÀNG (ORDERS)
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,                        -- Mã đơn hàng (VD: MN-RAGEE5S)
  customer_name VARCHAR(100) NOT NULL,                     -- Tên khách
  customer_phone VARCHAR(20) NOT NULL,                     -- SĐT khách
  shipping_address TEXT,                                   -- Địa chỉ nhận
  order_note TEXT,                                         -- Ghi chú đơn
  items JSONB NOT NULL DEFAULT '[]'::jsonb,                -- Danh sách đồ bé, mã SP, size, đơn giá, SL
  subtotal NUMERIC DEFAULT 0,                              -- Tạm tính
  shipping_fee NUMERIC DEFAULT 0,                          -- Phí vận chuyển
  discount NUMERIC DEFAULT 0,                              -- Giảm giá / Ưu đãi live
  total_amount NUMERIC DEFAULT 0,                          -- Tổng thanh toán
  payment_method VARCHAR(50) DEFAULT 'COD',                -- COD / Chuyển khoản
  is_paid BOOLEAN DEFAULT FALSE,                           -- Đã thanh toán hay chưa
  status VARCHAR(50) DEFAULT 'Chờ xử lý',                  -- Chờ xử lý, Đang xử lý, Đang giao, Đã giao, Đã hủy
  carrier VARCHAR(50) DEFAULT 'GHN',                       -- GHN, GHTK, Viettel Post, J&T Express
  tracking_code VARCHAR(100),                              -- Mã vận đơn
  shipping_status VARCHAR(50) DEFAULT 'Chờ lấy hàng',      -- Chờ lấy hàng, Đang giao, Đã giao, Giao thất bại
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. BẢNG KHO 330 SẢN PHẨM THỰC TẾ (PRODUCTS)
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,                        -- Mã Moniu (MN-001 ... MN-330)
  tiktok_id VARCHAR(50),                                   -- Mã Shopee / TikTok Shop
  name TEXT NOT NULL,                                      -- Tên sản phẩm chính thức
  brand VARCHAR(100) DEFAULT 'NOUS',                       -- NOUS, LA POMME, MONONA, Moniu...
  category VARCHAR(100) DEFAULT 'Bộ quần áo bé',           -- 11 danh mục đồ bé chuẩn
  variants JSONB DEFAULT '[]'::jsonb,                      -- Các size có sẵn: NB, 0-3M, 3-6M, 6-9M...
  price NUMERIC DEFAULT 0,                                 -- Đơn giá niêm yết
  image TEXT,                                              -- Đường dẫn ảnh sản phẩm
  sold_count INT DEFAULT 0,                                -- Số lượng đã bán
  revenue NUMERIC DEFAULT 0,                               -- Doanh thu tích lũy
  description TEXT,                                        -- Mô tả sản phẩm
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. BẢNG CÀI ĐẶT CẤU HÌNH SHOP (STORE_SETTINGS)
CREATE TABLE IF NOT EXISTS public.store_settings (
  id VARCHAR(50) PRIMARY KEY DEFAULT 'default',
  store_name VARCHAR(100) DEFAULT 'Moniu Xin Chào',
  seller_name VARCHAR(100) DEFAULT 'Moniu Shop',
  seller_phone VARCHAR(20) DEFAULT '0987.654.321',
  seller_email VARCHAR(100) DEFAULT 'moniuxinchao@gmail.com',
  store_address TEXT DEFAULT 'TP. Hồ Chí Minh',
  tiktok_shop_name VARCHAR(100) DEFAULT 'Moniu Xin Chào',
  tiktok_shop_id VARCHAR(50) DEFAULT '1214757544',
  order_prefix VARCHAR(10) DEFAULT 'MN',
  order_random_length INT DEFAULT 7,
  default_shipping_fee NUMERIC DEFAULT 25000,
  free_shipping_threshold NUMERIC DEFAULT 500000,
  default_carrier VARCHAR(50) DEFAULT 'GHN',
  enable_cod BOOLEAN DEFAULT TRUE,
  enable_bank_transfer BOOLEAN DEFAULT TRUE,
  bank_name VARCHAR(100) DEFAULT 'MB Bank',
  bank_account VARCHAR(50) DEFAULT '0987654321',
  bank_account_name VARCHAR(100) DEFAULT 'MONIU XIN CHAO',
  bank_branch VARCHAR(100) DEFAULT 'Hồ Chí Minh',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. FUNCTION & TRIGGER: TỰ ĐỘNG CẬP NHẬT KHÁCH HÀNG & THĂNG HẠNG RANK KHI CÓ ĐƠN HÀNG
CREATE OR REPLACE FUNCTION public.fn_sync_customer_on_order()
RETURNS TRIGGER AS $func$
DECLARE
  v_phone VARCHAR(20);
  v_name VARCHAR(100);
  v_address TEXT;
  v_total_orders INT;
  v_total_spent NUMERIC;
  v_rank VARCHAR(50);
BEGIN
  v_phone := TRIM(NEW.customer_phone);
  v_name := TRIM(NEW.customer_name);
  v_address := TRIM(COALESCE(NEW.shipping_address, ''));

  IF v_phone IS NULL OR v_phone = '' THEN
    RETURN NEW;
  END IF;

  -- 1. Thêm khách hàng mới nếu chưa có trong DB
  INSERT INTO public.customers (phone, name, address, total_orders, total_spent, rank)
  VALUES (v_phone, v_name, v_address, 0, 0, 'Mầm Nhỏ')
  ON CONFLICT (phone) DO UPDATE
  SET 
    name = CASE WHEN EXCLUDED.name <> '' THEN EXCLUDED.name ELSE public.customers.name END,
    address = CASE WHEN EXCLUDED.address <> '' THEN EXCLUDED.address ELSE public.customers.address END,
    updated_at = NOW();

  -- 2. Tính lại tổng số đơn và tổng tiền mua của khách hàng này
  SELECT 
    COUNT(*), 
    COALESCE(SUM(total_amount), 0)
  INTO v_total_orders, v_total_spent
  FROM public.orders
  WHERE customer_phone = v_phone AND status <> 'Đã hủy';

  -- 3. Tự động xác định Hạng (Ranking) của khách:
  -- • Mẹ Kim Cương: Từ 10 đơn hoặc chi tiêu từ 6.000.000đ (Super VIP)
  -- • Mẹ Thông Thái: Từ 5 đơn hoặc chi tiêu từ 3.000.000đ (VIP Vàng)
  -- • Bé Ngoan: Từ 2 đơn hoặc chi tiêu từ 1.000.000đ (Khách quen)
  -- • Mầm Nhỏ: Đơn đầu tiên (Khách mới)
  IF v_total_spent >= 6000000 OR v_total_orders >= 10 THEN
    v_rank := 'Mẹ Kim Cương';
  ELSIF v_total_spent >= 3000000 OR v_total_orders >= 5 THEN
    v_rank := 'Mẹ Thông Thái';
  ELSIF v_total_spent >= 1000000 OR v_total_orders >= 2 THEN
    v_rank := 'Bé Ngoan';
  ELSE
    v_rank := 'Mầm Nhỏ';
  END IF;

  -- 4. Cập nhật số liệu mới nhất vào bảng khách hàng
  UPDATE public.customers
  SET 
    total_orders = v_total_orders,
    total_spent = v_total_spent,
    rank = v_rank,
    updated_at = NOW()
  WHERE phone = v_phone;

  RETURN NEW;
END;
$func$ LANGUAGE plpgsql;

-- Gắn trigger vào bảng orders
DROP TRIGGER IF EXISTS trg_sync_customer_on_order ON public.orders;
CREATE TRIGGER trg_sync_customer_on_order
AFTER INSERT OR UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.fn_sync_customer_on_order();

-- 6. CẤP QUYỀN TRUY CẬP ĐỌC GHI (ROW LEVEL SECURITY POLICIES)
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public all access on customers" ON public.customers;
CREATE POLICY "Allow public all access on customers" ON public.customers FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all access on orders" ON public.orders;
CREATE POLICY "Allow public all access on orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all access on products" ON public.products;
CREATE POLICY "Allow public all access on products" ON public.products FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all access on store_settings" ON public.store_settings;
CREATE POLICY "Allow public all access on store_settings" ON public.store_settings FOR ALL USING (true) WITH CHECK (true);

-- 7. BẬT TÍNH NĂNG REALTIME (ĐỒNG BỘ ĐA THIẾT BỊ LIVESTREAM)
DO $anon$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.orders, public.customers, public.products;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN NULL;
END $anon$;

-- 8. KHỞI TẠO DỮ LIỆU CÀI ĐẶT SHOP MẶC ĐỊNH
INSERT INTO public.store_settings (id, store_name, seller_name, seller_phone, store_address, tiktok_shop_id)
VALUES ('default', 'Moniu Xin Chào', 'Moniu Shop', '0987.654.321', 'TP. Hồ Chí Minh', '1214757544')
ON CONFLICT (id) DO NOTHING;
