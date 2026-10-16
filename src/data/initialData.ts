import type { Order, ProductCatalogItem, CarrierStats, StoreSettings } from '../types';

export const INITIAL_PRODUCTS: ProductCatalogItem[] = [
  {
    code: 'B01',
    name: 'Set body chip sơ sinh 100% cotton Moniu',
    variants: ['Họa tiết sao vàng / 0-3M', 'Xanh mint mây / 3-6M', 'Hồng san hô / 6-9M', 'Vàng butter / 9-12M'],
    price: 189000,
    image: 'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=200&auto=format&fit=crop&q=80',
    soldCount: 0,
    revenue: 0,
    percentage: 0,
  },
  {
    code: 'B02',
    name: 'Bộ yếm gấu denim kèm áo cotton mềm cho bé',
    variants: ['Xanh denim / 1-2Y', 'Be ấm / 2-3Y', 'Xanh pastel / 3-4Y'],
    price: 269000,
    image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=200&auto=format&fit=crop&q=80',
    soldCount: 0,
    revenue: 0,
    percentage: 0,
  },
  {
    code: 'B03',
    name: 'Váy công chúa voan xòe Moniu đính nơ',
    variants: ['Hồng pastel / 1-2Y', 'Trắng kem / 2-3Y', 'Hồng san hô / 3-4Y'],
    price: 299000,
    image: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=200&auto=format&fit=crop&q=80',
    soldCount: 0,
    revenue: 0,
    percentage: 0,
  },
  {
    code: 'B04',
    name: 'Set đồ bộ thun lạnh mát mịn xuất Hàn',
    variants: ['Khủng long mint / 9-12M', 'Mèo con hồng / 1-2Y', 'Gấu vàng / 2-3Y'],
    price: 159000,
    image: 'https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?w=200&auto=format&fit=crop&q=80',
    soldCount: 0,
    revenue: 0,
    percentage: 0,
  },
  {
    code: 'B05',
    name: 'Áo khoác lông cừu tai gấu Moniu ấm áp',
    variants: ['Nâu gấu / 1-2Y', 'Trắng sữa / 2-3Y', 'Hồng đào / 3-4Y'],
    price: 349000,
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=200&auto=format&fit=crop&q=80',
    soldCount: 0,
    revenue: 0,
    percentage: 0,
  },
];

// Clean empty orders list - No fake or sample orders
export const INITIAL_ORDERS: Order[] = [];

export const INITIAL_CARRIERS: CarrierStats[] = [
  {
    id: 'GHN',
    name: 'GHN (Giao Hàng Nhanh)',
    logo: 'GHN',
    color: '#FF7043',
    badgeBg: '#FFF2EE',
    delivering: 0,
    success: 0,
    failed: 0,
  },
  {
    id: 'GHTK',
    name: 'GHTK (Giao Hàng Tiết Kiệm)',
    logo: 'GHTK',
    color: '#48C9B0',
    badgeBg: '#EBF9F6',
    delivering: 0,
    success: 0,
    failed: 0,
  },
  {
    id: 'J&T Express',
    name: 'J&T Express',
    logo: 'J&T',
    color: '#FF5B65',
    badgeBg: '#FFF0F1',
    delivering: 0,
    success: 0,
    failed: 0,
  },
];

export const INITIAL_SETTINGS: StoreSettings = {
  storeName: 'Moniu Xin chào — Baby and Kid Shop',
  sellerName: 'Mẹ Sóc (Moniu Admin)',
  sellerPhone: '0987 654 321',
  sellerEmail: 'moniuxinchao.baby@gmail.com',
  storeAddress: '720A Điện Biên Phủ, Phường 22, Bình Thạnh, TP. Hồ Chí Minh',
  tiktokShopName: 'Moniu Xin chào Official (@moniuxinchao.baby)',
  tiktokShopId: 'VN_MONIU_992810',
  orderPrefix: 'MN-',
  orderRandomLength: 7,
  defaultShippingFee: 25000,
  freeShippingThreshold: 399000,
  defaultCarrier: 'GHN',
  enableCod: true,
  enableBankTransfer: true,
  bankName: 'MB Bank (Quân Đội)',
  bankAccount: '098765432199',
  bankAccountName: 'MONIU XIN CHAO',
  bankBranch: 'Chi nhánh TP.HCM',
};

// Generates past 7 days with clean 0 data
export function getPast7Days() {
  const result = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    result.push({
      date: `${day}/${month}`,
      revenue: 0,
      orders: 0,
    });
  }
  return result;
}

export const REVENUE_7_DAYS = getPast7Days();
