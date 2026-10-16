import type { Order, Customer, CustomerRank } from '../types';
import { CUSTOMER_RANKS } from '../types';

/**
 * Tính toán Hạng (Rank) dựa trên tổng tiền chi tiêu và số lượng đơn hàng
 */
export function calculateCustomerRank(totalSpent: number, totalOrders: number): CustomerRank {
  if (totalSpent >= 6000000 || totalOrders >= 10) {
    return 'Mẹ Kim Cương';
  }
  if (totalSpent >= 3000000 || totalOrders >= 5) {
    return 'Mẹ Thông Thái';
  }
  if (totalSpent >= 1000000 || totalOrders >= 2) {
    return 'Bé Ngoan';
  }
  return 'Mầm Nhỏ';
}

/**
 * Gợi ý size tiếp theo cho bé dựa trên size đơn hàng trước đó
 */
export function getNextSuggestedBabySize(lastSize?: string): string {
  if (!lastSize) return '';
  const s = lastSize.toUpperCase();
  if (s.includes('NB') || s.includes('NEWBORN')) return 'Gợi ý: 0-3M (khoảng 3.5 - 5.5kg)';
  if (s.includes('0-3')) return 'Gợi ý: 3-6M hoặc 6-9M (khoảng 5 - 7.5kg)';
  if (s.includes('3-6')) return 'Gợi ý: 6-9M hoặc 9-12M (khoảng 7 - 9kg)';
  if (s.includes('6-9')) return 'Gợi ý: 9-12M hoặc 12-18M (khoảng 8.5 - 10.5kg)';
  if (s.includes('9-12')) return 'Gợi ý: 12-18M hoặc 18-24M (khoảng 10 - 12kg)';
  if (s.includes('12-18')) return 'Gợi ý: 18-24M hoặc 2-3Y (khoảng 11 - 13.5kg)';
  if (s.includes('18-24')) return 'Gợi ý: 2-3Y hoặc 3-4Y (khoảng 13 - 15kg)';
  return `Lần trước mẹ chọn size ${lastSize}`;
}

/**
 * Trích xuất danh sách khách hàng từ lịch sử đơn hàng
 */
export function deriveCustomersFromOrders(orders: Order[]): Customer[] {
  const customerMap = new Map<string, {
    name: string;
    phone: string;
    address: string;
    totalOrders: number;
    totalSpent: number;
    lastOrderDate: string;
    lastBabySize: string;
    createdAt: string;
    updatedAt: string;
  }>();

  // Sort orders chronological
  const sorted = [...orders].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  sorted.forEach((ord) => {
    const rawPhone = ord.customerPhone ? ord.customerPhone.trim() : '';
    if (!rawPhone || rawPhone.length < 8) return;

    const isCancelled = ord.status === 'Đã hủy';
    const existing = customerMap.get(rawPhone);

    // Extract size from items
    let foundSize = '';
    for (const it of ord.items || []) {
      if (it.variant && it.variant !== 'Tiêu chuẩn') {
        foundSize = it.variant;
        break;
      }
    }

    if (!existing) {
      customerMap.set(rawPhone, {
        name: ord.customerName || 'Khách quen',
        phone: rawPhone,
        address: ord.shippingAddress || '',
        totalOrders: isCancelled ? 0 : 1,
        totalSpent: isCancelled ? 0 : Number(ord.totalAmount) || 0,
        lastOrderDate: ord.createdAt,
        lastBabySize: foundSize,
        createdAt: ord.createdAt,
        updatedAt: ord.updatedAt || ord.createdAt,
      });
    } else {
      if (ord.customerName && ord.customerName !== 'Khách vãng lai') {
        existing.name = ord.customerName;
      }
      if (ord.shippingAddress && ord.shippingAddress !== 'Chưa cập nhật địa chỉ') {
        existing.address = ord.shippingAddress;
      }
      if (!isCancelled) {
        existing.totalOrders += 1;
        existing.totalSpent += Number(ord.totalAmount) || 0;
      }
      existing.lastOrderDate = ord.createdAt;
      if (foundSize) {
        existing.lastBabySize = foundSize;
      }
      existing.updatedAt = ord.updatedAt || ord.createdAt;
    }
  });

  return Array.from(customerMap.entries()).map(([phone, data]) => {
    const rank = calculateCustomerRank(data.totalSpent, data.totalOrders);
    return {
      id: `cust-${phone}`,
      phone,
      name: data.name,
      address: data.address,
      rank,
      totalOrders: data.totalOrders,
      totalSpent: data.totalSpent,
      lastOrderDate: data.lastOrderDate,
      lastBabySize: data.lastBabySize,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  });
}
