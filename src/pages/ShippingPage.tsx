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
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { INITIAL_CARRIERS } from '../data/initialData';
import type { ShippingCarrier, ShippingStatus } from '../types';
import { formatCurrency, getShippingStatusStyle } from '../utils/formatters';

export const ShippingPage: React.FC = () => {
  const { orders, updateShippingStatus, setSelectedOrderForModal } = useShop();
  const [carrierFilter, setCarrierFilter] = useState<string>('all');
  const [shippingStatusFilter, setShippingStatusFilter] = useState<string>('all');
  const [searchCode, setSearchCode] = useState('');
  const [copiedTracking, setCopiedTracking] = useState<string | null>(null);

  // Filtered orders list for shipping
  const shippingOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchCarrier = carrierFilter === 'all' || o.carrier === carrierFilter;
      const matchStatus =
        shippingStatusFilter === 'all' || o.shippingStatus === shippingStatusFilter;
      const query = searchCode.toLowerCase().trim();
      const matchSearch =
        !query ||
        (o.trackingCode && o.trackingCode.toLowerCase().includes(query)) ||
        o.code.toLowerCase().includes(query) ||
        o.customerName.toLowerCase().includes(query);

      return matchCarrier && matchStatus && matchSearch;
    });
  }, [orders, carrierFilter, shippingStatusFilter, searchCode]);

  // Dynamic carrier statistics calculated directly from real orders
  const dynamicCarriers = useMemo(() => {
    return INITIAL_CARRIERS.map((c) => {
      const carrierOrders = orders.filter((o) => o.carrier === c.id);
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
      };
    });
  }, [orders]);

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

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[#3D271D] tracking-tight font-['Nunito',sans-serif]">
              Quản lý vận chuyển
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#EBF9F6] text-[#238774] border border-[#B8ECE1] flex items-center gap-1">
              <Heart className="w-3 h-3 fill-current" />
              Giao nhanh tận tay mẹ bé
            </span>
          </div>
          <p className="text-sm text-[#8C7065] mt-0.5 font-medium">
            Theo dõi tiến độ giao hàng của các đơn vị đối tác GHN, GHTK, J&T Express
          </p>
        </div>

        <div className="text-xs bg-[#FFF0F1] text-[#FF5B65] px-3.5 py-1.5 rounded-2xl border border-[#FCD2D6] font-bold">
          Điều phối vận chuyển Moniu
        </div>
      </div>

      {/* Carrier Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {dynamicCarriers.map((carrier) => (
          <div
            key={carrier.id}
            onClick={() => setCarrierFilter(carrierFilter === carrier.id ? 'all' : carrier.id)}
            className={`bg-white rounded-3xl p-5 border transition-all cursor-pointer ${
              carrierFilter === carrier.id
                ? 'border-[#FF5B65] shadow-md ring-2 ring-[#FF5B65]/20'
                : 'border-[#FDE2E4] shadow-2xs hover:shadow-md'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center font-black text-xs text-white shadow-xs"
                  style={{ backgroundColor: carrier.color }}
                >
                  {carrier.logo}
                </div>
                <div>
                  <h3 className="font-extrabold text-[#3D271D] text-sm font-['Nunito',sans-serif]">{carrier.name}</h3>
                  <p className="text-xs text-[#8C7065] font-semibold">Tỷ lệ thành công: {carrier.successRate}%</p>
                </div>
              </div>

              {carrierFilter === carrier.id && (
                <span className="text-[10px] font-bold text-[#FF5B65] bg-[#FFF0F1] px-2.5 py-1 rounded-full border border-[#FCD2D6]">
                  Đang lọc
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-[#FFF0F1] text-center">
              <div>
                <p className="text-xs text-[#8C7065] font-medium">Đang giao</p>
                <p className="text-base font-black text-[#3D271D] mt-0.5 font-['Nunito',sans-serif]">{carrier.delivering}</p>
              </div>
              <div>
                <p className="text-xs text-[#8C7065] font-medium">Thành công</p>
                <p className="text-base font-black text-[#238774] mt-0.5 font-['Nunito',sans-serif]">{carrier.success}</p>
              </div>
              <div>
                <p className="text-xs text-[#8C7065] font-medium">Thất bại</p>
                <p className="text-base font-black text-[#D93D48] mt-0.5 font-['Nunito',sans-serif]">{carrier.failed}</p>
              </div>
            </div>
          </div>
        ))}
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
              placeholder="Tìm theo mã vận đơn (GHN...), mã đơn (MN-...) hoặc tên mẹ..."
              className="w-full bg-[#FFF9F6] focus:bg-white text-xs text-[#3D271D] pl-10 pr-3.5 py-2.5 rounded-2xl border border-[#FDE2E4] focus:outline-hidden focus:border-[#FF5B65] font-medium"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={carrierFilter}
              onChange={(e) => setCarrierFilter(e.target.value)}
              className="w-full bg-[#FFF9F6] text-xs font-bold text-[#3D271D] px-3.5 py-2.5 rounded-2xl border border-[#FDE2E4] focus:outline-hidden focus:border-[#FF5B65]"
            >
              <option value="all">Tất cả hãng vận chuyển</option>
              <option value="GHN">GHN (Giao Hàng Nhanh)</option>
              <option value="GHTK">GHTK (Giao Hàng Tiết Kiệm)</option>
              <option value="J&T Express">J&T Express</option>
              <option value="Viettel Post">Viettel Post</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={shippingStatusFilter}
              onChange={(e) => setShippingStatusFilter(e.target.value)}
              className="w-full bg-[#FFF9F6] text-xs font-bold text-[#3D271D] px-3.5 py-2.5 rounded-2xl border border-[#FDE2E4] focus:outline-hidden focus:border-[#FF5B65]"
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
      </div>

      {/* Shipping Orders Table */}
      <div className="bg-white rounded-3xl border border-[#FDE2E4] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead>
              <tr className="bg-[#FFF9F6] text-[#8C7065] border-b border-[#FDE2E4] font-bold">
                <th className="py-3.5 px-4">Mã vận đơn</th>
                <th className="py-3.5 px-3">Mã đơn Moniu</th>
                <th className="py-3.5 px-3">Hãng vận chuyển</th>
                <th className="py-3.5 px-3">Người nhận (Mẹ & Bé)</th>
                <th className="py-3.5 px-3 text-center">Trạng thái giao</th>
                <th className="py-3.5 px-3 text-right">Ngày gửi</th>
                <th className="py-3.5 px-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#FFF0F1]">
              {shippingOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#8C7065] font-medium">
                    Không có vận đơn nào phù hợp.
                  </td>
                </tr>
              ) : (
                shippingOrders.map((ord) => {
                  const shipStyle = getShippingStatusStyle(ord.shippingStatus);

                  return (
                    <tr
                      key={ord.id}
                      className="hover:bg-[#FFF9F6] transition-colors cursor-pointer"
                      onClick={() => setSelectedOrderForModal(ord)}
                    >
                      {/* Mã vận đơn */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-[#3D271D] bg-[#FFF0F1] px-2.5 py-1 rounded-xl border border-[#FCD2D6]">
                            {ord.trackingCode || 'Chưa tạo'}
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
                      </td>

                      {/* Mã đơn */}
                      <td className="py-3.5 px-3">
                        <span className="font-mono font-bold text-[#FF5B65]">{ord.code}</span>
                      </td>

                      {/* Đơn vị */}
                      <td className="py-3.5 px-3">
                        <span className="font-bold text-[#3D271D]">{ord.carrier}</span>
                      </td>

                      {/* Người nhận */}
                      <td className="py-3.5 px-3 max-w-[240px]">
                        <p className="font-bold text-[#3D271D]">{ord.customerName}</p>
                        <p className="text-[11px] text-[#8C7065] truncate font-medium">{ord.shippingAddress}</p>
                      </td>

                      {/* Trạng thái giao */}
                      <td className="py-3.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={ord.shippingStatus || 'Chờ lấy hàng'}
                          onChange={(e) =>
                            updateShippingStatus(ord.id, e.target.value as ShippingStatus)
                          }
                          className={`text-[11px] font-bold px-3 py-1 rounded-full cursor-pointer focus:outline-hidden ${shipStyle.bg}`}
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
                        <button
                          onClick={() => setSelectedOrderForModal(ord)}
                          className="text-xs text-[#FF5B65] hover:text-[#E84A54] font-bold px-3 py-1.5 rounded-xl hover:bg-[#FFF0F1] transition-colors cursor-pointer"
                        >
                          Chi tiết
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
