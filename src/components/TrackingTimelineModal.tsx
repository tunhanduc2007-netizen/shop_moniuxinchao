import React, { useState, useMemo } from 'react';
import {
  X,
  ExternalLink,
  Copy,
  Check,
  Package,
  Truck,
  MapPin,
  Clock,
  Phone,
  User,
  ShieldCheck,
  AlertCircle,
  RotateCcw,
  CheckCircle2,
  Navigation,
} from 'lucide-react';
import type { Order, ShippingStatus } from '../types';
import {
  CARRIERS_METADATA,
  CarrierLogoBadge,
  generateTrackingTimeline,
  getCarrierTrackingUrl,
} from '../utils/carrierUtils';
import { formatCurrency, getShippingStatusStyle } from '../utils/formatters';
import { useShop } from '../context/ShopContext';

interface TrackingTimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

export const TrackingTimelineModal: React.FC<TrackingTimelineModalProps> = ({
  isOpen,
  onClose,
  order,
}) => {
  const { updateShippingStatus } = useShop();
  const [copied, setCopied] = useState(false);

  if (!isOpen || !order) return null;

  const carrier = order.carrier || 'GHN';
  const meta = CARRIERS_METADATA[carrier] || CARRIERS_METADATA['GHN'];
  const trackingCode = order.trackingCode || 'Chưa tạo mã';
  const trackingUrl = getCarrierTrackingUrl(carrier, order.trackingCode);
  const statusStyle = getShippingStatusStyle(order.shippingStatus);
  const timelineEvents = generateTrackingTimeline(carrier, order);

  const handleCopy = () => {
    if (!order.trackingCode) return;
    navigator.clipboard.writeText(order.trackingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleQuickStatusChange = async (newStatus: ShippingStatus) => {
    await updateShippingStatus(order.id, newStatus);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-[#3D271D]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-3xl shadow-2xl border border-[#FDE2E4] w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with carrier branding */}
        <div
          className="px-6 py-5 border-b border-white/20 text-white relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${meta.brandColor}, ${meta.brandColor}E6)`,
          }}
        >
          {/* Subtle decorative circles */}
          <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
          <div className="absolute right-16 -top-10 w-24 h-24 rounded-full bg-white/10 pointer-events-none" />

          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center font-black text-xs shadow-md shrink-0">
                <CarrierLogoBadge carrier={carrier} size="sm" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-black font-['Nunito',sans-serif] tracking-tight">
                    {meta.name}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 border border-white/30 backdrop-blur-xs">
                    Hotline: {meta.hotline}
                  </span>
                </div>
                <p className="text-xs text-white/90 font-medium mt-0.5">
                  Đơn hàng #{order.code} • {order.customerName}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/15 rounded-2xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tracking Code Banner & 1-Click External Link */}
          <div className="mt-4 pt-3.5 border-t border-white/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/80 font-medium">Mã vận đơn:</span>
              <span className="font-mono font-black text-sm tracking-wider bg-white/20 px-3 py-1 rounded-xl border border-white/30">
                {trackingCode}
              </span>
              {order.trackingCode && (
                <button
                  onClick={handleCopy}
                  className="p-1.5 text-white/90 hover:text-white hover:bg-white/20 rounded-xl transition-all cursor-pointer"
                  title="Sao chép mã vận đơn"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-300" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>

            {order.trackingCode && (
              <a
                href={trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-[#3D271D] hover:bg-[#FFF9F6] rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer hover:shadow-md"
              >
                <span>Tra cứu web {meta.shortName}</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#FF5B65]" />
              </a>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Recipient & Package Summary Card */}
          <div className="bg-[#FFF9F6] rounded-2xl p-4 border border-[#FDE2E4] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <p className="text-[#8C7065] font-medium flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-[#FF5B65]" />
                Người nhận (Mẹ & Bé):
              </p>
              <p className="font-bold text-[#3D271D] mt-1">{order.customerName}</p>
              <p className="text-[#8C7065] text-[11px] font-mono mt-0.5 flex items-center gap-1">
                <Phone className="w-3 h-3 text-[#238774]" />
                {order.customerPhone || 'Chưa có SĐT'}
              </p>
            </div>

            <div>
              <p className="text-[#8C7065] font-medium flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#FF5B65]" />
                Địa chỉ giao hàng:
              </p>
              <p className="font-semibold text-[#3D271D] mt-1 leading-relaxed">
                {order.shippingAddress || 'Chờ bổ sung địa chỉ'}
              </p>
            </div>

            <div>
              <p className="text-[#8C7065] font-medium flex items-center gap-1">
                <Package className="w-3.5 h-3.5 text-[#FF5B65]" />
                Thu hộ COD / Tiền hàng:
              </p>
              <p className="font-black text-sm text-[#FF5B65] mt-1 font-['Nunito',sans-serif]">
                {formatCurrency(order.totalAmount)}
              </p>
              <p className="text-[11px] text-[#8C7065] mt-0.5">
                {order.paymentMethod === 'Chuyển khoản' ? 'Đã chuyển khoản' : 'Thu tiền mặt COD'}
              </p>
            </div>
          </div>

          {/* Current Status Badge & Simulator */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-white border border-[#FDE2E4] shadow-2xs">
            <div className="flex items-center gap-2.5">
              <span className="text-xs text-[#8C7065] font-medium">Trạng thái hiện tại:</span>
              <span
                className={`text-xs font-extrabold px-3 py-1 rounded-full ${statusStyle.bg} flex items-center gap-1.5`}
              >
                <span className={`w-2 h-2 rounded-full ${statusStyle.dot} animate-pulse`} />
                {order.shippingStatus || 'Chờ lấy hàng'}
              </span>
            </div>

            <div className="text-[11px] text-[#8C7065] flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#238774]" />
              <span>Đồng bộ thời gian thực từ API hãng</span>
            </div>
          </div>

          {/* 5-Step Delivery Timeline */}
          <div>
            <h4 className="text-xs font-black text-[#3D271D] uppercase tracking-wider mb-4 flex items-center gap-1.5 font-['Nunito',sans-serif]">
              <Truck className="w-4 h-4 text-[#FF5B65]" />
              Hành trình bưu gửi chi tiết ({timelineEvents.length} chặng)
            </h4>

            <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-[#FDE2E4]">
              {timelineEvents.map((evt, idx) => {
                return (
                  <div key={idx} className="relative group">
                    {/* Step Icon / Dot */}
                    <div
                      className={`absolute -left-6 top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-white transition-all shadow-xs ${
                        evt.completed
                          ? 'bg-[#238774] ring-4 ring-[#EBF9F6]'
                          : evt.isCurrent
                          ? 'bg-[#FF5B65] ring-4 ring-[#FFF0F1] animate-pulse'
                          : 'bg-[#D5C2B9] text-white/80'
                      }`}
                    >
                      {evt.completed ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : evt.isCurrent ? (
                        <Navigation className="w-3 h-3 animate-spin" />
                      ) : (
                        <span className="text-[10px] font-bold">{idx + 1}</span>
                      )}
                    </div>

                    {/* Step Content */}
                    <div
                      className={`p-4 rounded-2xl border transition-all ${
                        evt.isCurrent
                          ? 'bg-[#FFF9F6] border-[#FCD2D6] shadow-xs'
                          : evt.completed
                          ? 'bg-white border-[#FDE2E4]'
                          : 'bg-[#FCFAF8] border-dashed border-[#F0E4DE] opacity-60'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <h5
                          className={`font-black text-xs font-['Nunito',sans-serif] ${
                            evt.isCurrent
                              ? 'text-[#FF5B65]'
                              : evt.completed
                              ? 'text-[#3D271D]'
                              : 'text-[#8C7065]'
                          }`}
                        >
                          {evt.status}
                        </h5>
                        <span className="text-[11px] text-[#8C7065] font-mono flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#C2ABA1]" />
                          {evt.time} • {evt.date}
                        </span>
                      </div>

                      <p className="text-[11px] font-semibold text-[#8C7065] mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#FF5B65] shrink-0" />
                        <span>{evt.location}</span>
                      </p>

                      <p className="text-xs text-[#3D271D] mt-2 leading-relaxed font-medium">
                        {evt.description}
                      </p>

                      {evt.shipperName && (
                        <div className="mt-2.5 pt-2 border-t border-[#FDE2E4] flex items-center gap-2 text-[11px] text-[#238774] font-bold">
                          <Phone className="w-3 h-3" />
                          <span>
                            Bưu tá: {evt.shipperName} ({evt.shipperPhone})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Shipping Status Transition Bar */}
          <div className="pt-4 border-t border-[#FDE2E4] space-y-2.5">
            <p className="text-xs font-bold text-[#3D271D] flex items-center gap-1.5">
              <span>⚡ Mô phỏng chuyển trạng thái (Cập nhật tức thì):</span>
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleQuickStatusChange('Đang lấy hàng')}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 cursor-pointer transition-colors"
              >
                📦 Đang lấy hàng
              </button>
              <button
                type="button"
                onClick={() => handleQuickStatusChange('Đang trung chuyển')}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100 cursor-pointer transition-colors"
              >
                🚛 Đang trung chuyển
              </button>
              <button
                type="button"
                onClick={() => handleQuickStatusChange('Đang giao')}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100 cursor-pointer transition-colors"
              >
                🛵 Đang giao hàng
              </button>
              <button
                type="button"
                onClick={() => handleQuickStatusChange('Đã giao')}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 cursor-pointer transition-colors"
              >
                ✅ Đã giao thành công
              </button>
              <button
                type="button"
                onClick={() => handleQuickStatusChange('Chuyển hoàn')}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100 cursor-pointer transition-colors"
              >
                ↩️ Chuyển hoàn
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-[#FFF9F6] border-t border-[#FDE2E4] flex items-center justify-between">
          <span className="text-xs text-[#8C7065] font-medium hidden sm:inline">
            Đối tác vận chuyển: <strong className="text-[#3D271D]">{meta.name}</strong>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 bg-white hover:bg-[#FFF0F1] text-[#3D271D] border border-[#FDE2E4] font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Đóng cửa sổ
          </button>
        </div>
      </div>
    </div>
  );
};
