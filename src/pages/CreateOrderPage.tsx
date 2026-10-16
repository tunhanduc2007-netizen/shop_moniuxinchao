import React, { useState, useEffect, useMemo } from 'react';
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
  Search,
  X,
  Tag,
  Filter,
  Sparkles,
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

  // State for 330 real products picker modal
  const [isProductPickerOpen, setIsProductPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerBrand, setPickerBrand] = useState('all');
  const [pickerCategory, setPickerCategory] = useState('all');
  const [activeRowForPicker, setActiveRowForPicker] = useState<number | null>(null);

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
        const val = String(value).trim().toLowerCase();
        const found = products.find(
          (p) =>
            p.code.toLowerCase() === val ||
            p.code.toLowerCase().replace('-', '') === val ||
            (p.tiktokId && p.tiktokId.toLowerCase() === val)
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

  const handleSelectFromPicker = (prod: (typeof products)[0]) => {
    const newItem: OrderItem = {
      id: Math.random().toString(),
      productCode: prod.code,
      productName: prod.name,
      variant: prod.variants[0] || 'Chuẩn',
      unitPrice: prod.price,
      quantity: 1,
    };

    if (activeRowForPicker !== null && orderItems[activeRowForPicker]) {
      setOrderItems((prev) => {
        const updated = [...prev];
        updated[activeRowForPicker] = newItem;
        return updated;
      });
    } else {
      const emptyIndex = orderItems.findIndex(
        (it) => !it.productCode && !it.productName
      );
      if (emptyIndex !== -1) {
        setOrderItems((prev) => {
          const updated = [...prev];
          updated[emptyIndex] = newItem;
          return updated;
        });
      } else {
        setOrderItems((prev) => [...prev, newItem]);
      }
    }

    setIsProductPickerOpen(false);
    setActiveRowForPicker(null);
  };

  const handleQuickSelectCatalogProduct = (prodCode: string) => {
    const prod = products.find((p) => p.code === prodCode);
    if (!prod) return;
    handleSelectFromPicker(prod);
  };

  const filteredPickerProducts = React.useMemo(() => {
    return products.filter((p) => {
      const q = pickerSearch.toLowerCase().trim();
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        (p.tiktokId && p.tiktokId.includes(q)) ||
        (p.brand && p.brand.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q));

      const matchBrand = pickerBrand === 'all' || p.brand === pickerBrand;
      const matchCategory = pickerCategory === 'all' || p.category === pickerCategory;

      return matchSearch && matchBrand && matchCategory;
    });
  }, [products, pickerSearch, pickerBrand, pickerCategory]);

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
                  Kho 330 sản phẩm thực tế (NOUS, LA POMME, MONONA) sẵn sàng chốt live
                </p>
              </div>

              {/* Quick Search Button & Top Chips */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setActiveRowForPicker(null);
                    setIsProductPickerOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#FFF0F1] hover:bg-[#FDE2E4] text-[#FF5B65] rounded-xl text-xs font-black border border-[#FCD2D6] transition-all shadow-2xs cursor-pointer font-['Nunito',sans-serif]"
                >
                  <Search className="w-3.5 h-3.5" />
                  Tra cứu kho 330 SP
                </button>

                <div className="hidden sm:flex items-center gap-1.5">
                  {products.slice(0, 4).map((p) => (
                    <button
                      key={p.code}
                      type="button"
                      onClick={() => handleQuickSelectCatalogProduct(p.code)}
                      className="text-[11px] font-bold px-2 py-1 bg-[#FFF9F6] hover:bg-[#FFF0F1] text-[#3D271D] hover:text-[#FF5B65] rounded-xl transition-colors border border-[#FDE2E4] cursor-pointer"
                      title={p.name}
                    >
                      + {p.code}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Product items table / rows */}
            <div className="space-y-3">
              {orderItems.map((item, index) => {
                const matched = products.find(
                  (p) =>
                    p.code.toLowerCase() === item.productCode.toLowerCase() ||
                    (p.tiktokId && p.tiktokId === item.productCode)
                );

                return (
                  <div
                    key={item.id}
                    className="p-4 bg-[#FFF9F6]/80 hover:bg-[#FFF9F6] rounded-2xl border border-[#FDE2E4] transition-all space-y-3"
                  >
                    <div className="grid grid-cols-12 gap-2.5 items-start">
                      {/* Mã SP */}
                      <div className="col-span-4 sm:col-span-2">
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[10px] font-bold text-[#8C7065]">
                            Mã SP
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveRowForPicker(index);
                              setIsProductPickerOpen(true);
                            }}
                            className="text-[10px] text-[#FF5B65] font-bold hover:underline cursor-pointer"
                            title="Chọn từ 330 sản phẩm thực tế"
                          >
                            Kho 330
                          </button>
                        </div>
                        <input
                          type="text"
                          placeholder="MN-001"
                          value={item.productCode}
                          onChange={(e) => handleItemChange(index, 'productCode', e.target.value)}
                          className="w-full bg-white text-xs font-black text-[#FF5B65] px-2.5 py-2 rounded-xl border border-[#FDE2E4] uppercase"
                        />
                      </div>

                      {/* Tên sản phẩm */}
                      <div className="col-span-8 sm:col-span-4">
                        <div className="flex items-center gap-1 mb-1">
                          <label className="block text-[10px] font-bold text-[#8C7065]">
                            Tên sản phẩm
                          </label>
                          {matched?.brand && (
                            <span className="text-[9px] font-black px-1.5 py-0.2 rounded-md bg-[#FFF0F1] text-[#FF5B65] border border-[#FCD2D6]">
                              {matched.brand}
                            </span>
                          )}
                        </div>
                        <input
                          type="text"
                          placeholder="Tên đồ bé (NOUS, LA POMME, MONONA...)"
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
                          placeholder="Size tháng / màu"
                          value={item.variant}
                          onChange={(e) => handleItemChange(index, 'variant', e.target.value)}
                          className="w-full bg-white text-xs text-[#3D271D] font-medium px-2.5 py-2 rounded-xl border border-[#FDE2E4]"
                        />
                        {/* Quick Variant Selection Chips */}
                        {matched?.variants && matched.variants.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {matched.variants.map((v) => (
                              <button
                                key={v}
                                type="button"
                                onClick={() => handleItemChange(index, 'variant', v)}
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition-colors cursor-pointer ${
                                  item.variant === v
                                    ? 'bg-[#FF5B65] text-white border-[#FF5B65]'
                                    : 'bg-white text-[#8C7065] border-[#FDE2E4] hover:bg-[#FFF0F1] hover:text-[#FF5B65]'
                                }`}
                              >
                                {v}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Đơn giá */}
                      <div className="col-span-6 sm:col-span-2">
                        <label className="block text-[10px] font-bold text-[#8C7065] mb-1">
                          Đơn giá (đ)
                        </label>
                        <input
                          type="number"
                          placeholder="195000"
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
                );
              })}
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

      {/* Modal: Tra cứu kho 330 sản phẩm thực tế */}
      {isProductPickerOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#3D271D]/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div
            className="relative bg-white rounded-3xl shadow-2xl border border-[#FDE2E4] w-full max-w-4xl max-h-[88vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#FFF0F1] flex items-center justify-between bg-gradient-to-r from-[#FFF0F1] to-[#FFF9F6]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FF5B65] text-white flex items-center justify-center font-black shadow-sm">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#3D271D] font-['Nunito',sans-serif] flex items-center gap-2">
                    Kho 330 sản phẩm thực tế Moniu
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white text-[#FF5B65] border border-[#FCD2D6]">
                      TikTok Shop
                    </span>
                  </h3>
                  <p className="text-xs text-[#8C7065] mt-0.5 font-medium">
                    Hàng chính hãng NOUS, LA POMME, MONONA cho mẹ & bé
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsProductPickerOpen(false);
                  setActiveRowForPicker(null);
                }}
                className="p-2 text-[#8C7065] hover:text-[#FF5B65] hover:bg-[#FFF0F1] rounded-2xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search & Filters */}
            <div className="p-4 sm:p-5 border-b border-[#FFF0F1] bg-[#FFF9F6]/50 space-y-3 shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 text-[#8C7065] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  autoFocus
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  placeholder="Tìm theo tên sản phẩm, mã (MN-001...), mã TikTok Shop (581...), chất liệu..."
                  className="w-full bg-white text-xs text-[#3D271D] pl-10 pr-9 py-2.5 rounded-2xl border border-[#FDE2E4] focus:outline-hidden focus:border-[#FF5B65] focus:ring-2 focus:ring-[#FF5B65]/15 font-medium"
                />
                {pickerSearch && (
                  <button
                    onClick={() => setPickerSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8C7065] hover:text-[#3D271D]"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Brand Filters */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <span className="text-[11px] font-bold text-[#8C7065] mr-1">Thương hiệu:</span>
                {[
                  { id: 'all', label: 'Tất cả (330)' },
                  { id: 'NOUS', label: 'NOUS (137)' },
                  { id: 'LA POMME', label: 'LA POMME (31)' },
                  { id: 'MONONA', label: 'MONONA (21)' },
                ].map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setPickerBrand(b.id)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      pickerBrand === b.id
                        ? 'bg-[#FF5B65] text-white shadow-xs'
                        : 'bg-white text-[#8C7065] hover:bg-[#FFF0F1] border border-[#FDE2E4]'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>

              {/* Category Filters */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <span className="text-[11px] font-bold text-[#8C7065] mr-1">Danh mục:</span>
                {[
                  'all',
                  'Bodysuit',
                  'Bộ quần áo',
                  'Chăn gối',
                  'Áo khoác',
                  'Váy đầm',
                  'Phụ kiện',
                  'Quà tặng',
                ].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setPickerCategory(cat)}
                    className={`px-2.5 py-0.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                      pickerCategory === cat
                        ? 'bg-[#3D271D] text-white font-bold'
                        : 'bg-white text-[#8C7065] hover:bg-[#FFF9F6] border border-[#FDE2E4]'
                    }`}
                  >
                    {cat === 'all' ? 'Tất cả loại' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Product List */}
            <div className="p-4 sm:p-5 overflow-y-auto flex-1 divide-y divide-[#FFF0F1]">
              <div className="flex items-center justify-between pb-3 text-xs text-[#8C7065] font-semibold">
                <span>
                  Tìm thấy <strong className="text-[#FF5B65] font-black">{filteredPickerProducts.length}</strong> sản phẩm phù hợp
                </span>
                <span className="text-[11px]">Bấm vào sản phẩm để thêm vào đơn</span>
              </div>

              {filteredPickerProducts.length === 0 ? (
                <div className="py-16 text-center text-[#8C7065]">
                  <Package className="w-10 h-10 mx-auto text-[#FF5B65]/40 mb-2" />
                  <p className="text-xs font-bold text-[#3D271D]">Không tìm thấy sản phẩm nào</p>
                  <p className="text-[11px] text-[#8C7065] mt-1">
                    Hãy thử gõ từ khóa khác như "nous", "bodysuit", "chăn"...
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3">
                  {filteredPickerProducts.slice(0, 60).map((prod) => (
                    <div
                      key={prod.code}
                      onClick={() => handleSelectFromPicker(prod)}
                      className="p-3 bg-white hover:bg-[#FFF9F6] border border-[#FDE2E4] hover:border-[#FF5B65] rounded-2xl transition-all cursor-pointer flex gap-3 group relative shadow-2xs hover:shadow-md"
                    >
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="w-16 h-16 rounded-xl object-cover border border-[#FDE2E4] shrink-0 bg-[#FFF0F1]"
                      />

                      <div className="min-w-0 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-mono font-black text-[10px] text-[#FF5B65] bg-[#FFF0F1] px-1.5 py-0.5 rounded-md border border-[#FCD2D6]">
                              {prod.code}
                            </span>
                            {prod.brand && (
                              <span className="text-[9px] font-black text-[#238774] bg-[#EBF9F6] px-1.5 py-0.5 rounded-md border border-[#B8ECE1]">
                                {prod.brand}
                              </span>
                            )}
                            <span className="text-[9px] text-[#8C7065] font-semibold">
                              {prod.category}
                            </span>
                          </div>

                          <h4 className="text-xs font-bold text-[#3D271D] line-clamp-2 mt-1 group-hover:text-[#FF5B65] transition-colors leading-snug">
                            {prod.name}
                          </h4>
                        </div>

                        <div className="flex items-center justify-between pt-1.5 border-t border-[#FFF0F1] mt-1.5">
                          <span className="text-xs font-black text-[#FF5B65] font-['Nunito',sans-serif]">
                            {prod.price === 0 ? 'Quà tặng kèm (0đ)' : formatCurrency(prod.price)}
                          </span>

                          <span className="text-[10px] font-bold px-2 py-0.5 bg-[#FFF0F1] text-[#FF5B65] rounded-lg group-hover:bg-[#FF5B65] group-hover:text-white transition-colors">
                            + Thêm
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-[#FFF0F1] bg-[#FFF9F6] flex items-center justify-between text-xs text-[#8C7065]">
              <span>Kho dữ liệu đồng bộ TikTok Shop chính thức</span>
              <button
                type="button"
                onClick={() => {
                  setIsProductPickerOpen(false);
                  setActiveRowForPicker(null);
                }}
                className="px-4 py-1.5 bg-white border border-[#FDE2E4] rounded-xl font-bold text-[#3D271D] hover:bg-[#FFF0F1] transition-colors cursor-pointer"
              >
                Đóng cửa sổ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
