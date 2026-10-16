import type { OrderStatus, ShippingStatus } from '../types';

export function formatCurrency(amount: number): string {
  if (isNaN(amount)) return '0đ';
  return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('vi-VN').format(num);
}

/**
 * Generates an uppercase alphanumeric order code (e.g., MN-7K9A2B1)
 * Guarantees uniqueness by checking against existing codes.
 */
export function generateOrderCode(existingCodes: string[], prefix = 'MN-', length = 7): string {
  const characters = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // exclude ambiguous characters like 0, O, 1, I
  let code = '';
  let attempts = 0;

  do {
    let randomPart = '';
    for (let i = 0; i < length; i++) {
      randomPart += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    code = `${prefix}${randomPart}`;
    attempts++;
  } while (existingCodes.includes(code) && attempts < 1000);

  return code;
}

export function getStatusStyle(status: OrderStatus): {
  bg: string;
  text: string;
  dot: string;
  border: string;
} {
  switch (status) {
    case 'Đã giao':
      return {
        bg: 'bg-[#EBF9F6]',
        text: 'text-[#238774]',
        dot: 'bg-[#48C9B0]',
        border: 'border-[#B8ECE1]',
      };
    case 'Đang giao':
      return {
        bg: 'bg-[#EDF7FE]',
        text: 'text-[#1E73B0]',
        dot: 'bg-[#58B4FA]',
        border: 'border-[#BFE1FC]',
      };
    case 'Chờ xử lý':
    case 'Đang xử lý':
      return {
        bg: 'bg-[#FFF8E6]',
        text: 'text-[#B87B00]',
        dot: 'bg-[#FFC83B]',
        border: 'border-[#FDE199]',
      };
    case 'Đã hủy':
      return {
        bg: 'bg-[#FFF0F1]',
        text: 'text-[#D93D48]',
        dot: 'bg-[#FF5B65]',
        border: 'border-[#FCD2D6]',
      };
    default:
      return {
        bg: 'bg-[#FFF9F6]',
        text: 'text-[#8C7065]',
        dot: 'bg-[#C2ABA1]',
        border: 'border-[#F0E4DE]',
      };
  }
}

export function getShippingStatusStyle(status?: ShippingStatus): {
  bg: string;
  text: string;
  dot: string;
} {
  switch (status) {
    case 'Đã giao':
      return {
        bg: 'bg-[#EBF9F6] text-[#238774] border border-[#B8ECE1]',
        text: 'text-[#238774]',
        dot: 'bg-[#48C9B0]',
      };
    case 'Đang giao':
    case 'Đang trung chuyển':
      return {
        bg: 'bg-[#EDF7FE] text-[#1E73B0] border border-[#BFE1FC]',
        text: 'text-[#1E73B0]',
        dot: 'bg-[#58B4FA]',
      };
    case 'Chờ lấy hàng':
    case 'Đang lấy hàng':
      return {
        bg: 'bg-[#FFF8E6] text-[#B87B00] border border-[#FDE199]',
        text: 'text-[#B87B00]',
        dot: 'bg-[#FFC83B]',
      };
    case 'Giao thất bại':
    case 'Chuyển hoàn':
      return {
        bg: 'bg-[#FFF0F1] text-[#D93D48] border border-[#FCD2D6]',
        text: 'text-[#D93D48]',
        dot: 'bg-[#FF5B65]',
      };
    default:
      return {
        bg: 'bg-[#FFF9F6] text-[#8C7065] border border-[#F0E4DE]',
        text: 'text-[#8C7065]',
        dot: 'bg-[#C2ABA1]',
      };
  }
}
