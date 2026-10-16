export type OrderStatus = 'Chờ thông tin' | 'Chờ xử lý' | 'Đang xử lý' | 'Đang giao' | 'Đã giao' | 'Đã hủy';

export type PaymentMethod = 'COD' | 'Chuyển khoản';

export type ShippingCarrier = 'GHN' | 'GHTK' | 'J&T Express' | 'Viettel Post';

export type ShippingStatus = 'Chờ lấy hàng' | 'Đang lấy hàng' | 'Đang trung chuyển' | 'Đang giao' | 'Đã giao' | 'Giao thất bại' | 'Chuyển hoàn';

export interface OrderItem {
  id: string;
  productCode: string;
  productName: string;
  variant: string; // e.g. "Đen / M", "Trắng / L"
  unitPrice: number;
  quantity: number;
  image?: string;
}

export interface Order {
  id: string;
  code: string; // e.g. "DH-7K9A2B1"
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  isPaid: boolean;
  status: OrderStatus;
  carrier: ShippingCarrier;
  trackingCode?: string;
  shippingStatus?: ShippingStatus;
  orderNote?: string;
  isPendingInfo?: boolean; // Đơn giữ đồ trên live, chờ khách inbox SĐT/địa chỉ
  holdExpiresAt?: string; // Hạn giữ đồ
  createdAt: string; // ISO string or format "16/10/2025 10:23"
  timeString: string; // e.g. "10:23"
  updatedAt: string;
}

export interface ProductCatalogItem {
  code: string;
  tiktokId?: string;
  name: string;
  brand?: string;
  category?: string;
  variants: string[];
  price: number;
  image: string;
  soldCount: number;
  revenue: number;
  percentage: number;
  description?: string;
}

export interface CarrierStats {
  id: ShippingCarrier;
  name: string;
  logo: string;
  color: string;
  badgeBg: string;
  delivering: number;
  success: number;
  failed: number;
}

export interface StoreSettings {
  storeName: string;
  sellerName: string;
  sellerPhone: string;
  sellerEmail: string;
  storeAddress: string;
  tiktokShopName: string;
  tiktokShopId: string;
  orderPrefix: string;
  orderRandomLength: number;
  defaultShippingFee: number;
  freeShippingThreshold: number;
  defaultCarrier: ShippingCarrier;
  enableCod: boolean;
  enableBankTransfer: boolean;
  bankName: string;
  bankAccount: string;
  bankAccountName: string;
  bankBranch: string;
}

export type CustomerRank = 'Mầm Nhỏ' | 'Bé Ngoan' | 'Mẹ Thông Thái' | 'Mẹ Kim Cương';

export interface CustomerRankInfo {
  rank: CustomerRank;
  label: string;
  badgeBg: string;
  badgeText: string;
  border: string;
  discountPercent: number; // % giảm giá tự động
  icon: string;
  minSpent: number;
  minOrders: number;
  perks: string;
}

export const CUSTOMER_RANKS: Record<CustomerRank, CustomerRankInfo> = {
  'Mầm Nhỏ': {
    rank: 'Mầm Nhỏ',
    label: 'Hạng Mầm Nhỏ (Khách mới)',
    badgeBg: 'bg-[#FFF0F1]',
    badgeText: 'text-[#FF5B65]',
    border: 'border-[#FCD2D6]',
    discountPercent: 0,
    icon: '🥉',
    minSpent: 0,
    minOrders: 1,
    perks: 'Tặng sticker Nous & thiệp cảm ơn Moniu',
  },
  'Bé Ngoan': {
    rank: 'Bé Ngoan',
    label: 'Hạng Bé Ngoan (Khách quen)',
    badgeBg: 'bg-[#FFF8E6]',
    badgeText: 'text-[#B87B00]',
    border: 'border-[#FDE199]',
    discountPercent: 3, // Giảm 3%
    icon: '🥈',
    minSpent: 1000000,
    minOrders: 2,
    perks: 'Giảm 3% tự động đơn live + Freeship từ 299k',
  },
  'Mẹ Thông Thái': {
    rank: 'Mẹ Thông Thái',
    label: 'Mẹ Thông Thái (Khách VIP)',
    badgeBg: 'bg-[#EBF9F6]',
    badgeText: 'text-[#238774]',
    border: 'border-[#B8ECE1]',
    discountPercent: 5, // Giảm 5%
    icon: '🥇',
    minSpent: 3000000,
    minOrders: 5,
    perks: 'Giảm 5% tự động + Quà sinh nhật bé + Ưu tiên soạn đơn',
  },
  'Mẹ Kim Cương': {
    rank: 'Mẹ Kim Cương',
    label: 'Mẹ Kim Cương (Super VIP)',
    badgeBg: 'bg-[#F6F1FE]',
    badgeText: 'text-[#8050D9]',
    border: 'border-[#E7DBFC]',
    discountPercent: 8, // Giảm 8%
    icon: '💎',
    minSpent: 6000000,
    minOrders: 10,
    perks: 'Giảm 8% trọn đời + Luôn Freeship + Quà BST độc quyền',
  },
};

export interface Customer {
  id: string;
  phone: string;
  name: string;
  address?: string;
  rank: CustomerRank;
  totalOrders: number;
  totalSpent: number;
  notes?: string;
  lastOrderDate?: string;
  lastBabySize?: string;
  createdAt: string;
  updatedAt: string;
}

export type ActiveTab = 'overview' | 'create-order' | 'orders' | 'customers' | 'products' | 'shipping' | 'reports' | 'settings';

