import React, { useState } from 'react';
import {
  X,
  Printer,
  Copy,
  Check,
  Phone,
  MapPin,
  Clock,
  Package,
  Truck,
  CreditCard,
  FileText,
  Heart,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import type { Order, OrderStatus } from '../types';
import { formatCurrency, getStatusStyle } from '../utils/formatters';

interface OrderDetailModalProps {
  order: Order | null;
  onClose: () => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ order, onClose }) => {
  const { updateOrderStatus } = useShop();
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  if (!order) return null;

  const statusStyle = getStatusStyle(order.status);

  const handleCopy = (text: string, type: 'code' | 'phone') => {
    navigator.clipboard.writeText(text);
    if (type === 'code') {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } else {
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const orderStatuses: OrderStatus[] = [
    'Chờ xử lý',
    'Đang xử lý',
    'Đang giao',
    'Đã giao',
    'Đã hủy',
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#3D271D]/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="relative bg-white rounded-3xl shadow-2xl border border-[#FDE2E4] w-full max-w-2xl overflow-hidden transition-all animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-[#FFF0F1] flex items-center justify-between bg-[#FFF9F6]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#FFF0F1] rounded-2xl text-[#FF5B65] border border-[#FCD2D6]">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-[#3D271D] font-['Nunito',sans-serif]">
                  Đơn hàng {order.code}
                </h2>
                <button
                  onClick={() => handleCopy(order.code, 'code')}
                  className="p-1 text-[#8C7065] hover:text-[#FF5B65] rounded-lg transition-colors cursor-pointer"
                  title="Sao chép mã đơn"
                >
                  {copiedCode ? (
                    <Check className="w-3.5 h-3.5 text-[#238774]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-[#8C7065] mt-0.5 font-medium">
                Ngày chốt: {order.createdAt} • Moniu Xin chào
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 text-[#8C7065] hover:text-[#3D271D] hover:bg-[#FFF0F1] rounded-2xl transition-colors cursor-pointer"
              title="In phiếu đóng gói"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-[#8C7065] hover:text-[#FF5B65] hover:bg-[#FFF0F1] rounded-2xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Quick status bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-[#FFF9F6] rounded-2xl border border-[#FDE2E4]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#8C7065]">Trạng thái:</span>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${statusStyle.bg} ${statusStyle.text} border ${statusStyle.border}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                {order.status}
              </span>
            </div>

            {/* Quick status selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#8C7065] font-semibold">Chuyển sang:</span>
              <select
                value={order.status}
                onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                className="text-xs font-bold bg-white border border-[#FDE2E4] rounded-xl px-3 py-1.5 text-[#3D271D] focus:outline-hidden focus:border-[#FF5B65]"
              >
                {orderStatuses.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Customer & Delivery details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl border border-[#FDE2E4] bg-white shadow-2xs space-y-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#FF5B65] flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#FF5B65]" />
                Người nhận (Mẹ & Bé)
              </h3>
              <p className="text-sm font-bold text-[#3D271D]">{order.customerName}</p>
              <div className="flex items-center gap-2 text-xs text-[#8C7065] font-medium">
                <span>{order.customerPhone || 'Chưa có SĐT'}</span>
                {order.customerPhone && (
                  <button
                    onClick={() => handleCopy(order.customerPhone, 'phone')}
                    className="text-[#8C7065] hover:text-[#FF5B65] transition-colors cursor-pointer"
                  >
                    {copiedPhone ? (
                      <Check className="w-3 h-3 text-[#238774]" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                )}
              </div>
              <div className="flex items-start gap-1.5 text-xs text-[#8C7065] mt-1 font-medium">
                <MapPin className="w-3.5 h-3.5 text-[#FF5B65] shrink-0 mt-0.5" />
                <span className="leading-relaxed">{order.shippingAddress}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-[#FDE2E4] bg-white shadow-2xs space-y-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#FF5B65] flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-[#FF5B65]" />
                Vận chuyển & Thanh toán
              </h3>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#8C7065] font-medium">Hãng vận chuyển:</span>
                <span className="font-bold text-[#3D271D]">{order.carrier}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#8C7065] font-medium">Mã vận đơn:</span>
                <span className="font-mono font-bold text-[#FF5B65] bg-[#FFF0F1] px-2 py-0.5 rounded-lg border border-[#FCD2D6]">
                  {order.trackingCode || 'Đang tạo vận đơn'}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#8C7065] font-medium">Phương thức:</span>
                <span className="font-bold text-[#3D271D]">
                  {order.paymentMethod === 'COD' ? 'Tiền mặt (COD)' : 'Chuyển khoản'}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#8C7065] font-medium">Thanh toán:</span>
                <span
                  className={`font-black ${
                    order.isPaid ? 'text-[#238774]' : 'text-[#B87B00]'
                  }`}
                >
                  {order.isPaid ? '● Đã thanh toán' : '○ Thu COD khi nhận'}
                </span>
              </div>
            </div>
          </div>

          {/* Order Note */}
          {order.orderNote && (
            <div className="p-3.5 bg-[#FFF8E6] rounded-2xl border border-[#FDE199] flex items-start gap-2.5">
              <FileText className="w-4 h-4 text-[#B87B00] shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-[#B87B00]">Ghi chú đồ em bé:</span>
                <p className="text-xs text-[#8C7065] mt-0.5 font-medium">{order.orderNote}</p>
              </div>
            </div>
          )}

          {/* Products List */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-[#8C7065] mb-3">
              Danh sách đồ em bé trong đơn ({order.items.length})
            </h3>
            <div className="border border-[#FDE2E4] rounded-2xl overflow-hidden divide-y divide-[#FFF0F1]">
              {order.items.map((item, idx) => (
                <div key={idx} className="p-3.5 flex items-center justify-between gap-4 hover:bg-[#FFF9F6] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#FFF0F1] border border-[#FCD2D6] flex items-center justify-center font-black text-xs text-[#FF5B65] shrink-0 font-mono">
                      {item.productCode}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#3D271D]">{item.productName}</p>
                      <p className="text-xs text-[#8C7065] mt-0.5 font-medium">Phân loại: {item.variant}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[#8C7065] font-medium">
                      {formatCurrency(item.unitPrice)} × {item.quantity}
                    </p>
                    <p className="text-sm font-black text-[#FF5B65] mt-0.5">
                      {formatCurrency(item.unitPrice * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="p-4 bg-[#FFF9F6] rounded-2xl space-y-2 border border-[#FDE2E4]">
            <div className="flex justify-between text-xs text-[#8C7065] font-medium">
              <span>Tạm tính tiền hàng:</span>
              <span className="font-bold text-[#3D271D]">{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-xs text-[#8C7065] font-medium">
              <span>Phí vận chuyển:</span>
              <span>
                {order.shippingFee === 0 ? (
                  <span className="text-[#238774] font-bold">Freeship</span>
                ) : (
                  <span className="font-bold text-[#3D271D]">{formatCurrency(order.shippingFee)}</span>
                )}
              </span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-xs text-[#238774] font-bold">
                <span>Ưu đãi:</span>
                <span>-{formatCurrency(order.discount)}</span>
              </div>
            )}
            <div className="pt-2 border-t border-[#FDE2E4] flex justify-between items-center text-sm font-bold text-[#3D271D]">
              <span>Tổng thanh toán:</span>
              <span className="text-lg font-black text-[#FF5B65] font-['Nunito',sans-serif]">
                {formatCurrency(order.totalAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-[#FFF0F1] bg-[#FFF9F6] flex items-center justify-between">
          <div className="text-xs text-[#8C7065] font-semibold flex items-center gap-1">
            <Heart className="w-3.5 h-3.5 fill-[#FF5B65] text-[#FF5B65]" />
            Moniu Xin chào — Baby and Kid Shop
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-2xl text-xs font-bold bg-white text-[#3D271D] hover:bg-[#FFF0F1] border border-[#FDE2E4] transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
