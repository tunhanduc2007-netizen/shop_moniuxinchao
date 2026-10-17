import React from 'react';
import type { ShippingCarrier, ShippingStatus, TrackingTimelineEvent, Order } from '../types';

export interface CarrierMetadata {
  id: ShippingCarrier;
  name: string;
  shortName: string;
  brandColor: string;
  gradient: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  trackingPrefix: string;
  trackingUrl: (code: string) => string;
  hotline: string;
  website: string;
}

export const CARRIERS_METADATA: Record<ShippingCarrier, CarrierMetadata> = {
  GHN: {
    id: 'GHN',
    name: 'GHN (Giao Hàng Nhanh)',
    shortName: 'GHN',
    brandColor: '#F26522',
    gradient: 'from-[#F26522] to-[#FF8A50]',
    badgeBg: '#FFF2EE',
    badgeText: '#C44307',
    borderColor: '#FFD4C2',
    trackingPrefix: 'GHN',
    trackingUrl: (code) => `https://donhang.ghn.vn/?order_code=${encodeURIComponent(code)}`,
    hotline: '1900 636677',
    website: 'https://ghn.vn',
  },
  GHTK: {
    id: 'GHTK',
    name: 'GHTK (Giao Hàng Tiết Kiệm)',
    shortName: 'GHTK',
    brandColor: '#009E5C',
    gradient: 'from-[#009E5C] to-[#20C07B]',
    badgeBg: '#EBF9F6',
    badgeText: '#006B3E',
    borderColor: '#B8ECE1',
    trackingPrefix: 'S22.MN',
    trackingUrl: (code) => `https://i.ghtk.vn/${encodeURIComponent(code)}`,
    hotline: '1900 6092',
    website: 'https://giaohangtietkiem.vn',
  },
  'J&T Express': {
    id: 'J&T Express',
    name: 'J&T Express',
    shortName: 'J&T',
    brandColor: '#ED1C24',
    gradient: 'from-[#ED1C24] to-[#FF4D54]',
    badgeBg: '#FFF0F1',
    badgeText: '#C00F15',
    borderColor: '#FCD2D6',
    trackingPrefix: '84',
    trackingUrl: (code) => `https://jtexpress.vn/vi/tracking?billcode=${encodeURIComponent(code)}`,
    hotline: '1900 1088',
    website: 'https://jtexpress.vn',
  },
  'Viettel Post': {
    id: 'Viettel Post',
    name: 'Viettel Post',
    shortName: 'VTPost',
    brandColor: '#EE0033',
    gradient: 'from-[#EE0033] to-[#B30026]',
    badgeBg: '#FFF0F3',
    badgeText: '#A80024',
    borderColor: '#FFCCD5',
    trackingPrefix: 'VT',
    trackingUrl: (code) =>
      `https://viettelpost.com.vn/tra-cuu-hanh-trinh-don-hang?code=${encodeURIComponent(code)}`,
    hotline: '1900 8095',
    website: 'https://viettelpost.com.vn',
  },
  'SPX Express': {
    id: 'SPX Express',
    name: 'SPX Express (Shopee Express)',
    shortName: 'SPX',
    brandColor: '#EE4D2D',
    gradient: 'from-[#EE4D2D] to-[#FF6B4A]',
    badgeBg: '#FFF3F0',
    badgeText: '#C43113',
    borderColor: '#FFD3C9',
    trackingPrefix: 'SPXVN',
    trackingUrl: (code) => `https://spx.vn/track?${encodeURIComponent(code)}`,
    hotline: '1900 1221',
    website: 'https://spx.vn',
  },
};

/**
 * Generates an authentic carrier-formatted tracking code
 */
export function generateCarrierTrackingCode(
  carrier: ShippingCarrier,
  orderCode?: string
): string {
  const cleanOrderSuffix =
    (orderCode || '').replace(/\D/g, '') ||
    Math.floor(100000 + Math.random() * 900000).toString();

  switch (carrier) {
    case 'GHN': {
      const rand = Math.floor(100000 + Math.random() * 900000);
      return `GHN${cleanOrderSuffix.slice(-4)}${rand.toString().slice(0, 4)}`;
    }
    case 'GHTK': {
      const rand = cleanOrderSuffix.slice(-6).padStart(6, '9');
      return `S22.MN.${rand}`;
    }
    case 'J&T Express': {
      const rand = Math.floor(1000000000 + Math.random() * 9000000000);
      return `84${rand}`;
    }
    case 'Viettel Post': {
      const rand = Math.floor(10000000 + Math.random() * 90000000);
      return `VT${rand}VN`;
    }
    case 'SPX Express': {
      const rand = Math.floor(1000000000 + Math.random() * 9000000000);
      return `SPXVN0${rand.toString().slice(0, 9)}`;
    }
    default:
      return `GHN${Math.floor(10000000 + Math.random() * 90000000)}`;
  }
}

/**
 * Gets direct official tracking link for customer and shop
 */
export function getCarrierTrackingUrl(
  carrier: ShippingCarrier,
  trackingCode?: string
): string {
  if (!trackingCode) return '#';
  const meta = CARRIERS_METADATA[carrier] || CARRIERS_METADATA['GHN'];
  return meta.trackingUrl(trackingCode);
}

/**
 * Carrier Logo Badge Component - High visual polish
 */
export const CarrierLogoBadge: React.FC<{
  carrier: ShippingCarrier;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
}> = ({ carrier, size = 'md', showName = false }) => {
  const meta = CARRIERS_METADATA[carrier] || CARRIERS_METADATA['GHN'];

  const sizeClasses = {
    sm: 'w-6 h-6 text-[9px] rounded-lg',
    md: 'w-10 h-10 text-xs rounded-2xl',
    lg: 'w-12 h-12 text-sm rounded-2xl',
  }[size];

  // Render official custom visual badge
  const renderVisual = () => {
    switch (carrier) {
      case 'GHN':
        return (
          <span className="font-black tracking-tighter uppercase font-['Nunito',sans-serif] flex items-center justify-center">
            GHN
          </span>
        );
      case 'GHTK':
        return (
          <span className="font-black tracking-tighter uppercase font-['Nunito',sans-serif] flex items-center justify-center">
            GHTK
          </span>
        );
      case 'J&T Express':
        return (
          <span className="font-black italic tracking-tighter uppercase font-['Nunito',sans-serif] flex items-center justify-center">
            J&T
          </span>
        );
      case 'Viettel Post':
        return (
          <span className="font-black tracking-tighter uppercase font-['Nunito',sans-serif] flex items-center justify-center leading-none text-center">
            VTP
          </span>
        );
      case 'SPX Express':
        return (
          <span className="font-black tracking-tighter uppercase font-['Nunito',sans-serif] flex items-center justify-center">
            SPX
          </span>
        );
      default:
        return <span>{(carrier as string).slice(0, 3)}</span>;
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div
        className={`${sizeClasses} flex items-center justify-center text-white shadow-xs font-black shrink-0 transition-transform hover:scale-105`}
        style={{
          backgroundColor: meta.brandColor,
          backgroundImage: `linear-gradient(135deg, ${meta.brandColor}, ${meta.brandColor}E6)`,
        }}
        title={`${meta.name} - Hotline: ${meta.hotline}`}
      >
        {renderVisual()}
      </div>
      {showName && (
        <span className="font-bold text-[#3D271D] text-xs font-['Nunito',sans-serif]">
          {meta.shortName}
        </span>
      )}
    </div>
  );
};

/**
 * Generates an end-to-end 5-step delivery journey timeline
 */
export function generateTrackingTimeline(
  carrier: ShippingCarrier,
  order: Order
): TrackingTimelineEvent[] {
  const currentStatus = order.shippingStatus || 'Chờ lấy hàng';
  const meta = CARRIERS_METADATA[carrier] || CARRIERS_METADATA['GHN'];

  const baseDate = order.createdAt.split(' ')[0] || '17/10/2026';
  const recipientCity = order.shippingAddress.includes('Hà Nội')
    ? 'Hà Nội'
    : order.shippingAddress.includes('Đà Nẵng')
    ? 'Đà Nẵng'
    : 'TP. Hồ Chí Minh';

  const stages: {
    statusKey: ShippingStatus;
    title: string;
    location: string;
    desc: string;
    shipperName?: string;
    shipperPhone?: string;
    offsetMinutes: number;
  }[] = [
    {
      statusKey: 'Chờ lấy hàng',
      title: 'Shop đã tạo vận đơn & đóng gói',
      location: 'Kho Tổng Moniu — 720A Điện Biên Phủ, TP.HCM',
      desc: `Đơn hàng #${order.code} đã được nhân viên Moniu kiểm đếm đồ bé, đóng gói cẩn thận và dán mã vận đơn ${order.trackingCode}. Đang chờ shipper ${meta.shortName} qua lấy.`,
      offsetMinutes: 10,
    },
    {
      statusKey: 'Đang lấy hàng',
      title: `${meta.shortName} đã nhận hàng tại shop`,
      location: `Bưu cục ${meta.shortName} Bình Thạnh, TP.HCM`,
      desc: `Bưu tá đã tới kho Moniu nhận kiện hàng, quét mã ${order.trackingCode} vào hệ thống và đưa về bưu cục trung tâm.`,
      shipperName: 'Nguyễn Văn Tuấn',
      shipperPhone: '0912 345 678',
      offsetMinutes: 90,
    },
    {
      statusKey: 'Đang trung chuyển',
      title: `Nhập kho tổng khai thác & phân loại`,
      location: `Trung tâm phân loại hàng ${meta.shortName} SOC miền Nam`,
      desc: `Kiện hàng đã qua băng chuyền tự động phân loại và đang được vận chuyển liên tỉnh trên xe tải thùng kín chuyên dụng hướng về ${recipientCity}.`,
      offsetMinutes: 360,
    },
    {
      statusKey: 'Đang giao',
      title: `Bưu tá đang giao hàng tận nơi`,
      location: `Bưu cục phát gần địa chỉ người nhận (${recipientCity})`,
      desc: `Bưu tá đang mang gói đồ bé đi giao tới địa chỉ: ${order.shippingAddress}. Quý khách vui lòng để ý điện thoại nhận hàng.`,
      shipperName: 'Trần Văn Hoàng (Bưu tá phụ trách tuyến)',
      shipperPhone: '0988 765 432',
      offsetMinutes: 1200,
    },
    {
      statusKey: 'Đã giao',
      title: `Giao hàng thành công & Hoàn tất`,
      location: order.shippingAddress,
      desc: `Đơn hàng đã được giao thành công cho khách hàng: ${order.customerName}. Hình thức: ${order.paymentMethod} (Đã thu ${order.totalAmount > 0 ? (new Intl.NumberFormat('vi-VN').format(order.totalAmount) + 'đ') : '0đ'}).`,
      offsetMinutes: 1440,
    },
  ];

  const statusHierarchy: Record<ShippingStatus, number> = {
    'Chờ lấy hàng': 1,
    'Đang lấy hàng': 2,
    'Đang trung chuyển': 3,
    'Đang giao': 4,
    'Đã giao': 5,
    'Giao thất bại': 4,
    'Chuyển hoàn': 5,
  };

  const currentLevel = statusHierarchy[currentStatus] || 1;

  return stages.map((stage, idx) => {
    const stageLevel = idx + 1;
    const isPassed = stageLevel < currentLevel;
    const isCurrent = stageLevel === currentLevel;
    const isPending = stageLevel > currentLevel;

    return {
      date: baseDate,
      time: `${String(8 + (idx * 3) % 12).padStart(2, '0')}:${String((idx * 17) % 60).padStart(2, '0')}`,
      status: stage.title,
      location: stage.location,
      description: stage.desc,
      shipperName: stage.shipperName,
      shipperPhone: stage.shipperPhone,
      completed: isPassed || (isCurrent && currentStatus === 'Đã giao'),
      isCurrent: isCurrent && currentStatus !== 'Đã giao',
    };
  });
}
