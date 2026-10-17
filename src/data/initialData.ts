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
    shortName: 'GHN',
    logo: 'GHN',
    color: '#F26522',
    badgeBg: '#FFF2EE',
    trackingUrlPrefix: 'https://donhang.ghn.vn/?order_code=',
    delivering: 0,
    success: 0,
    failed: 0,
  },
  {
    id: 'GHTK',
    name: 'GHTK (Giao Hàng Tiết Kiệm)',
    shortName: 'GHTK',
    logo: 'GHTK',
    color: '#009E5C',
    badgeBg: '#EBF9F6',
    trackingUrlPrefix: 'https://i.ghtk.vn/',
    delivering: 0,
    success: 0,
    failed: 0,
  },
  {
    id: 'J&T Express',
    name: 'J&T Express',
    shortName: 'J&T',
    logo: 'J&T',
    color: '#ED1C24',
    badgeBg: '#FFF0F1',
    trackingUrlPrefix: 'https://jtexpress.vn/vi/tracking?billcode=',
    delivering: 0,
    success: 0,
    failed: 0,
  },
  {
    id: 'Viettel Post',
    name: 'Viettel Post',
    shortName: 'VTPost',
    logo: 'VTP',
    color: '#EE0033',
    badgeBg: '#FFF0F3',
    trackingUrlPrefix: 'https://viettelpost.com.vn/tra-cuu-hanh-trinh-don-hang?code=',
    delivering: 0,
    success: 0,
    failed: 0,
  },
  {
    id: 'SPX Express',
    name: 'SPX Express (Shopee Express)',
    shortName: 'SPX',
    logo: 'SPX',
    color: '#EE4D2D',
    badgeBg: '#FFF3F0',
    trackingUrlPrefix: 'https://spx.vn/track?',
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
