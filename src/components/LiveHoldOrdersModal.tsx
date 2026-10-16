import React, { useState, useMemo } from 'react';
import {
  X,
  Clock,
  User,
  Phone,
  MapPin,
  Check,
  Copy,
  ShoppingBag,
  Trash2,
  Zap,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Plus,
  Send,
  AlertCircle,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import type { Order } from '../types';
import { formatCurrency } from '../utils/formatters';
import { searchAddressSuggestions, POPULAR_PROVINCES } from '../utils/addressUtils';

interface LiveHoldOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LiveHoldOrdersModal: React.FC<LiveHoldOrdersModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    orders,
    completePendingOrder,
    deleteOrder,
    setActiveTab,
    setInitialOrderPrefill,
    showToast,
  } = useShop();

  // Selected order for complete popup
  const [completingOrder, setCompletingOrder] = useState<Order | null>(null);
  const [completePhone, setCompletePhone] = useState('');
  const [completeAddress, setCompleteAddress] = useState('');
  const [completeName, setCompleteName] = useState('');

  // Address suggestions for complete modal
  const [isAddressSuggestionsOpen, setIsAddressSuggestionsOpen] = useState(false);
  const addressSuggestions = useMemo(() => {
    if (!completeAddress || completeAddress.trim().length < 2) return [];
    return searchAddressSuggestions(completeAddress, 5);
  }, [completeAddress]);

  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');

  // Filter only pending hold orders
  const pendingHoldOrders = useMemo(() => {
    return orders.filter(
      (o) =>
        o.status === 'Chờ thông tin' ||
        o.isPendingInfo ||
        !o.customerPhone ||
        o.customerPhone === 'Chưa có SĐT'
    );
  }, [orders]);

  const filteredOrders = useMemo(() => {
    if (!searchFilter.trim()) return pendingHoldOrders;
    const q = searchFilter.toLowerCase().trim();
    return pendingHoldOrders.filter(
      (o) =>
        o.customerName.toLowerCase().includes(q) ||
        o.code.toLowerCase().includes(q) ||
        o.items.some((it) => it.productName.toLowerCase().includes(q))
    );
  }, [pendingHoldOrders, searchFilter]);

  if (!isOpen) return null;

  const handleOpenCompleteModal = (order: Order) => {
    setCompletingOrder(order);
    setCompleteName(order.customerName);
    setCompletePhone(order.customerPhone === 'Chưa có SĐT' ? '' : order.customerPhone);
    setCompleteAddress(
      order.shippingAddress === 'Chờ khách gửi địa chỉ inbox' ||
      order.shippingAddress === 'Chưa cập nhật địa chỉ'
        ? ''
        : order.shippingAddress
    );
  };

  const handleConfirmComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completingOrder) return;
    if (!completePhone.trim()) {
      showToast({
        type: 'warning',
        title: 'Thiếu số điện thoại',
        message: 'Vui lòng nhập SĐT khách để chốt đơn giao hàng.',
      });
      return;
    }
    if (!completeAddress.trim()) {
      showToast({
        type: 'warning',
        title: 'Thiếu địa chỉ nhận',
        message: 'Vui lòng nhập địa chỉ nhận hàng của khách.',
      });
      return;
    }

    await completePendingOrder(
      completingOrder.id,
      completePhone.trim(),
      completeAddress.trim(),
      completeName.trim()
    );

    setCompletingOrder(null);
  };

  const handleCopyMessageForCustomer = (order: Order) => {
    const itemsList = order.items
      .map(
        (it, idx) =>
          `  ${idx + 1}. ${it.productName} (${it.variant}) x${it.quantity} - ${formatCurrency(it.unitPrice * it.quantity)}`
      )
      .join('\n');

    const message = `Dạ Moniu Xin Chào cảm ơn Mẹ ${order.customerName} đã chốt đơn trên live ạ! ❤️\n\nShop đã giữ đồ cho bé:\n${itemsList}\n\n🎁 Ưu đãi live: Miễn phí giao hàng (Freeship)\n💰 Tổng thanh toán: ${formatCurrency(order.totalAmount)}\n\nMẹ gửi cho Moniu xin Số Điện Thoại và Địa chỉ nhận hàng cụ thể để sáng mai shop đóng gói gửi quà cho bé nha mẹ ơi! 🥰`;

    navigator.clipboard.writeText(message);
    setCopiedOrderId(order.id);
    showToast({
      type: 'success',
      title: 'Đã sao chép tin nhắn mẫu!',
      message: `Đã copy nội dung gửi cho mẹ ${order.customerName}. Mẹ chỉ việc dán gửi inbox TikTok.`,
    });

    setTimeout(() => {
      setCopiedOrderId(null);
    }, 2500);
  };

  const handleAddMoreItems = (order: Order) => {
    setInitialOrderPrefill({
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      shippingAddress: order.shippingAddress,
    });
    onClose();
    setActiveTab('create-order');
    showToast({
      type: 'info',
      title: 'Chốt thêm đồ cho mẹ',
      message: `Đã nạp thông tin mẹ ${order.customerName} vào màn hình tạo đơn.`,
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl border border-[#FCD2D6] overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#FFF0F1] via-[#FFF9F6] to-[#FFF0F1] border-b border-[#FCD2D6] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FF5B65] text-white flex items-center justify-center shadow-md shadow-[#FF5B65]/30 shrink-0">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-[#3D271D] font-['Nunito',sans-serif]">
                  Khay Đơn Chờ Live (Đang Giữ Đồ)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-[#FF5B65] text-white shadow-xs">
                  {pendingHoldOrders.length} đơn
                </span>
              </div>
              <p className="text-xs text-[#8C7065] mt-0.5 font-medium">
                Khách đã chốt mã trên live nhưng chưa gửi SĐT & Địa chỉ. Khi khách inbox, bấm "Điền thông tin" là xong!
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl bg-white hover:bg-[#FFF0F1] text-[#8C7065] hover:text-[#FF5B65] border border-[#FCD2D6] transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter bar */}
        <div className="p-4 border-b border-[#FFF0F1] bg-[#FFFDFD] flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Tìm theo Nick TikTok, mã đơn, tên đồ bé..."
              className="w-full bg-[#FFF9F6] focus:bg-white text-xs text-[#3D271D] px-3.5 py-2 rounded-xl border border-[#FDE2E4] outline-hidden font-medium"
            />
          </div>

          <div className="text-xs text-[#8C7065] font-medium hidden sm:block">
            ⏱️ Đồ được giữ an toàn trong 24h
          </div>
        </div>

        {/* Orders list */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-16 px-4 bg-[#FFF9F6] rounded-3xl border border-dashed border-[#FCD2D6]">
              <Clock className="w-12 h-12 text-[#FF5B65]/40 mx-auto mb-3" />
              <p className="text-sm font-black text-[#3D271D]">Hiện không có đơn nào đang giữ đồ</p>
              <p className="text-xs text-[#8C7065] mt-1 max-w-sm mx-auto">
                Khi livestream, khách comment chốt đồ mà chưa có SĐT, bạn chỉ cần bấm nút "LƯU GIỮ ĐỒ / ĐƠN CHỜ" tại màn hình chốt đơn!
              </p>
            </div>
          ) : (
            filteredOrders.map((ord) => (
              <div
                key={ord.id}
                className="bg-white rounded-3xl p-5 border-2 border-[#FDE199] shadow-xs hover:shadow-md transition-all space-y-3.5 relative overflow-hidden"
              >
                {/* Top strip */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#FFF0F1]">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-xl bg-[#FFF8E6] text-[#B87B00] flex items-center justify-center text-xs font-black">
                      ⏳
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-[#3D271D]">
                          {ord.customerName}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#FFF8E6] text-[#B87B00] border border-[#FDE199]">
                          Chờ khách gửi SĐT / Địa chỉ
                        </span>
                      </div>
                      <p className="text-[11px] text-[#8C7065] font-mono mt-0.5">
                        Mã đơn: <strong className="text-[#FF5B65] font-black">{ord.code}</strong> • Chốt lúc {ord.timeString || 'trên live'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-base font-black text-[#FF5B65]">
                      {formatCurrency(ord.totalAmount)}
                    </p>
                    <p className="text-[11px] text-[#238774] font-bold">
                      {ord.items.length} món • Freeship live
                    </p>
                  </div>
                </div>

                {/* Items in holding */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {ord.items.map((it, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-2xl bg-[#FFF9F6] border border-[#FDE2E4] flex items-center gap-2.5"
                    >
                      <div className="w-10 h-10 rounded-xl bg-white border border-[#FCD2D6] overflow-hidden shrink-0 flex items-center justify-center">
                        {it.image ? (
                          <img src={it.image} alt={it.productName} className="w-full h-full object-cover" />
                        ) : (
                          <ShoppingBag className="w-4 h-4 text-[#FF5B65]" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-black text-[#3D271D] truncate">
                          {it.productName}
                        </p>
                        <div className="flex items-center justify-between text-[11px] mt-0.5">
                          <span className="text-[#8C7065] font-medium bg-white px-1.5 py-0.2 rounded border border-[#FDE2E4]">
                            {it.variant || 'Chuẩn'}
                          </span>
                          <span className="font-bold text-[#FF5B65]">
                            x{it.quantity}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Toolbar */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
                  {/* Left: Quick Copy Message for Customer */}
                  <button
                    type="button"
                    onClick={() => handleCopyMessageForCustomer(ord)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFF0F1] hover:bg-[#FDE2E4] text-[#FF5B65] rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    {copiedOrderId === ord.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#238774]" />
                        <span className="text-[#238774]">Đã copy tin nhắn gửi khách!</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>📋 Copy tin nhắn gửi inbox</span>
                      </>
                    )}
                  </button>

                  {/* Right Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleAddMoreItems(ord)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-[#FFF9F6] text-[#3D271D] border border-[#FDE2E4] rounded-xl text-xs font-bold transition-all cursor-pointer"
                      title="Chốt thêm đồ cho mẹ này"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Chốt thêm đồ
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenCompleteModal(ord)}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#238774] hover:bg-[#1C6E5E] text-white rounded-xl text-xs font-black shadow-xs hover:shadow-md transition-all cursor-pointer active:scale-95"
                    >
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      ⚡ Điền SĐT & Địa chỉ (Hoàn tất đơn)
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Bạn có chắc muốn hủy giữ đồ cho mẹ ${ord.customerName}?`)) {
                          deleteOrder(ord.id);
                        }
                      }}
                      className="p-1.5 text-[#8C7065] hover:text-[#FF5B65] hover:bg-[#FFF0F1] rounded-xl transition-colors cursor-pointer"
                      title="Hủy đơn giữ đồ (nhả kho)"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* POPUP HOÀN TẤT ĐƠN HÀNG (ĐIỀN SĐT & ĐỊA CHỈ NHANH) */}
      {completingOrder && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-[#FCD2D6] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#FFF0F1]">
              <div>
                <h3 className="text-base font-black text-[#3D271D]">
                  Hoàn tất đơn hàng #{completingOrder.code}
                </h3>
                <p className="text-xs text-[#8C7065]">
                  Khách: <strong className="text-[#3D271D]">{completingOrder.customerName}</strong> • {completingOrder.items.length} món đồ bé
                </p>
              </div>
              <button
                onClick={() => setCompletingOrder(null)}
                className="p-1.5 rounded-xl hover:bg-[#FFF0F1] text-[#8C7065] hover:text-[#FF5B65]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmComplete} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#3D271D] mb-1">
                  Tên khách / Nickname TikTok <span className="text-[#FF5B65]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={completeName}
                  onChange={(e) => setCompleteName(e.target.value)}
                  className="w-full bg-[#FFF9F6] text-xs font-bold text-[#3D271D] px-3.5 py-2.5 rounded-2xl border border-[#FDE2E4] outline-hidden focus:border-[#FF5B65]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#3D271D] mb-1">
                  Số điện thoại khách gửi inbox <span className="text-[#FF5B65]">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#8C7065] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    autoFocus
                    value={completePhone}
                    onChange={(e) => setCompletePhone(e.target.value)}
                    placeholder="0987 123 456"
                    className="w-full bg-[#FFF9F6] focus:bg-white text-xs font-bold text-[#3D271D] pl-10 pr-3.5 py-2.5 rounded-2xl border border-[#FDE2E4] outline-hidden focus:border-[#FF5B65]"
                  />
                </div>
              </div>

              {/* Địa chỉ với gợi ý tên đường vietnamese-provinces-database */}
              <div className="relative">
                <label className="block text-xs font-bold text-[#3D271D] mb-1">
                  Địa chỉ giao hàng đầy đủ <span className="text-[#FF5B65]">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-[#8C7065] absolute left-3.5 top-3" />
                  <textarea
                    rows={2}
                    required
                    value={completeAddress}
                    onChange={(e) => {
                      setCompleteAddress(e.target.value);
                      setIsAddressSuggestionsOpen(true);
                    }}
                    onFocus={() => {
                      if (completeAddress.trim().length >= 2) setIsAddressSuggestionsOpen(true);
                    }}
                    placeholder="Số nhà, tên đường, Phường/Xã, Quận/Huyện, Tỉnh/Thành..."
                    className="w-full bg-[#FFF9F6] focus:bg-white text-xs text-[#3D271D] pl-10 pr-3.5 py-2 rounded-2xl border border-[#FDE2E4] outline-hidden focus:border-[#FF5B65] leading-relaxed"
                  />
                </div>

                {/* Suggestions dropdown */}
                {isAddressSuggestionsOpen && addressSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-2xl border border-[#FCD2D6] shadow-xl z-50 overflow-hidden max-h-48 overflow-y-auto">
                    {addressSuggestions.map((sug, i) => (
                      <div
                        key={i}
                        onClick={() => {
                          setCompleteAddress(sug.fullAddress);
                          setIsAddressSuggestionsOpen(false);
                        }}
                        className="p-2.5 hover:bg-[#FFF9F6] cursor-pointer text-xs font-medium text-[#3D271D] border-b border-[#FFF0F1]"
                      >
                        📍 {sug.fullAddress}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick province chips */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[10px]">
                <span className="text-[#8C7065] shrink-0 font-bold">Thêm:</span>
                {POPULAR_PROVINCES.slice(0, 6).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      setCompleteAddress((prev) => (prev ? `${prev}, ${p}` : p));
                    }}
                    className="px-2 py-0.5 rounded-lg bg-[#FFF9F6] hover:bg-[#FFF0F1] hover:text-[#FF5B65] border border-[#FDE2E4] text-[#8C7065] shrink-0 cursor-pointer"
                  >
                    + {p}
                  </button>
                ))}
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCompletingOrder(null)}
                  className="px-4 py-2.5 rounded-xl border border-[#FDE2E4] text-xs font-bold text-[#8C7065] hover:bg-[#FFF9F6] cursor-pointer"
                >
                  Quay lại
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#FF5B65] hover:bg-[#E84A54] text-white text-xs font-black shadow-md shadow-[#FF5B65]/20 cursor-pointer active:scale-95"
                >
                  ✅ Xác nhận hoàn tất & Chuyển sang gói hàng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
