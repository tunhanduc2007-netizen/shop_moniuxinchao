import type { Order, ProductCatalogItem, CarrierStats, StoreSettings } from '../types';
import { REAL_PRODUCTS } from './realProducts';

// 330 REAL products imported directly from TikTok Shop seller inventory
export const INITIAL_PRODUCTS: ProductCatalogItem[] = REAL_PRODUCTS;

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
  tiktokShopId: '1214757544',
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
