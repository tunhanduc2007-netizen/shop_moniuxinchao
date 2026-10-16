import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  RefreshCw,
  CheckCircle2,
  Package,
  User,
  Phone,
  MapPin,
  FileText,
  CreditCard,
  Truck,
  ArrowRight,
  Heart,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import type { OrderItem, PaymentMethod, ShippingCarrier } from '../types';
import { formatCurrency } from '../utils/formatters';

export const CreateOrderPage: React.FC = () => {
  const {
    products,
    settings,
    generateUniqueCode,
    addOrder,
    setActiveTab,
  } = useShop();

  // Form states
  const [orderCode, setOrderCode] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [orderNote, setOrderNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
  const [carrier, setCarrier] = useState<ShippingCarrier>(settings.defaultCarrier);

  // Products in order (starts completely blank)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([
    {
      id: '1',
      productCode: '',
      productName: '',
      variant: '',
      unitPrice: 0,
      quantity: 1,
    },
  ]);

  const [lastCreatedOrderCode, setLastCreatedOrderCode] = useState<string | null>(null);

  useEffect(() => {
    setOrderCode(generateUniqueCode());
  }, []);

  const handleRegenerateCode = () => {
    setOrderCode(generateUniqueCode());
  };

  const handleAddItem = () => {
    const newItem: OrderItem = {
      id: Math.random().toString(),
      productCode: '',
      productName: '',
      variant: '',
      unitPrice: 0,
      quantity: 1,
    };
    setOrderItems([...orderItems, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    if (orderItems.length === 1) {
      setOrderItems([
        {
          id: Math.random().toString(),
          productCode: '',
          productName: '',
          variant: '',
          unitPrice: 0,
          quantity: 1,
        },
      ]);
      return;
    }
    setOrderItems(orderItems.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index: number, field: keyof OrderItem, value: any) => {
    setOrderItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };

      if (field === 'productCode') {
        const found = products.find(
          (p) => p.code.toLowerCase() === String(value).trim().toLowerCase()
        );
        if (found) {
          updated[index].productName = found.name;
          updated[index].unitPrice = found.price;
          if (found.variants.length > 0 && !updated[index].variant) {
            updated[index].variant = found.variants[0];
          }
        }
      }

      return updated;
    });
  };

  const handleQuickSelectCatalogProduct = (prodCode: string) => {
    const prod = products.find((p) => p.code === prodCode);
    if (!prod) return;

    const emptyIndex = orderItems.findIndex(
      (it) => !it.productCode && !it.productName
    );

    const newItem: OrderItem = {
      id: Math.random().toString(),
      productCode: prod.code,
      productName: prod.name,
      variant: prod.variants[0] || 'Chuẩn',
      unitPrice: prod.price,
      quantity: 1,
    };

    if (emptyIndex !== -1) {
      setOrderItems((prev) => {
        const updated = [...prev];
        updated[emptyIndex] = newItem;
        return updated;
      });
    } else {
      setOrderItems((prev) => [...prev, newItem]);
    }
  };

  const subtotal = orderItems.reduce(
    (sum, item) => sum + (Number(item.unitPrice) || 0) * (Number(item.quantity) || 1),
    0
  );

  const shippingFee =
    subtotal >= settings.freeShippingThreshold && subtotal > 0
      ? 0
      : settings.defaultShippingFee;

  const totalAmount = subtotal + shippingFee;

  const handleResetForm = () => {
    setOrderCode(generateUniqueCode());
    setCustomerName('');
    setCustomerPhone('');
    setShippingAddress('');
    setOrderNote('');
    setPaymentMethod('COD');
    setCarrier(settings.defaultCarrier);
    setOrderItems([
      {
        id: Math.random().toString(),
        productCode: '',
        productName: '',
        variant: '',
        unitPrice: 0,
        quantity: 1,
      },
    ]);
    setLastCreatedOrderCode(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      alert('Vui lòng nhập tên mẹ / khách hàng');
      return;
    }

    const validItems = orderItems.filter((it) => it.productName.trim() || it.productCode.trim());
    if (validItems.length === 0) {
      alert('Vui lòng thêm ít nhất một món đồ em bé vào đơn');
      return;
    }

    const created = addOrder({
      code: orderCode,
      customerName,
      customerPhone,
      shippingAddress,
      orderNote,
      paymentMethod,
      carrier,
      items: validItems.map((item) => ({
        ...item,
        unitPrice: Number(item.unitPrice) || 0,
        quantity: Number(item.quantity) || 1,
      })),
      subtotal,
      shippingFee,
      discount: 0,
      totalAmount,
      status: 'Chờ xử lý',
      shippingStatus: 'Chờ lấy hàng',
    });

    setLastCreatedOrderCode(created.code);
  };

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[#3D271D] tracking-tight font-['Nunito',sans-serif]">
              Tạo đơn chốt live
            </h1>
            <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-[#FFF0F1] text-[#FF5B65] border border-[#FCD2D6] flex items-center gap-1">
              <Heart className="w-3 h-3 fill-[#FF5B65]" />
              Moniu Live Fast-Entry
            </span>
          </div>
          <p className="text-sm text-[#8C7065] mt-0.5 font-medium">
            Tối ưu tốc độ bấm đơn nhanh khi livestream TikTok bán đồ em bé
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetForm}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#8C7065] bg-white hover:bg-[#FFF9F6] rounded-2xl transition-colors border border-[#FDE2E4] cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Làm mới form
          </button>
        </div>
      </div>

      {/* Success banner after order creation */}
      {lastCreatedOrderCode && (
        <div className="p-4.5 bg-[#EBF9F6] border border-[#B8ECE1] rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#48C9B0] text-white flex items-center justify-center shrink-0 shadow-sm">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-[#238774] font-['Nunito',sans-serif]">
                Tạo đơn thành công! Mã đơn: <span className="font-mono text-[#186053] font-black">{lastCreatedOrderCode}</span>
              </p>
              <p className="text-xs text-[#238774] mt-0.5 font-medium">
                Đơn hàng đã được lưu và cập nhật tức thì vào Lịch sử đơn hàng Moniu.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => setActiveTab('orders')}
              className="text-xs font-bold px-3.5 py-2 bg-[#238774] hover:bg-[#1E7363] text-white rounded-2xl transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
            >
              Xem trong Lịch sử đơn
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setLastCreatedOrderCode(null)}
              className="text-xs font-bold px-3.5 py-2 bg-white text-[#238774] hover:bg-[#EBF9F6] rounded-2xl transition-colors border border-[#B8ECE1] cursor-pointer"
            >
              Chốt tiếp đơn mới
            </button>
          </div>
        </div>
      )}

      {/* Main Order Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Customer & Products (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card: Thông tin khách hàng & Người nhận */}
          <div className="bg-white rounded-3xl p-6 border border-[#FDE2E4] shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#FFF0F1] pb-3.5">
              <h2 className="text-sm font-extrabold text-[#3D271D] flex items-center gap-2 font-['Nunito',sans-serif]">
                <User className="w-4 h-4 text-[#FF5B65]" />
                Thông tin người nhận (Mẹ / Bé)
              </h2>

              {/* Order Code Generator */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#8C7065] font-semibold">Mã đơn tự sinh:</span>
                <div className="flex items-center bg-[#FFF0F1] border border-[#FCD2D6] rounded-xl px-2.5 py-1">
                  <span className="text-xs font-mono font-black text-[#FF5B65] tracking-wider">
                    {orderCode}
                  </span>
                  <button
                    type="button"
                    onClick={handleRegenerateCode}
                    className="ml-1.5 text-[#FF5B65] hover:text-[#E84A54] transition-colors cursor-pointer"
                    title="Đổi mã ngẫu nhiên mới"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#3D271D] mb-1.5">
                  Tên khách / Nickname TikTok <span className="text-[#FF5B65]">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#8C7065] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Ví dụ: Mẹ Bắp, Mẹ Sóc,..."
                    className="w-full bg-[#FFF9F6] focus:bg-white text-xs text-[#3D271D] pl-10 pr-3.5 py-2.5 rounded-2xl border border-[#FDE2E4] focus:border-[#FF5B65] focus:ring-2 focus:ring-[#FF5B65]/15 outline-hidden font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#3D271D] mb-1.5">
                  Số điện thoại <span className="text-[#FF5B65]">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#8C7065] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="0987 123 456"
                    className="w-full bg-[#FFF9F6] focus:bg-white text-xs text-[#3D271D] pl-10 pr-3.5 py-2.5 rounded-2xl border border-[#FDE2E4] focus:border-[#FF5B65] focus:ring-2 focus:ring-[#FF5B65]/15 outline-hidden font-medium"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3D271D] mb-1.5">
                Địa chỉ giao hàng <span className="text-[#FF5B65]">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-[#8C7065] absolute left-3.5 top-3" />
                <textarea
                  rows={2}
                  required
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Số nhà, tên đường, Phường/Xã, Quận/Huyện, Tỉnh/Thành phố..."
                  className="w-full bg-[#FFF9F6] focus:bg-white text-xs text-[#3D271D] pl-10 pr-3.5 py-2 rounded-2xl border border-[#FDE2E4] focus:border-[#FF5B65] focus:ring-2 focus:ring-[#FF5B65]/15 outline-hidden leading-relaxed font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3D271D] mb-1.5">
                Ghi chú đơn (Size tháng/tuổi bé, dặn dò giao hàng)
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 text-[#8C7065] absolute left-3.5 top-2.5" />
                <input
                  type="text"
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  placeholder="Ví dụ: Bé 8kg lấy size 6-9M, tặng thêm kẹp nơ..."
                  className="w-full bg-[#FFF9F6] focus:bg-white text-xs text-[#3D271D] pl-10 pr-3.5 py-2 rounded-2xl border border-[#FDE2E4] focus:border-[#FF5B65] focus:ring-2 focus:ring-[#FF5B65]/15 outline-hidden font-medium"
                />
              </div>
            </div>
          </div>

          {/* Card: Danh sách sản phẩm đồ em bé */}
          <div className="bg-white rounded-3xl p-6 border border-[#FDE2E4] shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#FFF0F1] pb-3.5">
              <div>
                <h2 className="text-sm font-extrabold text-[#3D271D] flex items-center gap-2 font-['Nunito',sans-serif]">
                  <Package className="w-4 h-4 text-[#FF5B65]" />
                  Đồ bé yêu trong đơn
                </h2>
                <p className="text-xs text-[#8C7065] mt-0.5">
                  Bấm chọn nhanh mã hot bên cạnh để tự động điền giá & biến thể
                </p>
              </div>

              {/* Quick Catalog Chips */}
              <div className="flex flex-wrap gap-1.5">
                {products.map((p) => (
                  <button
                    key={p.code}
                    type="button"
                    onClick={() => handleQuickSelectCatalogProduct(p.code)}
                    className="text-[11px] font-bold px-2.5 py-1 bg-[#FFF9F6] hover:bg-[#FFF0F1] text-[#3D271D] hover:text-[#FF5B65] rounded-xl transition-colors border border-[#FDE2E4] cursor-pointer"
                  >
                    + {p.code} ({formatCurrency(p.price)})
                  </button>
                ))}
              </div>
            </div>

            {/* Product items table / rows */}
            <div className="space-y-3">
              {orderItems.map((item, index) => (
                <div
                  key={item.id}
                  className="p-4 bg-[#FFF9F6]/80 hover:bg-[#FFF9F6] rounded-2xl border border-[#FDE2E4] transition-all space-y-3"
                >
                  <div className="grid grid-cols-12 gap-2.5 items-center">
                    {/* Mã SP */}
                    <div className="col-span-3 sm:col-span-2">
                      <label className="block text-[10px] font-bold text-[#8C7065] mb-1">
                        Mã SP
                      </label>
                      <input
                        type="text"
                        placeholder="B01"
                        value={item.productCode}
                        onChange={(e) => handleItemChange(index, 'productCode', e.target.value)}
                        className="w-full bg-white text-xs font-black text-[#FF5B65] px-2.5 py-2 rounded-xl border border-[#FDE2E4] uppercase"
                      />
                    </div>

                    {/* Tên sản phẩm */}
                    <div className="col-span-9 sm:col-span-4">
                      <label className="block text-[10px] font-bold text-[#8C7065] mb-1">
                        Tên sản phẩm
                      </label>
                      <input
                        type="text"
                        placeholder="Set body chip / váy..."
                        value={item.productName}
                        onChange={(e) => handleItemChange(index, 'productName', e.target.value)}
                        className="w-full bg-white text-xs text-[#3D271D] font-bold px-2.5 py-2 rounded-xl border border-[#FDE2E4]"
                      />
                    </div>

                    {/* Phân loại / Biến thể (Màu & Size tháng/tuổi) */}
                    <div className="col-span-6 sm:col-span-3">
                      <label className="block text-[10px] font-bold text-[#8C7065] mb-1">
                        Màu sắc & Size (0-3M, 1-2Y,...)
                      </label>
                      <input
                        type="text"
                        placeholder="Hồng / 6-9M"
                        value={item.variant}
                        onChange={(e) => handleItemChange(index, 'variant', e.target.value)}
                        className="w-full bg-white text-xs text-[#3D271D] font-medium px-2.5 py-2 rounded-xl border border-[#FDE2E4]"
                      />
                    </div>

                    {/* Đơn giá */}
                    <div className="col-span-6 sm:col-span-2">
                      <label className="block text-[10px] font-bold text-[#8C7065] mb-1">
                        Đơn giá (đ)
                      </label>
                      <input
                        type="number"
                        placeholder="189000"
                        value={item.unitPrice || ''}
                        onChange={(e) =>
                          handleItemChange(index, 'unitPrice', Number(e.target.value))
                        }
                        className="w-full bg-white text-xs font-black text-[#3D271D] px-2 py-2 rounded-xl border border-[#FDE2E4]"
                      />
                    </div>

                    {/* Số lượng & Xóa */}
                    <div className="col-span-12 sm:col-span-1 flex items-center justify-between sm:justify-end gap-2 pt-1 sm:pt-4">
                      <div className="flex items-center sm:hidden">
                        <span className="text-xs text-[#8C7065] mr-2 font-bold">Số lượng:</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(index, 'quantity', Math.max(1, Number(e.target.value)))
                          }
                          className="w-14 bg-white text-xs font-black text-center text-[#3D271D] py-2 rounded-xl border border-[#FDE2E4]"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="p-2 text-[#8C7065] hover:text-[#FF5B65] hover:bg-[#FFF0F1] rounded-xl transition-colors cursor-pointer"
                          title="Xóa sản phẩm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Line Total */}
                  <div className="text-right text-[11px] text-[#8C7065] border-t border-[#FDE2E4] pt-2">
                    Thành tiền dòng này:{' '}
                    <strong className="text-[#FF5B65] font-black text-xs">
                      {formatCurrency((item.unitPrice || 0) * (item.quantity || 1))}
                    </strong>
                  </div>
                </div>
              ))}
            </div>

            {/* Add product button */}
            <button
              type="button"
              onClick={handleAddItem}
              className="w-full py-3 border-2 border-dashed border-[#FDE2E4] hover:border-[#FF5B65] hover:bg-[#FFF0F1]/40 rounded-2xl text-xs font-bold text-[#8C7065] hover:text-[#FF5B65] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Thêm món đồ khác vào đơn
            </button>
          </div>
        </div>

        {/* Right Column: Payment & Shipping & Summary (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card: Vận chuyển & Thanh toán */}
          <div className="bg-white rounded-3xl p-6 border border-[#FDE2E4] shadow-2xs space-y-4">
            <h2 className="text-sm font-extrabold text-[#3D271D] flex items-center gap-2 border-b border-[#FFF0F1] pb-3.5 font-['Nunito',sans-serif]">
              <Truck className="w-4 h-4 text-[#FF5B65]" />
              Giao hàng & Thanh toán
            </h2>

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-bold text-[#3D271D] mb-2">
                Phương thức thanh toán
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('COD')}
                  className={`p-3 rounded-2xl border text-xs font-bold text-center transition-all cursor-pointer ${
                    paymentMethod === 'COD'
                      ? 'border-[#FF5B65] bg-[#FFF0F1] text-[#FF5B65] shadow-2xs'
                      : 'border-[#FDE2E4] text-[#8C7065] hover:bg-[#FFF9F6]'
                  }`}
                >
                  <CreditCard className="w-4 h-4 mx-auto mb-1 text-[#FF5B65]" />
                  Tiền mặt (COD)
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('Chuyển khoản')}
                  className={`p-3 rounded-2xl border text-xs font-bold text-center transition-all cursor-pointer ${
                    paymentMethod === 'Chuyển khoản'
                      ? 'border-[#48C9B0] bg-[#EBF9F6] text-[#238774] shadow-2xs'
                      : 'border-[#FDE2E4] text-[#8C7065] hover:bg-[#FFF9F6]'
                  }`}
                >
                  <CreditCard className="w-4 h-4 mx-auto mb-1 text-[#238774]" />
                  Chuyển khoản
                </button>
              </div>
            </div>

            {/* Carrier */}
            <div>
              <label className="block text-xs font-bold text-[#3D271D] mb-2">
                Đơn vị vận chuyển
              </label>
              <select
                value={carrier}
                onChange={(e) => setCarrier(e.target.value as ShippingCarrier)}
                className="w-full bg-[#FFF9F6] text-xs font-bold text-[#3D271D] px-3.5 py-2.5 rounded-2xl border border-[#FDE2E4] focus:outline-hidden focus:border-[#FF5B65]"
              >
                <option value="GHN">GHN (Giao Hàng Nhanh)</option>
                <option value="GHTK">GHTK (Giao Hàng Tiết Kiệm)</option>
                <option value="J&T Express">J&T Express</option>
                <option value="Viettel Post">Viettel Post</option>
              </select>
            </div>
          </div>

          {/* Card: Tổng kết thanh toán */}
          <div className="bg-white rounded-3xl p-6 border border-[#FDE2E4] shadow-2xs space-y-4">
            <h2 className="text-sm font-extrabold text-[#3D271D] border-b border-[#FFF0F1] pb-3.5 font-['Nunito',sans-serif]">
              Chi tiết thanh toán
            </h2>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-[#8C7065] font-medium">
                <span>Tạm tính tiền hàng:</span>
                <span className="font-bold text-[#3D271D]">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#8C7065] font-medium">
                <span>Phí vận chuyển:</span>
                <span>
                  {shippingFee === 0 ? (
                    <span className="text-[#238774] font-bold">Freeship đơn bé</span>
                  ) : (
                    <span className="font-bold text-[#3D271D]">{formatCurrency(shippingFee)}</span>
                  )}
                </span>
              </div>
              <div className="flex justify-between text-[#8C7065] font-medium">
                <span>Ưu đãi chốt live:</span>
                <span className="text-[#3D271D] font-bold">0đ</span>
              </div>
              <div className="pt-3 border-t border-[#FDE2E4] flex justify-between items-center text-sm font-bold text-[#3D271D]">
                <span>Tổng thanh toán:</span>
                <span className="text-xl font-black text-[#FF5B65] font-['Nunito',sans-serif]">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 space-y-2">
              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-[#FF5B65] to-[#F14652] hover:from-[#E84A54] hover:to-[#DE3D49] text-white rounded-2xl text-sm font-extrabold shadow-lg shadow-[#FF5B65]/30 transition-all flex items-center justify-center gap-2 cursor-pointer font-['Nunito',sans-serif]"
              >
                <CheckCircle2 className="w-5 h-5" />
                Chốt đơn ngay
              </button>

              <button
                type="button"
                onClick={handleResetForm}
                className="w-full py-2.5 bg-[#FFF9F6] hover:bg-[#FFF0F1] text-[#8C7065] rounded-2xl text-xs font-bold transition-colors cursor-pointer border border-[#FDE2E4]"
              >
                Hủy bỏ & Làm mới form
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
