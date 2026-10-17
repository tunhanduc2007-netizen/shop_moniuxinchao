import React, { useState, useMemo } from 'react';
import {
  Truck,
  Package,
  Search,
  Filter,
  Copy,
  Check,
  CheckCircle2,
  Clock,
  Heart,
  ExternalLink,
  Navigation,
  RefreshCw,
  Plus,
  ShieldCheck,
  Phone,
  AlertTriangle,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { INITIAL_CARRIERS } from '../data/initialData';
import type { Order, ShippingCarrier, ShippingStatus } from '../types';
import { formatCurrency, getShippingStatusStyle } from '../utils/formatters';
import {
  CARRIERS_METADATA,
  CarrierLogoBadge,
  getCarrierTrackingUrl,
  generateCarrierTrackingCode,
} from '../utils/carrierUtils';
import { TrackingTimelineModal } from '../components/TrackingTimelineModal';

export const ShippingPage: React.FC = () => {
  const { orders, updateShippingStatus, setSelectedOrderForModal, addOrder, setActiveTab } =
    useShop();
  const [carrierFilter, setCarrierFilter] = useState<string>('all');
  const [shippingStatusFilter, setShippingStatusFilter] = useState<string>('all');
  const [searchCode, setSearchCode] = useState('');
  const [copiedTracking, setCopiedTracking] = useState<string | null>(null);
  const [selectedOrderForTimeline, setSelectedOrderForTimeline] = useState<Order | null>(null);

  // Filtered orders list for shipping (excluding pending unconfirmed holds)
  const shippingOrders = useMemo(() => {
    return orders.filter((o) => {
      // Exclude hold orders without contact info
      if (o.status === 'Chờ thông tin' || o.isPendingInfo) return false;

      const matchCarrier = carrierFilter === 'all' || o.carrier === carrierFilter;
      const matchStatus =
        shippingStatusFilter === 'all' || o.shippingStatus === shippingStatusFilter;
      const query = searchCode.toLowerCase().trim();
      const matchSearch =
        !query ||
        (o.trackingCode && o.trackingCode.toLowerCase().includes(query)) ||
        o.code.toLowerCase().includes(query) ||
        o.customerName.toLowerCase().includes(query) ||
        o.customerPhone.toLowerCase().includes(query);

      return matchCarrier && matchStatus && matchSearch;
    });
  }, [orders, carrierFilter, shippingStatusFilter, searchCode]);

  // Dynamic 5-carrier statistics calculated directly from real orders
  const dynamicCarriers = useMemo(() => {
    return INITIAL_CARRIERS.map((c) => {
      const carrierOrders = orders.filter(
        (o) => o.carrier === c.id && o.status !== 'Chờ thông tin' && !o.isPendingInfo
      );
      const delivering = carrierOrders.filter(
        (o) =>
          o.shippingStatus === 'Đang giao' ||
          o.shippingStatus === 'Đang trung chuyển' ||
          o.shippingStatus === 'Đang lấy hàng'
      ).length;
      const success = carrierOrders.filter((o) => o.shippingStatus === 'Đã giao').length;
      const failed = carrierOrders.filter(
        (o) => o.shippingStatus === 'Giao thất bại' || o.shippingStatus === 'Chuyển hoàn'
      ).length;
      const totalCarrier = carrierOrders.length;
      const successRate = totalCarrier > 0 ? Math.round((success / totalCarrier) * 100) : 0;

      return {
        ...c,
        delivering,
        success,
        failed,
        successRate,
        total: totalCarrier,
      };
    });
  }, [orders]);

  // Overall delivery KPI summary
  const totalDelivering = useMemo(
    () =>
      orders.filter(
        (o) =>
          o.shippingStatus === 'Đang giao' ||
          o.shippingStatus === 'Đang trung chuyển' ||
          o.shippingStatus === 'Đang lấy hàng'
      ).length,
    [orders]
  );

  const totalDelivered = useMemo(
    () => orders.filter((o) => o.shippingStatus === 'Đã giao').length,
    [orders]
  );

  const handleCopyTracking = (code?: string) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedTracking(code);
    setTimeout(() => setCopiedTracking(null), 2000);
  };

  const shippingStatuses: ShippingStatus[] = [
    'Chờ lấy hàng',
    'Đang lấy hàng',
    'Đang trung chuyển',
    'Đang giao',
    'Đã giao',
    'Giao thất bại',
    'Chuyển hoàn',
  ];

  // Helper to create a realistic sample order for demonstration if table is empty
  const handleCreateSampleShippingOrder = async (carrierTarget: ShippingCarrier) => {
    const carrierName = carrierTarget;
    const sampleNames = [
      'Mẹ Bắp (Thanh Thảo)',
      'Mẹ Sóc (Hồng Nhung)',
      'Mẹ Gạo (Minh Anh)',
      'Mẹ Đậu (Phương Linh)',
      'Mẹ Dâu (Thu Trang)',
    ];
    const samplePhones = [
      '0987 123 456',
      '0912 345 678',
      '0909 888 777',
      '0933 666 999',
      '0977 555 444',
    ];
    const sampleAddresses = [
      'Số 12 Cầu Giấy, Phường Quan Hoa, Quận Cầu Giấy, Hà Nội',
      '720A Điện Biên Phủ, Phường 22, Quận Bình Thạnh, TP. Hồ Chí Minh',
      '45 Lê Duẩn, Phường Hải Châu 1, Quận Hải Châu, Đà Nẵng',
      '128 Nguyễn Thị Minh Khai, Phường 6, Quận 3, TP. Hồ Chí Minh',
      '88 Trần Hưng Đạo, Phường Cửa Nam, Quận Hoàn Kiếm, Hà Nội',
    ];

    const randomIndex = Math.floor(Math.random() * sampleNames.length);
    const trackingCode = generateCarrierTrackingCode(carrierTarget);

    await addOrder({
      customerName: sampleNames[randomIndex],
      customerPhone: samplePhones[randomIndex],
      shippingAddress: sampleAddresses[randomIndex],
      carrier: carrierTarget,
      trackingCode,
      status: 'Đang giao',
      shippingStatus: 'Đang giao',
      items: [
        {
          id: Math.random().toString(),
          productCode: 'MN-001',
          productName: 'Bộ dài tay Nous cài vai nỉ bông mềm ấm cho bé',
          variant: 'Xanh Mint / 6-9M',
          unitPrice: 185000,
          quantity: 1,
        },
      ],
      subtotal: 185000,
      shippingFee: 25000,
      discount: 0,
      totalAmount: 210000,
      paymentMethod: 'COD',
      orderNote: `Đơn live mẫu thử nghiệm hãng ${carrierTarget}`,
    });
  };

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto notranslate" translate="no">
      {/* Page Title & KPI Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl font-black text-[#3D271D] tracking-tight font-['Nunito',sans-serif]">
              Quản lý vận chuyển
            </h1>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#EBF9F6] text-[#238774] border border-[#B8ECE1] flex items-center gap-1.5 shadow-2xs">
              <Heart className="w-3.5 h-3.5 fill-current text-[#238774]" />
              5 Đối tác GHN, GHTK, J&T, Viettel Post, SPX Express
            </span>
          </div>
          <p className="text-sm text-[#8C7065] mt-1 font-medium">
            Theo dõi tiến độ, mã vận đơn, hành trình bưu tá và đối soát COD thời gian thực
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="px-3.5 py-2 rounded-2xl bg-white border border-[#FDE2E4] shadow-2xs flex items-center gap-2 text-xs">
            <span className="text-[#8C7065] font-medium">Đang luân chuyển:</span>
            <span className="font-black text-[#FF5B65] font-['Nunito',sans-serif] text-sm">
              {totalDelivering}
            </span>
          </div>
          <div className="px-3.5 py-2 rounded-2xl bg-[#EBF9F6] border border-[#B8ECE1] shadow-2xs flex items-center gap-2 text-xs">
            <span className="text-[#238774] font-medium">Đã giao thành công:</span>
            <span className="font-black text-[#238774] font-['Nunito',sans-serif] text-sm">
              {totalDelivered}
            </span>
          </div>
        </div>
      </div>

      {/* 5-CARRIER CARDS GRID (GHN, GHTK, J&T Express, Viettel Post, SPX Express) */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-black text-[#3D271D] uppercase tracking-wider font-['Nunito',sans-serif] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#FF5B65]" />
            5 Đối tác vận chuyển chính thức Moniu
          </span>
          <span className="text-xs text-[#8C7065] font-semibold">
            Bấm thẻ để lọc nhanh danh sách đơn
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {dynamicCarriers.map((carrier) => {
            const meta = CARRIERS_METADATA[carrier.id] || CARRIERS_METADATA['GHN'];
            const isSelected = carrierFilter === carrier.id;

            return (
              <div
                key={carrier.id}
                onClick={() => setCarrierFilter(isSelected ? 'all' : carrier.id)}
                className={`bg-white rounded-3xl p-4 sm:p-5 border transition-all cursor-pointer relative overflow-hidden group ${
                  isSelected
                    ? 'border-[#FF5B65] shadow-md ring-2 ring-[#FF5B65]/20 scale-[1.02]'
                    : 'border-[#FDE2E4] shadow-2xs hover:shadow-md hover:border-[#FCD2D6]'
                }`}
              >
                {/* Active Indicator Strip */}
                {isSelected && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-[#FF5B65]" />
                )}

                <div className="flex items-center justify-between">
                  <CarrierLogoBadge carrier={carrier.id} size="md" />

                  {isSelected ? (
                    <span className="text-[10px] font-black text-[#FF5B65] bg-[#FFF0F1] px-2.5 py-0.5 rounded-full border border-[#FCD2D6]">
                      Đang lọc
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-[#8C7065] bg-[#FFF9F6] px-2 py-0.5 rounded-full border border-[#FDE2E4]">
                      {meta.shortName}
                    </span>
                  )}
                </div>

                <div className="mt-3.5">
                  <h3 className="font-black text-[#3D271D] text-sm font-['Nunito',sans-serif] truncate">
                    {carrier.name}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-[#8C7065] mt-1 font-semibold">
                    <span>Tỷ lệ thành công:</span>
                    <span className="font-extrabold text-[#238774] font-['Nunito',sans-serif]">
                      {carrier.successRate}%
                    </span>
                  </div>
                </div>

                {/* Micro Stats Row */}
                <div className="grid grid-cols-3 gap-1.5 mt-3.5 pt-3 border-t border-[#FFF0F1] text-center text-xs">
                  <div className="bg-[#FFF9F6] rounded-xl py-1 px-0.5">
                    <p className="text-[10px] text-[#8C7065] font-medium">Đang giao</p>
                    <p className="font-black text-[#3D271D] font-['Nunito',sans-serif] mt-0.5">
                      {carrier.delivering}
                    </p>
                  </div>
                  <div className="bg-[#EBF9F6] rounded-xl py-1 px-0.5">
                    <p className="text-[10px] text-[#238774] font-medium">Thành công</p>
                    <p className="font-black text-[#238774] font-['Nunito',sans-serif] mt-0.5">
                      {carrier.success}
                    </p>
                  </div>
                  <div className="bg-[#FFF0F1] rounded-xl py-1 px-0.5">
                    <p className="text-[10px] text-[#D93D48] font-medium">Thất bại</p>
                    <p className="font-black text-[#D93D48] font-['Nunito',sans-serif] mt-0.5">
                      {carrier.failed}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#FDE2E4] shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-[#8C7065] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              placeholder="Tìm theo mã vận đơn (GHN..., VT..., SPXVN...), mã đơn (MN-...) hoặc tên mẹ..."
              className="w-full bg-[#FFF9F6] focus:bg-white text-xs text-[#3D271D] pl-10 pr-3.5 py-2.5 rounded-2xl border border-[#FDE2E4] focus:outline-hidden focus:border-[#FF5B65] font-medium"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={carrierFilter}
              onChange={(e) => setCarrierFilter(e.target.value)}
              className="w-full bg-[#FFF9F6] text-xs font-bold text-[#3D271D] px-3.5 py-2.5 rounded-2xl border border-[#FDE2E4] focus:outline-hidden focus:border-[#FF5B65] cursor-pointer"
            >
              <option value="all">Tất cả 5 hãng vận chuyển</option>
              <option value="GHN">GHN (Giao Hàng Nhanh)</option>
              <option value="GHTK">GHTK (Giao Hàng Tiết Kiệm)</option>
              <option value="J&T Express">J&T Express</option>
              <option value="Viettel Post">Viettel Post</option>
              <option value="SPX Express">SPX Express (Shopee Express)</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={shippingStatusFilter}
              onChange={(e) => setShippingStatusFilter(e.target.value)}
              className="w-full bg-[#FFF9F6] text-xs font-bold text-[#3D271D] px-3.5 py-2.5 rounded-2xl border border-[#FDE2E4] focus:outline-hidden focus:border-[#FF5B65] cursor-pointer"
            >
              <option value="all">Tất cả trạng thái vận chuyển</option>
              {shippingStatuses.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>

        {carrierFilter !== 'all' && (
          <div className="flex items-center gap-2 pt-2 border-t border-[#FFF0F1] text-xs text-[#8C7065]">
            <span>Đang lọc theo hãng:</span>
            <span className="font-black text-[#FF5B65] bg-[#FFF0F1] px-2.5 py-0.5 rounded-xl border border-[#FCD2D6]">
              {carrierFilter}
            </span>
            <button
              onClick={() => setCarrierFilter('all')}
              className="text-[#FF5B65] hover:underline font-bold ml-1 cursor-pointer"
            >
              Hủy lọc
            </button>
          </div>
        )}
      </div>

      {/* Shipping Orders Table */}
      <div className="bg-white rounded-3xl border border-[#FDE2E4] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead>
              <tr className="bg-[#FFF9F6] text-[#8C7065] border-b border-[#FDE2E4] font-bold">
                <th className="py-3.5 px-4">Mã vận đơn & Hãng</th>
                <th className="py-3.5 px-3">Mã đơn Moniu</th>
                <th className="py-3.5 px-3">Người nhận (Mẹ & Bé)</th>
                <th className="py-3.5 px-3 text-center">Thu hộ COD</th>
                <th className="py-3.5 px-3 text-center">Trạng thái giao</th>
                <th className="py-3.5 px-3 text-right">Ngày gửi</th>
                <th className="py-3.5 px-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#FFF0F1]">
              {shippingOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-[#8C7065]">
                    <div className="max-w-md mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#FFF0F1] text-[#FF5B65] mx-auto flex items-center justify-center">
                        <Truck className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-bold text-[#3D271D]">
                        Chưa có vận đơn nào phù hợp với bộ lọc hiện tại.
                      </p>
                      <p className="text-xs text-[#8C7065]">
                        Khi bạn chốt đơn live hoặc chuyển đơn sang trạng thái giao hàng, hệ thống
                        sẽ tự động cấp mã vận đơn chuẩn của hãng và hiển thị tại đây.
                      </p>

                      {/* Quick test buttons to create sample order for each carrier */}
                      <div className="pt-2">
                        <p className="text-xs font-bold text-[#3D271D] mb-2">
                          ⚡ Bấm tạo nhanh 1 vận đơn mẫu để kiểm tra:
                        </p>
                        <div className="flex flex-wrap justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleCreateSampleShippingOrder('GHN')}
                            className="px-2.5 py-1 text-[11px] font-bold rounded-xl bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100 cursor-pointer"
                          >
                            + Mẫu GHN
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCreateSampleShippingOrder('GHTK')}
                            className="px-2.5 py-1 text-[11px] font-bold rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 cursor-pointer"
                          >
                            + Mẫu GHTK
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCreateSampleShippingOrder('J&T Express')}
                            className="px-2.5 py-1 text-[11px] font-bold rounded-xl bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 cursor-pointer"
                          >
                            + Mẫu J&T
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCreateSampleShippingOrder('Viettel Post')}
                            className="px-2.5 py-1 text-[11px] font-bold rounded-xl bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 cursor-pointer"
                          >
                            + Mẫu Viettel Post
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCreateSampleShippingOrder('SPX Express')}
                            className="px-2.5 py-1 text-[11px] font-bold rounded-xl bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 cursor-pointer"
                          >
                            + Mẫu SPX Express
                          </button>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                shippingOrders.map((ord) => {
                  const shipStyle = getShippingStatusStyle(ord.shippingStatus);
                  const carrier = ord.carrier || 'GHN';
                  const meta = CARRIERS_METADATA[carrier] || CARRIERS_METADATA['GHN'];
                  const trackingUrl = getCarrierTrackingUrl(carrier, ord.trackingCode);

                  return (
                    <tr
                      key={ord.id}
                      className="hover:bg-[#FFF9F6] transition-colors cursor-pointer group"
                      onClick={() => setSelectedOrderForTimeline(ord)}
                    >
                      {/* Mã vận đơn & Logo Hãng */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <CarrierLogoBadge carrier={carrier} size="sm" />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-black text-[#3D271D] bg-[#FFF0F1] px-2.5 py-1 rounded-xl border border-[#FCD2D6]">
                                {ord.trackingCode || 'Chưa tạo mã'}
                              </span>
                              {ord.trackingCode && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopyTracking(ord.trackingCode);
                                  }}
                                  className="text-[#8C7065] hover:text-[#FF5B65] transition-colors p-1 cursor-pointer"
                                  title="Sao chép mã vận đơn"
                                >
                                  {copiedTracking === ord.trackingCode ? (
                                    <Check className="w-3.5 h-3.5 text-[#238774]" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              )}
                            </div>
                            <span className="text-[10px] text-[#8C7065] font-semibold flex items-center gap-1 mt-0.5">
                              {meta.name}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Mã đơn */}
                      <td className="py-3.5 px-3">
                        <span className="font-mono font-bold text-[#FF5B65]">{ord.code}</span>
                      </td>

                      {/* Người nhận */}
                      <td className="py-3.5 px-3 max-w-[240px]">
                        <p className="font-bold text-[#3D271D]">{ord.customerName}</p>
                        <p className="text-[11px] text-[#8C7065] font-mono mt-0.5">
                          {ord.customerPhone}
                        </p>
                        <p className="text-[11px] text-[#8C7065] truncate font-medium mt-0.5">
                          {ord.shippingAddress}
                        </p>
                      </td>

                      {/* COD */}
                      <td className="py-3.5 px-3 text-center">
                        <span className="font-black text-sm text-[#FF5B65] font-['Nunito',sans-serif]">
                          {formatCurrency(ord.totalAmount)}
                        </span>
                        <p className="text-[10px] text-[#8C7065] font-medium">
                          {ord.paymentMethod === 'Chuyển khoản' ? 'Đã CK trước' : 'Thu tiền mặt'}
                        </p>
                      </td>

                      {/* Trạng thái giao */}
                      <td className="py-3.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={ord.shippingStatus || 'Chờ lấy hàng'}
                          onChange={(e) =>
                            updateShippingStatus(ord.id, e.target.value as ShippingStatus)
                          }
                          className={`text-[11px] font-bold px-3 py-1 rounded-full cursor-pointer focus:outline-hidden ${shipStyle.bg} border`}
                        >
                          {shippingStatuses.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Ngày gửi */}
                      <td className="py-3.5 px-3 text-right text-[#8C7065] text-[11px] font-semibold">
                        {ord.createdAt}
                      </td>

                      {/* Thao tác */}
                      <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Nút xem hành trình */}
                          <button
                            type="button"
                            onClick={() => setSelectedOrderForTimeline(ord)}
                            className="text-xs text-[#FF5B65] hover:text-[#E84A54] font-bold px-2.5 py-1.5 rounded-xl hover:bg-[#FFF0F1] transition-colors cursor-pointer flex items-center gap-1 border border-[#FCD2D6]"
                            title="Xem chi tiết hành trình bưu tá"
                          >
                            <Navigation className="w-3.5 h-3.5 text-[#FF5B65]" />
                            <span>Hành trình</span>
                          </button>

                          {/* Link ra web tra cứu của hãng */}
                          {ord.trackingCode && (
                            <a
                              href={trackingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-[#8C7065] hover:text-[#FF5B65] hover:bg-[#FFF0F1] rounded-xl transition-colors cursor-pointer"
                              title={`Mở trang tra cứu chính thức của ${meta.shortName}`}
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: POPUP THEO DÕI HÀNH TRÌNH BƯU TÁ CHI TIẾT */}
      <TrackingTimelineModal
        isOpen={!!selectedOrderForTimeline}
        onClose={() => setSelectedOrderForTimeline(null)}
        order={selectedOrderForTimeline}
      />
    </div>
  );
};
