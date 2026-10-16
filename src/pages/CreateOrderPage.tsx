import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Wand2,
  QrCode,
  ShoppingBag,
  Zap,
  ChevronDown,
  Minus,
  Gift,
  Percent,
  Crown,
  Award,
  Star,
  Check,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import type { OrderItem, PaymentMethod, ShippingCarrier, ProductCatalogItem, Customer } from '../types';
import { CUSTOMER_RANKS } from '../types';
import { formatCurrency } from '../utils/formatters';
import { getNextSuggestedBabySize } from '../utils/customerUtils';
import { searchAddressSuggestions, AddressSuggestion, POPULAR_PROVINCES } from '../utils/addressUtils';
import { SizeSelectionModal } from '../components/SizeSelectionModal';

export const CreateOrderPage: React.FC = () => {
  const {
    orders,
    customers,
    products,
    settings,
    generateUniqueCode,
    addOrder,
    setActiveTab,
    pendingOrderItem,
    setPendingOrderItem,
    initialOrderPrefill,
    setInitialOrderPrefill,
    showToast,
  } = useShop();

  // Form states
  const [orderCode, setOrderCode] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [orderNote, setOrderNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
  const [carrier, setCarrier] = useState<ShippingCarrier>(settings.defaultCarrier);

  // Livestream specific features: Freeship & Discount
  const [isLiveFreeship, setIsLiveFreeship] = useState(true); // Default true for live convenience
  const [discountAmount, setDiscountAmount] = useState(0);

  // Products in order (starts empty for clean, fast workflow)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [lastCreatedOrderCode, setLastCreatedOrderCode] = useState<string | null>(null);

  // Fast Product Search dropdown state
  const [fastSearchQuery, setFastSearchQuery] = useState('');
  const [isFastSearchOpen, setIsFastSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Smart Live Comment Parser state
  const [isParserOpen, setIsParserOpen] = useState(false);
  const [rawCommentText, setRawCommentText] = useState('');

  // 330 products full picker modal state
  const [isProductPickerOpen, setIsProductPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerBrand, setPickerBrand] = useState('all');
  const [pickerCategory, setPickerCategory] = useState('all');
  const [pickerProductForSize, setPickerProductForSize] = useState<ProductCatalogItem | null>(null);

  // VietQR modal state
  const [showQrModal, setShowQrModal] = useState(false);

  // Dynamic brand counts for picker
  const pickerBrandStats = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p) => {
      const b = p.brand || 'Khác';
      counts[b] = (counts[b] || 0) + 1;
    });
    return {
      all: products.length,
      nous: counts['NOUS'] || 0,
      lapomme: counts['LA POMME'] || 0,
      monona: counts['MONONA'] || 0,
      moniu: counts['Moniu'] || 0,
    };
  }, [products]);

  // Handle customer prefill from Customers page or external actions
  useEffect(() => {
    if (initialOrderPrefill) {
      if (initialOrderPrefill.customerName) setCustomerName(initialOrderPrefill.customerName);
      if (initialOrderPrefill.customerPhone) setCustomerPhone(initialOrderPrefill.customerPhone);
      if (initialOrderPrefill.shippingAddress) setShippingAddress(initialOrderPrefill.shippingAddress);
      setInitialOrderPrefill(null);
    }
  }, [initialOrderPrefill, setInitialOrderPrefill]);

  // KEY 1: SỐ ĐIỆN THOẠI (100% precision)
  const cleanPhone = useMemo(() => customerPhone.replace(/\D/g, ''), [customerPhone]);

  const recognizedCustomer = useMemo(() => {
    if (cleanPhone.length < 8) return null;
    return customers.find((c) => c.phone.replace(/\D/g, '') === cleanPhone) || null;
  }, [cleanPhone, customers]);

  // KEY 2: NICKNAME TIKTOK / TÊN KHÁCH (Auto-suggest dropdown)
  const [isNameSuggestionsOpen, setIsNameSuggestionsOpen] = useState(false);
  const nameInputRef = useRef<HTMLDivElement>(null);

  const nameSuggestions = useMemo(() => {
    const query = customerName.trim().toLowerCase();
    if (query.length < 2) return [];
    return customers
      .filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.phone.replace(/\D/g, '').includes(query)
      )
      .slice(0, 5);
  }, [customerName, customers]);

  const handleSelectSuggestedCustomer = (cust: Customer) => {
    setCustomerName(cust.name);
    setCustomerPhone(cust.phone);
    if (cust.address) setShippingAddress(cust.address);
    setIsNameSuggestionsOpen(false);

    // Auto-apply VIP discount if available
    const rankInfo = CUSTOMER_RANKS[cust.rank];
    if (rankInfo && rankInfo.discountPercent > 0 && subtotal > 0) {
      const discount = Math.round((subtotal * rankInfo.discountPercent) / 100);
      setDiscountAmount(discount);
    }

    showToast({
      type: 'success',
      title: 'Đã nhận diện khách quen!',
      message: `Mẹ ${cust.name} • ${rankInfo.label} (${cust.totalOrders} đơn)`,
    });
  };

  const handleApplyVipDiscount = () => {
    if (!recognizedCustomer) return;
    const rankInfo = CUSTOMER_RANKS[recognizedCustomer.rank];
    if (rankInfo && rankInfo.discountPercent > 0) {
      const discount = Math.round((subtotal * rankInfo.discountPercent) / 100);
      setDiscountAmount(discount);
      showToast({
        type: 'success',
        title: `Đã áp dụng giảm -${rankInfo.discountPercent}% VIP`,
        message: `Tiết kiệm ${formatCurrency(discount)} dành riêng cho ${rankInfo.label}!`,
      });
    }
  };

  // Close name suggestions dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (nameInputRef.current && !nameInputRef.current.contains(e.target as Node)) {
        setIsNameSuggestionsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ADDRESS & STREET AUTOCOMPLETE (vietnamese-provinces-database)
  const [isAddressSuggestionsOpen, setIsAddressSuggestionsOpen] = useState(false);
  const addressContainerRef = useRef<HTMLDivElement>(null);

  const addressSuggestions = useMemo(() => {
    if (!shippingAddress || shippingAddress.trim().length < 2) return [];
    return searchAddressSuggestions(shippingAddress, 6);
  }, [shippingAddress]);

  const handleSelectAddressSuggestion = (suggestion: AddressSuggestion) => {
    setShippingAddress(suggestion.fullAddress);
    setIsAddressSuggestionsOpen(false);
    showToast({
      type: 'info',
      title: 'Đã điền địa chỉ chuẩn',
      message: suggestion.fullAddress,
    });
  };

  const handleAddProvinceChip = (provinceName: string) => {
    setShippingAddress((prev) => {
      const clean = prev.trim();
      if (!clean) return `${provinceName}`;
      if (clean.toLowerCase().includes(provinceName.toLowerCase())) return clean;
      return `${clean}, ${provinceName}`;
    });
  };

  // Close address suggestions dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (addressContainerRef.current && !addressContainerRef.current.contains(e.target as Node)) {
        setIsAddressSuggestionsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  // Auto-receive product with size from other tabs
  useEffect(() => {
    if (pendingOrderItem) {
      setOrderItems((prev) => [...prev, pendingOrderItem]);
      setPendingOrderItem(null);
    }
  }, [pendingOrderItem, setPendingOrderItem]);

  useEffect(() => {
    setOrderCode(generateUniqueCode());
  }, []);

  // Close search popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsFastSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut: F9 or Ctrl+Enter to submit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F9' || (e.key === 'Enter' && (e.ctrlKey || e.metaKey))) {
        e.preventDefault();
        submitOrder();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const handleRegenerateCode = () => {
    setOrderCode(generateUniqueCode());
  };

  // Add a product with exact size in 1 click
  const handleAddProductWithVariant = (prod: ProductCatalogItem, variantName?: string) => {
    const selectedVariant = variantName || (prod.variants && prod.variants.length > 0 ? prod.variants[0] : 'Tiêu chuẩn');

    // Check if same product & size already exists in order
    const existingIndex = orderItems.findIndex(
      (it) => it.productCode === prod.code && it.variant === selectedVariant
    );

    if (existingIndex !== -1) {
      // Increase quantity
      setOrderItems((prev) => {
        const updated = [...prev];
        updated[existingIndex].quantity = (Number(updated[existingIndex].quantity) || 1) + 1;
        return updated;
      });
      showToast({
        type: 'info',
        title: 'Đã tăng số lượng',
        message: `${prod.name} (${selectedVariant}) x${orderItems[existingIndex].quantity + 1}`,
        code: prod.code,
      });
    } else {
      // Add new item
      const newItem: OrderItem = {
        id: Math.random().toString(),
        productCode: prod.code,
        productName: prod.name,
        variant: selectedVariant,
        unitPrice: prod.price,
        quantity: 1,
        image: prod.image,
      };
      setOrderItems((prev) => [...prev, newItem]);
      showToast({
        type: 'success',
        title: 'Đã thêm vào đơn',
        message: `${prod.name} (${selectedVariant})`,
        code: prod.code,
      });
    }

    setFastSearchQuery('');
    setIsFastSearchOpen(false);
  };

  // Change quantity
  const handleQuantityChange = (index: number, delta: number) => {
    setOrderItems((prev) => {
      const updated = [...prev];
      const cur = Number(updated[index].quantity) || 1;
      const next = Math.max(1, cur + delta);
      updated[index] = { ...updated[index], quantity: next };
      return updated;
    });
  };

  // Remove item
  const handleRemoveItem = (index: number) => {
    setOrderItems(orderItems.filter((_, idx) => idx !== index));
  };

  // Update item field directly
  const handleItemFieldChange = (index: number, field: keyof OrderItem, val: any) => {
    setOrderItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: val };
      return updated;
    });
  };

  // Add empty manual row
  const handleAddManualRow = () => {
    const newItem: OrderItem = {
      id: Math.random().toString(),
      productCode: '',
      productName: '',
      variant: 'Tiêu chuẩn',
      unitPrice: 0,
      quantity: 1,
    };
    setOrderItems((prev) => [...prev, newItem]);
  };

  // Filtered products for instant fast search
  const fastSearchResults = useMemo(() => {
    const q = fastSearchQuery.toLowerCase().trim();
    if (!q) return [];
    return products
      .filter((p) => {
        return (
          p.code.toLowerCase().includes(q) ||
          p.code.toLowerCase().replace('-', '').includes(q) ||
          p.name.toLowerCase().includes(q) ||
          (p.tiktokId && p.tiktokId.includes(q)) ||
          (p.brand && p.brand.toLowerCase().includes(q)) ||
          (p.category && p.category.toLowerCase().includes(q))
        );
      })
      .slice(0, 6);
  }, [products, fastSearchQuery]);

  // Full picker filtered products
  const filteredPickerProducts = useMemo(() => {
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

  // Smart Live Comment Parser
  const handleParseComment = () => {
    if (!rawCommentText.trim()) return;
    const text = rawCommentText.trim();

    // 1. Phone extraction (10 digits starting with 0)
    let phone = '';
    const phoneMatch = text.match(/\b(0[35789]\d{8})\b/);
    if (phoneMatch) {
      phone = phoneMatch[1];
    }

    // 2. Product code extraction (MN-001, MN001, MN 001)
    let matchedProd: ProductCatalogItem | undefined;
    const codeMatch = text.match(/\b(MN[\s-]?[0-9]{1,3})\b/i);
    if (codeMatch) {
      const numStr = codeMatch[1].replace(/[^0-9]/g, '');
      const formattedCode = `MN-${parseInt(numStr, 10).toString().padStart(3, '0')}`;
      matchedProd = products.find((p) => p.code.toLowerCase() === formattedCode.toLowerCase());
    }

    // If no MN code, try matching product by keywords (bodysuit, chăn, khẩu trang,...)
    if (!matchedProd) {
      const words = text.toLowerCase();
      matchedProd = products.find((p) => {
        const titleLower = p.name.toLowerCase();
        return words.includes(p.code.toLowerCase()) || (p.tiktokId && words.includes(p.tiktokId));
      });
    }

    // 3. Size extraction
    let detectedSize = '';
    const sizeMatch = text.match(
      /\b(NB|Newborn|0-3[mM]?|3-6[mM]?|6-9[mM]?|9-12[mM]?|12-18[mM]?|18-24[mM]?|2-3[yY]?|3-4[yY]?|S|M|L)\b/i
    );
    if (sizeMatch) {
      detectedSize = sizeMatch[1].toUpperCase();
      if (!detectedSize.endsWith('M') && !detectedSize.endsWith('Y') && !['NB', 'NEWBORN', 'S', 'M', 'L'].includes(detectedSize)) {
        detectedSize += 'M';
      }
    }

    // 4. Name extraction
    let cleanText = text
      .replace(phone, '')
      .replace(codeMatch ? codeMatch[0] : '', '')
      .replace(sizeMatch ? sizeMatch[0] : '', '')
      .replace(/\b(chốt|size|sdt|sđt|đt|lấy|cho em|em lấy|bộ|mẫu|dặn|ship|món)\b/gi, '')
      .trim();

    const words = cleanText.split(/\s+/).filter(Boolean);
    let nameParts: string[] = [];
    let addrParts: string[] = [];
    let isNamePhase = true;

    for (const w of words) {
      const lower = w.toLowerCase();
      if (
        ['hà nội', 'hcm', 'hn', 'đường', 'phố', 'ngõ', 'quận', 'huyện', 'tỉnh', 'xã', 'phường', 'tp'].some((k) =>
          lower.includes(k)
        )
      ) {
        isNamePhase = false;
      }
      if (isNamePhase && nameParts.length < 3) {
        nameParts.push(w);
      } else {
        addrParts.push(w);
      }
    }

    const detectedName = nameParts.join(' ');
    const detectedAddress = addrParts.join(' ');

    // Fill form
    if (phone) setCustomerPhone(phone);
    if (detectedName) setCustomerName(detectedName);
    if (detectedAddress) setShippingAddress(detectedAddress);

    // If product was found, add to order
    if (matchedProd) {
      const finalSize =
        detectedSize || (matchedProd.variants && matchedProd.variants.length > 0 ? matchedProd.variants[0] : 'Tiêu chuẩn');
      handleAddProductWithVariant(matchedProd, finalSize);
    }

    showToast({
      type: 'success',
      title: '⚡ Đã bóc tách comment!',
      message: `${detectedName ? `Khách: ${detectedName}` : ''} ${matchedProd ? `— Đồ: ${matchedProd.code}` : ''} ${detectedSize ? `(${detectedSize})` : ''}`,
    });

    setRawCommentText('');
  };

  // Calculations
  const subtotal = useMemo(() => {
    return orderItems.reduce(
      (sum, item) => sum + (Number(item.unitPrice) || 0) * (Number(item.quantity) || 1),
      0
    );
  }, [orderItems]);

  const shippingFee = useMemo(() => {
    if (isLiveFreeship) return 0;
    if (subtotal >= settings.freeShippingThreshold && subtotal > 0) return 0;
    return settings.defaultShippingFee;
  }, [isLiveFreeship, subtotal, settings]);

  const totalAmount = Math.max(0, subtotal + shippingFee - discountAmount);

  const handleResetForm = () => {
    setOrderCode(generateUniqueCode());
    setCustomerName('');
    setCustomerPhone('');
    setShippingAddress('');
    setOrderNote('');
    setPaymentMethod('COD');
    setCarrier(settings.defaultCarrier);
    setIsLiveFreeship(true);
    setDiscountAmount(0);
    setOrderItems([]);
    setLastCreatedOrderCode(null);
  };

  const submitOrder = async () => {
    if (!customerName.trim()) {
      showToast({
        type: 'warning',
        title: 'Thiếu tên người nhận',
        message: 'Vui lòng nhập Tên khách hoặc Nickname TikTok',
      });
      return;
    }

    if (orderItems.length === 0) {
      showToast({
        type: 'warning',
        title: 'Đơn chưa có đồ bé',
        message: 'Vui lòng tìm và thêm ít nhất một món đồ bé vào đơn',
      });
      return;
    }

    const created = await addOrder({
      code: orderCode,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      shippingAddress: shippingAddress.trim(),
      orderNote: orderNote.trim(),
      paymentMethod,
      carrier,
      items: orderItems.map((item) => ({
        ...item,
        unitPrice: Number(item.unitPrice) || 0,
        quantity: Number(item.quantity) || 1,
      })),
      subtotal,
      shippingFee,
      discount: discountAmount,
      totalAmount,
      status: 'Chờ xử lý',
      shippingStatus: 'Chờ lấy hàng',
    });

    setLastCreatedOrderCode(created.code);
    showToast({
      type: 'success',
      title: '🎉 Chốt đơn live thành công!',
      message: `Đơn ${created.code} cho ${customerName} (${formatCurrency(totalAmount)})`,
      code: created.code,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitOrder();
  };

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto notranslate" translate="no">
      {/* Title & Quick Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-[#3D271D] tracking-tight font-['Nunito',sans-serif]">
              Tạo đơn chốt live
            </h1>
            <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-[#FFF0F1] text-[#FF5B65] border border-[#FCD2D6] flex items-center gap-1.5 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#FF5B65] animate-ping" />
              Moniu Live Fast-Entry
            </span>
          </div>
          <p className="text-sm text-[#8C7065] mt-1 font-medium">
            Tối ưu bấm đơn siêu tốc: gõ tìm kiếm kèm size 1-click hoặc bóc tách bình luận live
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setIsParserOpen(!isParserOpen)}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-2xl transition-all cursor-pointer border ${
              isParserOpen
                ? 'bg-[#FF5B65] text-white border-[#FF5B65] shadow-xs'
                : 'bg-white text-[#FF5B65] hover:bg-[#FFF0F1] border-[#FCD2D6]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            {isParserOpen ? 'Đóng bóc tách comment' : '⚡ Bóc tách comment live'}
          </button>

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

      {/* Smart Live Comment Parser Box */}
      {isParserOpen && (
        <div className="bg-gradient-to-r from-[#FFF0F1] via-[#FFF9F6] to-[#FFF0F1] border-2 border-[#FCD2D6] rounded-3xl p-4 sm:p-5 shadow-xs space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-[#FF5B65] flex items-center gap-1.5 font-['Nunito',sans-serif]">
              <Wand2 className="w-4 h-4" />
              Bóc tách thông minh từ bình luận Livestream TikTok / Shopee
            </span>
            <span className="text-[11px] text-[#8C7065] font-medium hidden sm:inline">
              Tự động nhận diện: SĐT, Tên khách, Mã SP (MN-001...), Size
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="text"
              autoFocus
              value={rawCommentText}
              onChange={(e) => setRawCommentText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleParseComment();
                }
              }}
              placeholder="Dán bình luận tại đây: Ví dụ: 0987123456 mẹ Bắp chốt MN-001 size 3-6M số 12 Cầu Giấy Hà Nội..."
              className="flex-1 bg-white text-xs text-[#3D271D] px-4 py-2.5 rounded-2xl border border-[#FDE2E4] focus:outline-hidden focus:border-[#FF5B65] focus:ring-2 focus:ring-[#FF5B65]/15 font-medium"
            />
            <button
              type="button"
              onClick={handleParseComment}
              className="px-5 py-2.5 bg-[#FF5B65] hover:bg-[#E84A54] text-white rounded-2xl text-xs font-black transition-all shadow-xs shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              Bóc tách & Điền tức thì
            </button>
          </div>
        </div>
      )}

      {/* Success banner after order creation */}
      {lastCreatedOrderCode && (
        <div className="p-4.5 bg-[#EBF9F6] border border-[#B8ECE1] rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#48C9B0] text-white flex items-center justify-center shrink-0 shadow-sm">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-[#238774] font-['Nunito',sans-serif]">
                Tạo đơn thành công! Mã đơn:{' '}
                <span className="font-mono text-[#186053] font-black">{lastCreatedOrderCode}</span>
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
        {/* Left Column: Products First & Customer Info (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* CARD 1: ĐỒ BÉ TRONG ĐƠN (TIỆN NGHI HÀNG ĐẦU) */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#FDE2E4] shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#FFF0F1] pb-4">
              <div>
                <h2 className="text-sm font-black text-[#3D271D] flex items-center gap-2 font-['Nunito',sans-serif]">
                  <ShoppingBag className="w-4 h-4 text-[#FF5B65]" />
                  Đồ bé yêu trong đơn
                  {orderItems.length > 0 && (
                    <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-[#FF5B65] text-white">
                      {orderItems.reduce((acc, it) => acc + (Number(it.quantity) || 1), 0)} món
                    </span>
                  )}
                </h2>
                <p className="text-xs text-[#8C7065] mt-0.5 font-medium">
                  Chọn đồ bé từ kho 330 sản phẩm thực tế (NOUS, LA POMME, MONONA)
                </p>
              </div>

              {/* Browse Catalog 330 button */}
              <button
                type="button"
                onClick={() => setIsProductPickerOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-[#FFF0F1] hover:bg-[#FDE2E4] text-[#FF5B65] rounded-2xl text-xs font-black border border-[#FCD2D6] transition-all shadow-2xs cursor-pointer self-start sm:self-auto shrink-0"
              >
                <Package className="w-4 h-4" />
                Kho 330 mẫu (kèm ảnh)
              </button>
            </div>

            {/* INSTANT FAST SEARCH BAR WITH INLINE 1-CLICK SIZE PILLS */}
            <div className="relative" ref={searchContainerRef}>
              <div className="relative">
                <Search className="w-4 h-4 text-[#FF5B65] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={fastSearchQuery}
                  onChange={(e) => {
                    setFastSearchQuery(e.target.value);
                    setIsFastSearchOpen(true);
                  }}
                  onFocus={() => setIsFastSearchOpen(true)}
                  placeholder="🔍 Gõ mã MN-..., tên đồ bé (bodysuit, áo khoác, nous, la pomme)..."
                  className="w-full bg-[#FFF9F6] focus:bg-white text-xs text-[#3D271D] font-bold pl-10 pr-10 py-3 rounded-2xl border-2 border-[#FDE2E4] focus:border-[#FF5B65] focus:ring-2 focus:ring-[#FF5B65]/15 outline-hidden shadow-2xs transition-all"
                />
                {fastSearchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setFastSearchQuery('');
                      setIsFastSearchOpen(false);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8C7065] hover:text-[#3D271D] p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Fast Search Results Popover */}
              {isFastSearchOpen && fastSearchResults.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-white rounded-2xl shadow-xl border border-[#FDE2E4] overflow-hidden max-h-96 overflow-y-auto divide-y divide-[#FFF0F1] animate-in fade-in zoom-in-95 duration-150">
                  <div className="p-2 bg-[#FFF9F6] text-[11px] font-bold text-[#8C7065] flex items-center justify-between">
                    <span>Tìm thấy {fastSearchResults.length} sản phẩm (Bấm size để thêm ngay):</span>
                    <button
                      type="button"
                      onClick={() => setIsFastSearchOpen(false)}
                      className="text-[10px] text-[#FF5B65] hover:underline cursor-pointer"
                    >
                      Đóng
                    </button>
                  </div>
                  {fastSearchResults.map((prod) => (
                    <div
                      key={prod.code}
                      className="p-3 hover:bg-[#FFF9F6] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-12 h-12 rounded-xl object-cover border border-[#FDE2E4] shrink-0 bg-[#FFF0F1]"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-black text-[11px] text-[#FF5B65] bg-[#FFF0F1] px-1.5 py-0.5 rounded-md">
                              {prod.code}
                            </span>
                            {prod.brand && (
                              <span className="text-[10px] font-extrabold text-[#238774] bg-[#EBF9F6] px-1.5 py-0.5 rounded-md">
                                {prod.brand}
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-bold text-[#3D271D] truncate mt-0.5 max-w-sm">
                            {prod.name}
                          </p>
                          <p className="text-xs font-black text-[#FF5B65] mt-0.5">
                            {prod.price === 0 ? 'Quà tặng' : formatCurrency(prod.price)}
                          </p>
                        </div>
                      </div>

                      {/* 1-Click Size Pills */}
                      <div className="flex items-center gap-1 flex-wrap shrink-0">
                        <span className="text-[10px] font-bold text-[#8C7065] mr-1 hidden sm:inline">
                          Size:
                        </span>
                        {(prod.variants && prod.variants.length > 0 ? prod.variants : ['Tiêu chuẩn']).map((v) => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => handleAddProductWithVariant(prod, v)}
                            className="px-2 py-1 rounded-lg text-[10px] font-extrabold bg-white hover:bg-[#FF5B65] text-[#3D271D] hover:text-white border border-[#FDE2E4] hover:border-[#FF5B65] transition-all shadow-2xs cursor-pointer active:scale-95"
                            title={`Thêm ${prod.name} size ${v}`}
                          >
                            + {v}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ORDER ITEMS LIST TABLE / CARDS */}
            {orderItems.length === 0 ? (
              <div className="py-8 px-4 rounded-2xl border-2 border-dashed border-[#FDE2E4] text-center space-y-3 bg-[#FFF9F6]/40">
                <div className="w-12 h-12 rounded-2xl bg-[#FFF0F1] text-[#FF5B65] flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#3D271D]">Chưa có món đồ nào trong đơn</p>
                  <p className="text-[11px] text-[#8C7065] mt-0.5">
                    Gõ tìm kiếm ở ô trên (bấm chọn size 1-click) hoặc bấm nút &quot;Kho 330 mẫu&quot; để chọn
                  </p>
                </div>
                {/* Quick Hot Suggestions */}
                <div className="flex items-center justify-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] font-bold text-[#8C7065]">Thêm nhanh mẫu HOT:</span>
                  {products.slice(0, 4).map((p) => (
                    <button
                      key={p.code}
                      type="button"
                      onClick={() => handleAddProductWithVariant(p)}
                      className="text-[10px] font-bold px-2 py-1 bg-white hover:bg-[#FFF0F1] text-[#FF5B65] rounded-xl border border-[#FDE2E4] transition-all cursor-pointer shadow-2xs"
                    >
                      + {p.code} ({p.name.slice(0, 16)}...)
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                {orderItems.map((item, index) => {
                  const matched = products.find(
                    (p) =>
                      p.code.toLowerCase() === item.productCode.toLowerCase() ||
                      (p.tiktokId && p.tiktokId === item.productCode)
                  );
                  const availableVariants = matched?.variants || [];

                  return (
                    <div
                      key={item.id}
                      className="p-3 sm:p-3.5 bg-[#FFF9F6] hover:bg-white rounded-2xl border border-[#FDE2E4] transition-all space-y-2 shadow-2xs group"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        {/* Thumbnail & Product Details */}
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {item.image || matched?.image ? (
                            <img
                              src={item.image || matched?.image}
                              alt={item.productName}
                              className="w-12 h-12 rounded-xl object-cover border border-[#FDE2E4] shrink-0 bg-white"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-[#FFF0F1] text-[#FF5B65] flex items-center justify-center shrink-0 border border-[#FCD2D6] font-bold text-xs">
                              {item.productCode || 'SP'}
                            </div>
                          )}

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {item.productCode && (
                                <span className="font-mono font-black text-[10px] text-[#FF5B65] bg-[#FFF0F1] px-1.5 py-0.5 rounded-md">
                                  {item.productCode}
                                </span>
                              )}
                              {matched?.brand && (
                                <span className="text-[9px] font-black text-[#238774] bg-[#EBF9F6] px-1.5 py-0.5 rounded-md">
                                  {matched.brand}
                                </span>
                              )}
                              {matched?.category && (
                                <span className="text-[9px] font-bold text-[#8C7065] hidden sm:inline">
                                  • {matched.category}
                                </span>
                              )}
                            </div>
                            <p className="text-xs font-bold text-[#3D271D] truncate mt-0.5">
                              {item.productName || 'Món đồ tự nhập'}
                            </p>
                          </div>
                        </div>

                        {/* Size / Variant Selector & Quantity & Price */}
                        <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                          {/* Size Pill with instant options */}
                          <div className="relative">
                            {availableVariants.length > 0 ? (
                              <select
                                value={item.variant}
                                onChange={(e) => handleItemFieldChange(index, 'variant', e.target.value)}
                                className="text-xs font-bold text-[#3D271D] bg-white px-2.5 py-1.5 rounded-xl border border-[#FDE2E4] focus:border-[#FF5B65] outline-hidden cursor-pointer shadow-2xs"
                              >
                                {availableVariants.map((v) => (
                                  <option key={v} value={v}>
                                    Size: {v}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type="text"
                                placeholder="Size/màu"
                                value={item.variant}
                                onChange={(e) => handleItemFieldChange(index, 'variant', e.target.value)}
                                className="w-24 text-xs font-bold text-[#3D271D] bg-white px-2.5 py-1.5 rounded-xl border border-[#FDE2E4] outline-hidden"
                              />
                            )}
                          </div>

                          {/* Quantity Stepper (- 1 +) */}
                          <div className="flex items-center bg-white border border-[#FDE2E4] rounded-xl shadow-2xs overflow-hidden">
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(index, -1)}
                              className="w-7 h-7 flex items-center justify-center text-[#8C7065] hover:text-[#FF5B65] hover:bg-[#FFF0F1] transition-colors cursor-pointer"
                              title="Giảm 1"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-7 text-center font-black text-xs text-[#3D271D]">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(index, 1)}
                              className="w-7 h-7 flex items-center justify-center text-[#8C7065] hover:text-[#FF5B65] hover:bg-[#FFF0F1] transition-colors cursor-pointer"
                              title="Tăng 1"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Line total */}
                          <div className="text-right min-w-[70px]">
                            <span className="text-xs font-black text-[#FF5B65] block font-['Nunito',sans-serif]">
                              {formatCurrency((item.unitPrice || 0) * (item.quantity || 1))}
                            </span>
                            <span className="text-[10px] text-[#8C7065] font-medium block">
                              {formatCurrency(item.unitPrice || 0)} / món
                            </span>
                          </div>

                          {/* Remove item */}
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="p-1.5 text-[#8C7065] hover:text-[#FF5B65] hover:bg-[#FFF0F1] rounded-xl transition-colors cursor-pointer"
                            title="Xóa món này"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Bottom Actions of Products Card */}
            <div className="flex items-center justify-between pt-2 border-t border-[#FFF0F1]">
              <button
                type="button"
                onClick={handleAddManualRow}
                className="text-[11px] font-bold text-[#8C7065] hover:text-[#FF5B65] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Thêm dòng tự gõ tay
              </button>

              {orderItems.length > 0 && (
                <button
                  type="button"
                  onClick={() => setOrderItems([])}
                  className="text-[11px] font-bold text-[#8C7065] hover:text-[#FF5B65] transition-colors cursor-pointer"
                >
                  Xóa hết đồ trong đơn
                </button>
              )}
            </div>
          </div>

          {/* CARD 2: THÔNG TIN KHÁCH HÀNG & NGƯỜI NHẬN */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#FDE2E4] shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#FFF0F1] pb-3.5">
              <h2 className="text-sm font-black text-[#3D271D] flex items-center gap-2 font-['Nunito',sans-serif]">
                <User className="w-4 h-4 text-[#FF5B65]" />
                Thông tin người nhận (Mẹ / Bé)
              </h2>

              {/* Order Code Generator */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#8C7065] font-semibold">Mã đơn:</span>
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

            {/* RECOGNITION NOTIFICATION PANEL (KEY 1: SĐT & REPEAT CUSTOMER RECOGNITION) */}
            {recognizedCustomer ? (
              <div
                className={`p-4 rounded-3xl border transition-all animate-in fade-in slide-in-from-top-2 shadow-xs ${
                  recognizedCustomer.rank === 'Mẹ Kim Cương'
                    ? 'bg-gradient-to-br from-[#FAF5FF] via-[#F3E8FF] to-[#FAF5FF] border-[#D8B4FE]'
                    : recognizedCustomer.rank === 'Mẹ Thông Thái'
                    ? 'bg-gradient-to-br from-[#FFFBEB] via-[#FEF3C7] to-[#FFFBEB] border-[#FCD34D]'
                    : recognizedCustomer.rank === 'Bé Ngoan'
                    ? 'bg-gradient-to-br from-[#F0FDF4] via-[#DCFCE7] to-[#F0FDF4] border-[#86EFAC]'
                    : 'bg-gradient-to-br from-[#FFF1F2] via-[#FFE4E6] to-[#FFF1F2] border-[#FECDD3]'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-black/5">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">
                      {CUSTOMER_RANKS[recognizedCustomer.rank].icon}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-[#3D271D]">
                          {CUSTOMER_RANKS[recognizedCustomer.rank].label}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white/80 border border-black/10 text-[#3D271D]">
                          ✨ Khách quen quay lại
                        </span>
                      </div>
                      <p className="text-[11px] text-[#5C453B] font-medium">
                        Đã mua <span className="font-black text-[#FF5B65]">{recognizedCustomer.totalOrders} đơn</span> • Tổng tích lũy <span className="font-black text-[#FF5B65]">{formatCurrency(recognizedCustomer.totalSpent)}</span>
                      </p>
                    </div>
                  </div>

                  {/* 1-Click Auto-Fill Address Button */}
                  {recognizedCustomer.address && (
                    <button
                      type="button"
                      onClick={() => {
                        setCustomerName(recognizedCustomer.name);
                        setShippingAddress(recognizedCustomer.address || '');
                        showToast({
                          type: 'success',
                          title: 'Đã tự điền địa chỉ cũ!',
                          message: `Đã điền địa chỉ của mẹ ${recognizedCustomer.name}`,
                        });
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FF5B65] hover:bg-[#E84A54] text-white rounded-xl text-xs font-black shadow-xs hover:shadow-md transition-all cursor-pointer shrink-0 active:scale-95"
                    >
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      ⚡ Tự điền địa chỉ cũ
                    </button>
                  )}
                </div>

                {/* Saved Address preview */}
                <div className="mt-2.5 flex items-start gap-2 text-xs text-[#3D271D]">
                  <MapPin className="w-3.5 h-3.5 text-[#FF5B65] mt-0.5 shrink-0" />
                  <span className="font-medium leading-relaxed">
                    <span className="font-bold">Địa chỉ quen thuộc:</span> {recognizedCustomer.address || 'Chưa lưu địa chỉ chi tiết'}
                  </span>
                </div>

                {/* VIP Discount Benefit */}
                {CUSTOMER_RANKS[recognizedCustomer.rank].discountPercent > 0 && (
                  <div className="mt-2.5 p-2.5 rounded-2xl bg-white/70 border border-black/5 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Gift className="w-4 h-4 text-[#FF5B65]" />
                      <span className="text-xs font-bold text-[#3D271D]">
                        Quyền lợi Rank: Giảm <span className="text-[#FF5B65] font-black">-{CUSTOMER_RANKS[recognizedCustomer.rank].discountPercent}% VIP</span>
                        {subtotal > 0 && (
                          <span className="text-[#8C7065] ml-1">
                            (= {formatCurrency(Math.round((subtotal * CUSTOMER_RANKS[recognizedCustomer.rank].discountPercent) / 100))})
                          </span>
                        )}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleApplyVipDiscount}
                      className="px-2.5 py-1 bg-white border border-[#FF5B65]/30 hover:border-[#FF5B65] text-[#FF5B65] hover:bg-[#FFF0F1] text-[11px] font-black rounded-xl transition-all cursor-pointer shadow-2xs"
                    >
                      🎁 Áp dụng -{CUSTOMER_RANKS[recognizedCustomer.rank].discountPercent}% vào đơn
                    </button>
                  </div>
                )}

                {/* Baby Size Memory & Suggestion */}
                {recognizedCustomer.lastBabySize && (
                  <div className="mt-2 text-xs text-[#6B554D] flex items-center justify-between gap-2 bg-white/50 px-3 py-1.5 rounded-xl border border-black/5">
                    <span>
                      👶 Lần trước mẹ lấy size: <strong className="text-[#3D271D]">{recognizedCustomer.lastBabySize}</strong> • {getNextSuggestedBabySize(recognizedCustomer.lastBabySize)}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const suggestion = getNextSuggestedBabySize(recognizedCustomer.lastBabySize);
                        setOrderNote((prev) => (prev ? `${prev} | ${suggestion}` : suggestion));
                        showToast({
                          type: 'info',
                          title: 'Đã thêm gợi ý size',
                          message: 'Đã thêm ghi chú size bé vào đơn hàng.',
                        });
                      }}
                      className="text-[11px] font-bold text-[#FF5B65] hover:underline cursor-pointer shrink-0"
                    >
                      + Thêm vào ghi chú
                    </button>
                  </div>
                )}
              </div>
            ) : cleanPhone.length >= 9 ? (
              <div className="p-3 bg-gradient-to-r from-[#FFF8E6] to-[#FFF0F1] border border-[#FDE199] rounded-2xl flex items-center justify-between gap-2 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <span className="text-base">🥉</span>
                  <div>
                    <p className="text-xs font-black text-[#8A5D00]">Khách mới (Hạng Mầm Nhỏ)</p>
                    <p className="text-[11px] text-[#8C7065]">
                      Đơn hàng đầu tiên của mẹ tại Moniu Xin Chào! Tặng kèm thiệp cảm ơn & quà sticker Nous.
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* KEY 2: TÊN KHÁCH / NICKNAME TIKTOK (WITH AUTO-SUGGEST DROPDOWN) */}
              <div className="relative" ref={nameInputRef}>
                <label className="block text-xs font-bold text-[#3D271D] mb-1.5">
                  Tên khách / Nickname TikTok <span className="text-[#FF5B65]">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#8C7065] absolute left-3.5 top-1/2 -translate-y-1/2 z-10" />
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      setIsNameSuggestionsOpen(true);
                    }}
                    onFocus={() => {
                      if (customerName.trim().length >= 2) setIsNameSuggestionsOpen(true);
                    }}
                    placeholder="Ví dụ: Mẹ Bắp, Mẹ Sóc,..."
                    className="w-full bg-[#FFF9F6] focus:bg-white text-xs text-[#3D271D] pl-10 pr-3.5 py-2.5 rounded-2xl border border-[#FDE2E4] focus:border-[#FF5B65] focus:ring-2 focus:ring-[#FF5B65]/15 outline-hidden font-medium"
                  />
                </div>

                {/* Auto-suggest dropdown menu when typing customer nickname/name */}
                {isNameSuggestionsOpen && nameSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl border border-[#FCD2D6] shadow-xl z-50 overflow-hidden animate-in fade-in duration-150">
                    <div className="p-2 bg-[#FFF0F1] border-b border-[#FCD2D6] flex items-center justify-between text-[11px] font-bold text-[#FF5B65]">
                      <span>🔍 Tìm thấy {nameSuggestions.length} khách quen Moniu:</span>
                      <button
                        type="button"
                        onClick={() => setIsNameSuggestionsOpen(false)}
                        className="text-[#8C7065] hover:text-[#3D271D] cursor-pointer"
                      >
                        Đóng ✕
                      </button>
                    </div>
                    <div className="divide-y divide-[#FFF0F1] max-h-56 overflow-y-auto">
                      {nameSuggestions.map((cust) => (
                        <div
                          key={cust.id || cust.phone}
                          onClick={() => handleSelectSuggestedCustomer(cust)}
                          className="p-3 hover:bg-[#FFF9F6] cursor-pointer transition-colors flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-black text-xs text-[#3D271D]">
                                {cust.name}
                              </span>
                              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${CUSTOMER_RANKS[cust.rank].badgeBg} ${CUSTOMER_RANKS[cust.rank].badgeText}`}>
                                {CUSTOMER_RANKS[cust.rank].icon} {cust.rank}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#8C7065] truncate mt-0.5">
                              📞 {cust.phone} {cust.address ? `• 📍 ${cust.address}` : ''}
                            </p>
                            <p className="text-[10px] text-[#A68F86]">
                              Đã mua {cust.totalOrders} đơn ({formatCurrency(cust.totalSpent)})
                            </p>
                          </div>
                          <button
                            type="button"
                            className="px-2 py-1 bg-[#FFF0F1] text-[#FF5B65] hover:bg-[#FF5B65] hover:text-white rounded-xl text-[10px] font-bold transition-colors cursor-pointer shrink-0"
                          >
                            Chọn ➔
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* KEY 1: SỐ ĐIỆN THOẠI (100% precision) */}
              <div>
                <label className="block text-xs font-bold text-[#3D271D] mb-1.5 flex items-center justify-between">
                  <span>Số điện thoại <span className="text-[#FF5B65]">*</span></span>
                  {recognizedCustomer && (
                    <span className="text-[10px] font-black text-[#238774] flex items-center gap-1">
                      <Check className="w-3 h-3 stroke-[3]" /> Khách quen chuẩn xác
                    </span>
                  )}
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


            {/* ĐỊA CHỈ GIAO HÀNG VỚI GỢI Ý TÊN ĐƯỜNG & HÀNH CHÍNH VIETNAMESE-PROVINCES */}
            <div className="relative" ref={addressContainerRef}>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-[#3D271D] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#FF5B65]" />
                  <span>Địa chỉ giao hàng (Nhập đầy đủ để giao tận tay) <span className="text-[#FF5B65]">*</span></span>
                </label>
                {shippingAddress && (
                  <button
                    type="button"
                    onClick={() => setShippingAddress('')}
                    className="text-[10px] text-[#8C7065] hover:text-[#FF5B65] font-bold cursor-pointer"
                  >
                    Xóa địa chỉ
                  </button>
                )}
              </div>

              <div className="relative">
                <MapPin className="w-4 h-4 text-[#8C7065] absolute left-3.5 top-3 z-10" />
                <textarea
                  rows={2}
                  required
                  value={shippingAddress}
                  onChange={(e) => {
                    setShippingAddress(e.target.value);
                    setIsAddressSuggestionsOpen(true);
                  }}
                  onFocus={() => {
                    if (shippingAddress.trim().length >= 2) {
                      setIsAddressSuggestionsOpen(true);
                    }
                  }}
                  placeholder="Số nhà, tên đường, Phường/Xã, Quận/Huyện, Tỉnh/Thành phố..."
                  className="w-full bg-[#FFF9F6] focus:bg-white text-xs text-[#3D271D] pl-10 pr-3.5 py-2 rounded-2xl border border-[#FDE2E4] focus:border-[#FF5B65] focus:ring-2 focus:ring-[#FF5B65]/15 outline-hidden leading-relaxed font-medium"
                />
              </div>

              {/* FLOATING ADDRESS & STREET SUGGESTIONS MENU */}
              {isAddressSuggestionsOpen && addressSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl border border-[#FCD2D6] shadow-xl z-50 overflow-hidden animate-in fade-in duration-150">
                  <div className="p-2.5 bg-gradient-to-r from-[#FFF0F1] to-[#FFF9F6] border-b border-[#FCD2D6] flex items-center justify-between text-[11px] font-black text-[#FF5B65]">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#FF5B65]" />
                      Gợi ý tên đường & địa chỉ chuẩn Việt Nam ({addressSuggestions.length}):
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsAddressSuggestionsOpen(false)}
                      className="text-[#8C7065] hover:text-[#3D271D] font-bold cursor-pointer"
                    >
                      Đóng ✕
                    </button>
                  </div>
                  <div className="divide-y divide-[#FFF0F1] max-h-60 overflow-y-auto">
                    {addressSuggestions.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSelectAddressSuggestion(item)}
                        className="p-3 hover:bg-[#FFF9F6] cursor-pointer transition-colors flex items-center justify-between gap-2.5"
                      >
                        <div className="min-w-0 flex items-start gap-2.5">
                          <MapPin className="w-4 h-4 text-[#FF5B65] mt-0.5 shrink-0" />
                          <div>
                            <p className="text-xs font-bold text-[#3D271D] leading-snug">
                              {item.fullAddress}
                            </p>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-[#FFF0F1] text-[#FF5B65]">
                                {item.province}
                              </span>
                              {item.district && (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#F5F2F0] text-[#6E584F]">
                                  {item.district}
                                </span>
                              )}
                              {item.postalCode && (
                                <span className="text-[10px] font-mono text-[#8C7065]">
                                  Mã bưu chính: {item.postalCode}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          className="px-2.5 py-1 bg-[#FFF0F1] text-[#FF5B65] hover:bg-[#FF5B65] hover:text-white rounded-xl text-[10px] font-black transition-colors cursor-pointer shrink-0"
                        >
                          Chọn ➔
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* QUICK PROVINCE CHIPS (NÚT CHỌN NHANH TỈNH THÀNH KHI LIVE) */}
              <div className="mt-2 flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] text-[#8C7065]">
                <span className="shrink-0 font-bold text-[10px] text-[#A68F86]">Thêm nhanh:</span>
                {POPULAR_PROVINCES.slice(0, 8).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handleAddProvinceChip(p)}
                    className="shrink-0 px-2.5 py-1 rounded-xl bg-[#FFF9F6] hover:bg-[#FFF0F1] hover:text-[#FF5B65] border border-[#FDE2E4] font-medium text-[10px] transition-colors cursor-pointer"
                  >
                    + {p}
                  </button>
                ))}
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
        </div>

        {/* Right Column: Payment, Shipping, Live Offers & Checkout (5 cols - Sticky) */}
        <div className="lg:col-span-5 space-y-6">
          {/* CARD 1: VẬN CHUYỂN & ƯU ĐÃI LIVE */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#FDE2E4] shadow-2xs space-y-4">
            <h2 className="text-sm font-black text-[#3D271D] flex items-center gap-2 border-b border-[#FFF0F1] pb-3.5 font-['Nunito',sans-serif]">
              <Truck className="w-4 h-4 text-[#FF5B65]" />
              Vận chuyển & Ưu đãi Live
            </h2>

            {/* FREESHIP LIVE TOGGLE (CỰC KỲ TIỆN LỢI TRÊN LIVE) */}
            <div className="p-3 bg-gradient-to-r from-[#FFF0F1] to-[#FFF9F6] border border-[#FCD2D6] rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-[#FF5B65]" />
                <div>
                  <p className="text-xs font-black text-[#3D271D]">Freeship cho khách chốt live</p>
                  <p className="text-[10px] text-[#8C7065]">Miễn phí vận chuyển 0đ tức thì</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsLiveFreeship(!isLiveFreeship)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  isLiveFreeship ? 'bg-[#FF5B65]' : 'bg-[#E5D7D2]'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isLiveFreeship ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* DISCOUNT / VOUCHER INPUT */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-[#3D271D] flex items-center gap-1">
                  <Percent className="w-3.5 h-3.5 text-[#FF5B65]" />
                  Ưu đãi giảm giá chốt live (đ)
                </label>
                {discountAmount > 0 && (
                  <button
                    type="button"
                    onClick={() => setDiscountAmount(0)}
                    className="text-[10px] text-[#FF5B65] font-bold hover:underline"
                  >
                    Xóa giảm giá
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="0"
                  step="5000"
                  value={discountAmount || ''}
                  onChange={(e) => setDiscountAmount(Math.max(0, Number(e.target.value)))}
                  placeholder="0"
                  className="w-full bg-[#FFF9F6] focus:bg-white text-xs font-black text-[#FF5B65] px-3.5 py-2.5 rounded-2xl border border-[#FDE2E4] outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => setDiscountAmount(10000)}
                  className="px-2.5 py-2 rounded-xl text-[10px] font-bold bg-[#FFF0F1] hover:bg-[#FDE2E4] text-[#FF5B65] border border-[#FCD2D6] shrink-0 cursor-pointer"
                >
                  -10k
                </button>
                <button
                  type="button"
                  onClick={() => setDiscountAmount(20000)}
                  className="px-2.5 py-2 rounded-xl text-[10px] font-bold bg-[#FFF0F1] hover:bg-[#FDE2E4] text-[#FF5B65] border border-[#FCD2D6] shrink-0 cursor-pointer"
                >
                  -20k
                </button>
                <button
                  type="button"
                  onClick={() => setDiscountAmount(30000)}
                  className="px-2.5 py-2 rounded-xl text-[10px] font-bold bg-[#FFF0F1] hover:bg-[#FDE2E4] text-[#FF5B65] border border-[#FCD2D6] shrink-0 cursor-pointer"
                >
                  -30k
                </button>
              </div>
            </div>

            {/* Carrier */}
            <div>
              <label className="block text-xs font-bold text-[#3D271D] mb-1.5">
                Đơn vị vận chuyển
              </label>
              <select
                value={carrier}
                onChange={(e) => setCarrier(e.target.value as ShippingCarrier)}
                className="w-full bg-[#FFF9F6] text-xs font-bold text-[#3D271D] px-3.5 py-2.5 rounded-2xl border border-[#FDE2E4] focus:outline-hidden focus:border-[#FF5B65] cursor-pointer"
              >
                <option value="GHN">GHN (Giao Hàng Nhanh)</option>
                <option value="GHTK">GHTK (Giao Hàng Tiết Kiệm)</option>
                <option value="J&T Express">J&T Express</option>
                <option value="Viettel Post">Viettel Post</option>
              </select>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-bold text-[#3D271D] mb-1.5">
                Phương thức thanh toán
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('COD')}
                  className={`p-2.5 rounded-2xl border text-xs font-bold text-center transition-all cursor-pointer ${
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
                  className={`p-2.5 rounded-2xl border text-xs font-bold text-center transition-all cursor-pointer ${
                    paymentMethod === 'Chuyển khoản'
                      ? 'border-[#48C9B0] bg-[#EBF9F6] text-[#238774] shadow-2xs'
                      : 'border-[#FDE2E4] text-[#8C7065] hover:bg-[#FFF9F6]'
                  }`}
                >
                  <CreditCard className="w-4 h-4 mx-auto mb-1 text-[#238774]" />
                  Chuyển khoản
                </button>
              </div>

              {/* VietQR View Button if Chuyển khoản */}
              {paymentMethod === 'Chuyển khoản' && (
                <button
                  type="button"
                  onClick={() => setShowQrModal(true)}
                  className="w-full mt-2 py-2 px-3 bg-[#EBF9F6] hover:bg-[#D5F5EE] text-[#238774] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-[#B8ECE1] transition-colors cursor-pointer"
                >
                  <QrCode className="w-4 h-4" />
                  Xem mã VietQR chuyển khoản ({formatCurrency(totalAmount)})
                </button>
              )}
            </div>
          </div>

          {/* CARD 2: CHI TIẾT THANH TOÁN & NÚT CHỐT ĐƠN */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#FDE2E4] shadow-2xs space-y-4 sticky top-6">
            <h2 className="text-sm font-black text-[#3D271D] border-b border-[#FFF0F1] pb-3.5 font-['Nunito',sans-serif]">
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
                    <span className="text-[#238774] font-black bg-[#EBF9F6] px-2 py-0.5 rounded-md">
                      Miễn phí (Freeship live)
                    </span>
                  ) : (
                    <span className="font-bold text-[#3D271D]">{formatCurrency(shippingFee)}</span>
                  )}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-[#FF5B65] font-bold">
                  <span>Ưu đãi giảm giá live:</span>
                  <span>- {formatCurrency(discountAmount)}</span>
                </div>
              )}

              <div className="pt-3 border-t border-[#FDE2E4] flex justify-between items-center text-sm font-bold text-[#3D271D]">
                <span>Tổng thanh toán:</span>
                <span className="text-2xl font-black text-[#FF5B65] font-['Nunito',sans-serif] tracking-tight">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
            </div>

            {/* Big Action Submit Button */}
            <div className="pt-2 space-y-2">
              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-[#FF5B65] to-[#F14652] hover:from-[#E84A54] hover:to-[#DE3D49] text-white rounded-2xl text-sm font-black shadow-lg shadow-[#FF5B65]/35 hover:shadow-xl hover:shadow-[#FF5B65]/40 transition-all flex items-center justify-center gap-2 cursor-pointer font-['Nunito',sans-serif] active:scale-[0.98]"
              >
                <CheckCircle2 className="w-5 h-5" />
                CHỐT ĐƠN NGAY (F9 / Enter)
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

      {/* MODAL: TRA CỨU KHO 330 SẢN PHẨM THỰC TẾ (CÓ ẢNH VÀ SIZE CHỌN TRỰC TIẾP) */}
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
                      TikTok & Shopee Live
                    </span>
                  </h3>
                  <p className="text-xs text-[#8C7065] mt-0.5 font-medium">
                    Hàng chính hãng NOUS, LA POMME, MONONA cho mẹ & bé
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsProductPickerOpen(false)}
                className="p-2 text-[#8C7065] hover:text-[#FF5B65] hover:bg-[#FFF0F1] rounded-2xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search & Brand Filters */}
            <div className="p-4 sm:p-5 border-b border-[#FFF0F1] bg-[#FFF9F6]/50 space-y-3 shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 text-[#8C7065] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  autoFocus
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  placeholder="Tìm theo tên sản phẩm, mã (MN-001...), hãng NOUS, LA POMME, loại bodysuit..."
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

              {/* Brand Filter Buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none notranslate" translate="no">
                <span className="text-[11px] font-bold text-[#8C7065] mr-1 shrink-0">Hãng:</span>
                {[
                  { id: 'all', label: `Tất cả (${pickerBrandStats.all})` },
                  { id: 'NOUS', label: `NOUS (${pickerBrandStats.nous})` },
                  { id: 'LA POMME', label: `LA POMME (${pickerBrandStats.lapomme})` },
                  { id: 'MONONA', label: `MONONA (${pickerBrandStats.monona})` },
                  ...(pickerBrandStats.moniu > 0 ? [{ id: 'Moniu', label: `Moniu (${pickerBrandStats.moniu})` }] : []),
                ].map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    translate="no"
                    onClick={() => setPickerBrand(b.id)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer notranslate shrink-0 ${
                      pickerBrand === b.id
                        ? 'bg-[#FF5B65] text-white shadow-xs'
                        : 'bg-white text-[#8C7065] hover:bg-[#FFF0F1] border border-[#FDE2E4]'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <span className="text-[11px] font-bold text-[#8C7065] mr-1 shrink-0">Loại:</span>
                {[
                  { id: 'all', label: 'Tất cả loại' },
                  { id: 'Bộ quần áo bé', label: 'Bộ quần áo' },
                  { id: 'Bodysuit & Đồ liền', label: 'Bodysuit' },
                  { id: 'Áo & Áo khoác', label: 'Áo khoác' },
                  { id: 'Nón & Mũ bé', label: 'Nón / Mũ' },
                  { id: 'Yếm cho bé', label: 'Yếm' },
                  { id: 'Chăn gối & Đệm ngủ', label: 'Chăn gối' },
                  { id: 'Váy đầm bé gái', label: 'Váy đầm' },
                  { id: 'Quà tặng kèm', label: 'Quà tặng' },
                ].map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setPickerCategory(c.id)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                      pickerCategory === c.id
                        ? 'bg-[#3D271D] text-white shadow-xs'
                        : 'bg-white text-[#8C7065] hover:bg-[#FFF0F1] border border-[#FDE2E4]'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Grid in Modal */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {filteredPickerProducts.slice(0, 48).map((prod) => (
                  <div
                    key={prod.code}
                    className="p-3 bg-white rounded-2xl border border-[#FDE2E4] hover:border-[#FF5B65] hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div className="space-y-2">
                      <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-[#FFF0F1] border border-[#FDE2E4]">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute top-1.5 left-1.5 font-mono font-black text-[10px] text-white bg-[#FF5B65] px-2 py-0.5 rounded-md shadow-xs">
                          {prod.code}
                        </span>
                        {prod.brand && (
                          <span
                            translate="no"
                            className="absolute top-1.5 right-1.5 font-extrabold text-[9px] text-[#238774] bg-white/95 px-1.5 py-0.5 rounded-md shadow-xs notranslate"
                          >
                            {prod.brand}
                          </span>
                        )}
                      </div>

                      <div>
                        <p className="text-xs font-bold text-[#3D271D] line-clamp-2 leading-snug">
                          {prod.name}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs font-black text-[#FF5B65] font-['Nunito',sans-serif]">
                            {prod.price === 0 ? 'Quà tặng' : formatCurrency(prod.price)}
                          </span>
                          <span className="text-[10px] text-[#8C7065]">{prod.category}</span>
                        </div>
                      </div>
                    </div>

                    {/* Size selection pills in card */}
                    <div className="pt-2 border-t border-[#FFF0F1] mt-2">
                      <div className="flex items-center gap-1 flex-wrap">
                        {(prod.variants && prod.variants.length > 0 ? prod.variants : ['Tiêu chuẩn']).slice(0, 5).map((v) => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => {
                              handleAddProductWithVariant(prod, v);
                              setIsProductPickerOpen(false);
                            }}
                            className="px-2 py-0.5 bg-[#FFF0F1] hover:bg-[#FF5B65] text-[#FF5B65] hover:text-white rounded-lg text-[10px] font-black transition-all cursor-pointer"
                          >
                            + {v}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIETQR POPUP MODAL FOR CHUYỂN KHOẢN */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#3D271D]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="relative bg-white rounded-3xl shadow-2xl border border-[#FDE2E4] w-full max-w-sm p-6 text-center space-y-4 animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-[#FFF0F1] pb-3">
              <span className="text-sm font-black text-[#3D271D] font-['Nunito',sans-serif]">
                Mã VietQR thanh toán
              </span>
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="p-1 text-[#8C7065] hover:text-[#FF5B65]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-white rounded-2xl border-2 border-[#B8ECE1] shadow-sm inline-block">
              {/* VietQR Quick API Image */}
              <img
                src={`https://api.vietqr.io/image/970422-0987654321-compact2.jpg?amount=${totalAmount}&addInfo=${encodeURIComponent(orderCode)}&accountName=MONIU%20XIN%20CHAO`}
                alt="VietQR Code"
                className="w-48 h-48 mx-auto object-contain rounded-xl"
              />
            </div>

            <div className="text-xs text-[#8C7065] space-y-1">
              <p>
                Số tiền:{' '}
                <strong className="text-[#FF5B65] font-black text-sm">
                  {formatCurrency(totalAmount)}
                </strong>
              </p>
              <p>
                Nội dung CK: <strong className="font-mono text-[#3D271D]">{orderCode}</strong>
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 bg-[#238774] text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              Đã hiểu & Đóng
            </button>
          </div>
        </div>
      )}

      {/* Size Selection Modal (Fallback) */}
      {pickerProductForSize && (
        <SizeSelectionModal
          isOpen={true}
          product={pickerProductForSize}
          onClose={() => setPickerProductForSize(null)}
          onConfirm={(prod, size, qty) => {
            handleAddProductWithVariant(prod, size);
            setPickerProductForSize(null);
          }}
        />
      )}
    </div>
  );
};
