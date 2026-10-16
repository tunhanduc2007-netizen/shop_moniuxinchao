export type OrderStatus = 'Chờ xử lý' | 'Đang xử lý' | 'Đang giao' | 'Đã giao' | 'Đã hủy';

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

export type ActiveTab = 'overview' | 'create-order' | 'orders' | 'shipping' | 'reports' | 'settings';
