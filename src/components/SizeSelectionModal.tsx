import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  ShoppingBag,
  Sparkles,
  Heart,
  Plus,
  Minus,
  ArrowRight,
  Ruler,
  Info,
  Tag,
} from 'lucide-react';
import type { ProductCatalogItem } from '../types';
import { formatCurrency } from '../utils/formatters';

interface SizeSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductCatalogItem | null;
  onConfirm: (product: ProductCatalogItem, selectedSize: string, quantity: number) => void;
  confirmText?: string;
}

// Bảng tham chiếu size và cân nặng chuẩn cho bé sơ sinh & trẻ nhỏ
const BABY_SIZE_GUIDE: Record<string, string> = {
  'Newborn': 'Bé sơ sinh (3 - 5.5 kg)',
  '0-3M': 'Bé 0 - 3 tháng (4 - 6.5 kg)',
  '3-6M': 'Bé 3 - 6 tháng (6 - 8 kg)',
  '6-9M': 'Bé 6 - 9 tháng (8 - 9.5 kg)',
  '9-12M': 'Bé 9 - 12 tháng (9 - 11 kg)',
  '12-18M': 'Bé 12 - 18 tháng (10 - 12 kg)',
  '18-24M': 'Bé 18 - 24 tháng (11 - 13 kg)',
  '1-2Y': 'Bé 1 - 2 tuổi (11 - 13 kg)',
  '2-3Y': 'Bé 2 - 3 tuổi (13 - 15 kg)',
  '3-4Y': 'Bé 3 - 4 tuổi (15 - 17 kg)',
  '4-5Y': 'Bé 4 - 5 tuổi (17 - 20 kg)',
};

const DEFAULT_BABY_SIZES = [
  'Newborn (3-5.5kg)',
  '0-3M (4-6.5kg)',
  '3-6M (6-8kg)',
  '6-9M (8-9.5kg)',
  '9-12M (9-11kg)',
  '1-2Y (11-13kg)',
  '2-3Y (13-15kg)',
];

export const SizeSelectionModal: React.FC<SizeSelectionModalProps> = ({
  isOpen,
  onClose,
  product,
  onConfirm,
  confirmText = 'Xác nhận Chốt Size & Lên Đơn',
}) => {
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [customSize, setCustomSize] = useState<string>('');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [quantity, setQuantity] = useState<number>(1);
  const [showAllSizes, setShowAllSizes] = useState<boolean>(false);

  // Reset or initialize when product changes
  useEffect(() => {
    if (product) {
      setQuantity(1);
      setIsCustomMode(false);
      setCustomSize('');
      setShowAllSizes(false);

      if (product.variants && product.variants.length > 0) {
        setSelectedSize(product.variants[0]);
      } else {
        setSelectedSize(DEFAULT_BABY_SIZES[1]); // default to 0-3M
      }
    }
  }, [product]);

  if (!isOpen || !product) return null;

  // Sizes to display: product's own variants, plus standard ones if toggled
  const productSizes = product.variants && product.variants.length > 0 ? product.variants : [];
  const displaySizes = showAllSizes
    ? Array.from(new Set([...productSizes, ...DEFAULT_BABY_SIZES]))
    : productSizes.length > 0
    ? productSizes
    : DEFAULT_BABY_SIZES;

  const handleSelectSize = (size: string) => {
    setSelectedSize(size);
    setIsCustomMode(false);
  };

  const handleCustomSizeChange = (val: string) => {
    setCustomSize(val);
    setSelectedSize(val);
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  const finalSize = isCustomMode ? customSize.trim() || 'Chuẩn' : selectedSize || 'Chuẩn';
  const totalPrice = (product.price || 0) * quantity;

  const handleConfirm = () => {
    onConfirm(product, finalSize, quantity);
    onClose();
  };

  // Find helper note for selected size
  const matchedKey = Object.keys(BABY_SIZE_GUIDE).find(
    (k) => finalSize.toLowerCase().includes(k.toLowerCase())
  );
  const helperNote = matchedKey ? BABY_SIZE_GUIDE[matchedKey] : null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-[#3D271D]/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-3xl shadow-2xl border border-[#FDE2E4] w-full max-w-xl overflow-hidden transition-all animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#FFF0F1] bg-gradient-to-r from-[#FFF5F6] to-[#FFF9F6] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FFF0F1] text-[#FF5B65] border border-[#FCD2D6] flex items-center justify-center shrink-0">
              <Ruler className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#3D271D] font-['Nunito',sans-serif] flex items-center gap-2">
                Bước chọn Size & Chốt Đơn
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#FFF0F1] text-[#FF5B65] border border-[#FCD2D6]">
                  Moniu Live
                </span>
              </h3>
              <p className="text-xs text-[#8C7065] font-medium">
                Chọn kích cỡ tháng tuổi hoặc cân nặng của bé trước khi tạo đơn
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#8C7065] hover:text-[#FF5B65] hover:bg-[#FFF0F1] rounded-2xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[78vh] overflow-y-auto">
          {/* Selected Product Card */}
          <div className="flex gap-4 p-3.5 bg-[#FFF9F6] rounded-2xl border border-[#FDE2E4] items-center">
            <img
              src={product.image}
              alt={product.name}
              className="w-18 h-18 rounded-2xl object-cover border border-[#FDE2E4] shrink-0 bg-[#FFF0F1]"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-mono font-black text-[10px] text-[#FF5B65] bg-white px-2 py-0.5 rounded-md border border-[#FCD2D6]">
                  {product.code}
                </span>
                {product.brand && (
                  <span className="text-[10px] font-black text-[#238774] bg-[#EBF9F6] px-2 py-0.5 rounded-md border border-[#B8ECE1]">
                    {product.brand}
                  </span>
                )}
                <span className="text-[10px] text-[#8C7065] font-semibold">
                  {product.category}
                </span>
              </div>

              <h4 className="text-xs font-bold text-[#3D271D] line-clamp-2 leading-snug">
                {product.name}
              </h4>

              <div className="flex items-center justify-between mt-1.5">
                <span className="text-sm font-black text-[#FF5B65] font-['Nunito',sans-serif]">
                  {product.price === 0 ? 'Quà tặng kèm (0đ)' : formatCurrency(product.price)}
                </span>
                {product.tiktokId && (
                  <span className="text-[10px] text-[#8C7065] font-mono">
                    ID: {product.tiktokId}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* STEP 1: SIZE SELECTION */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-[#3D271D] uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-[#FF5B65] text-white flex items-center justify-center text-[11px] font-black">
                  1
                </span>
                Chọn kích cỡ / Size cho bé <span className="text-[#FF5B65]">*</span>
              </label>

              <button
                type="button"
                onClick={() => setShowAllSizes(!showAllSizes)}
                className="text-[11px] font-bold text-[#FF5B65] hover:underline cursor-pointer"
              >
                {showAllSizes ? 'Chỉ hiện size gốc của SP' : '+ Xem thêm bảng size chuẩn'}
              </button>
            </div>

            {/* Size Pills Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {displaySizes.map((size) => {
                const isSelected = !isCustomMode && selectedSize === size;
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => handleSelectSize(size)}
                    className={`p-2.5 rounded-2xl text-xs font-bold transition-all text-left flex items-center justify-between gap-1.5 border cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#FF5B65] to-[#F14652] text-white border-[#FF5B65] shadow-md shadow-[#FF5B65]/25 scale-[1.01]'
                        : 'bg-white hover:bg-[#FFF9F6] text-[#3D271D] hover:text-[#FF5B65] border-[#FDE2E4] hover:border-[#FCD2D6]'
                    }`}
                  >
                    <span className="truncate">{size}</span>
                    {isSelected ? (
                      <Check className="w-4 h-4 shrink-0 text-white" />
                    ) : (
                      <span className="w-3.5 h-3.5 rounded-full border border-[#D5B8AD] shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Custom size option */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsCustomMode(!isCustomMode);
                  if (!isCustomMode) {
                    setSelectedSize(customSize || 'Size riêng');
                  }
                }}
                className={`text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                  isCustomMode ? 'text-[#FF5B65]' : 'text-[#8C7065] hover:text-[#FF5B65]'
                }`}
              >
                <Tag className="w-3 h-3" />
                {isCustomMode ? '✓ Đang nhập size riêng theo mẹ yêu cầu' : 'Ghi size/màu khác theo lời dặn của mẹ live?'}
              </button>

              {isCustomMode && (
                <div className="mt-2 animate-in fade-in duration-150">
                  <input
                    type="text"
                    value={customSize}
                    onChange={(e) => handleCustomSizeChange(e.target.value)}
                    placeholder="Ví dụ: Bé 8.5kg lấy 6-9M, màu be vàng..."
                    className="w-full bg-[#FFF9F6] focus:bg-white text-xs text-[#3D271D] px-3.5 py-2 rounded-xl border border-[#FF5B65] focus:ring-2 focus:ring-[#FF5B65]/20 outline-hidden font-medium"
                    autoFocus
                  />
                </div>
              )}
            </div>

            {/* Size Helper & Weight Recommendation */}
            <div className="p-3 bg-[#EBF9F6] border border-[#B8ECE1] rounded-2xl flex items-start gap-2.5 text-xs text-[#238774]">
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#238774]" />
              <div className="text-[11px] leading-relaxed">
                <p className="font-extrabold text-[#186053]">
                  Đang chọn size: <span className="font-black text-[#FF5B65] text-xs">"{finalSize}"</span>
                </p>
                <p className="text-[#238774] mt-0.5 font-medium">
                  {helperNote ? `Gợi ý chuẩn: ${helperNote}` : 'Đảm bảo vừa vặn, thoải mái cho bé yêu suốt ngày dài.'}
                </p>
              </div>
            </div>
          </div>

          {/* STEP 2: QUANTITY SELECTION */}
          <div className="space-y-2.5 pt-2 border-t border-[#FFF0F1]">
            <label className="text-xs font-black text-[#3D271D] uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-[#FF5B65] text-white flex items-center justify-center text-[11px] font-black">
                2
              </span>
              Số lượng chốt đơn
            </label>

            <div className="flex items-center justify-between gap-3 flex-wrap">
              {/* Stepper */}
              <div className="flex items-center gap-2 bg-[#FFF9F6] p-1 rounded-2xl border border-[#FDE2E4]">
                <button
                  type="button"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="w-8 h-8 rounded-xl bg-white text-[#3D271D] hover:text-[#FF5B65] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center font-black transition-colors border border-[#FDE2E4] cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>

                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-12 text-center text-sm font-black text-[#3D271D] bg-transparent border-none outline-hidden"
                />

                <button
                  type="button"
                  onClick={() => handleQuantityChange(1)}
                  className="w-8 h-8 rounded-xl bg-white text-[#3D271D] hover:text-[#FF5B65] flex items-center justify-center font-black transition-colors border border-[#FDE2E4] cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Quick quantity presets */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-[#8C7065] mr-1">Nhanh:</span>
                {[1, 2, 3, 5].map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setQuantity(q)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      quantity === q
                        ? 'bg-[#3D271D] text-white shadow-xs'
                        : 'bg-white hover:bg-[#FFF9F6] text-[#8C7065] border border-[#FDE2E4]'
                    }`}
                  >
                    x{q}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Price Summary Preview */}
          <div className="p-4 bg-gradient-to-r from-[#FFF5F6] to-[#FFF9F6] rounded-2xl border border-[#FDE2E4] flex items-center justify-between">
            <div>
              <span className="text-[11px] text-[#8C7065] font-semibold block">Tạm tính sản phẩm này:</span>
              <span className="text-xs font-bold text-[#3D271D]">
                {formatCurrency(product.price)} x {quantity} set
              </span>
            </div>

            <div className="text-right">
              <span className="text-lg font-black text-[#FF5B65] font-['Nunito',sans-serif]">
                {product.price === 0 ? 'Quà tặng kèm (0đ)' : formatCurrency(totalPrice)}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-[#FFF0F1] bg-[#FFF9F6] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-white text-xs font-bold text-[#8C7065] hover:bg-[#FFF0F1] hover:text-[#3D271D] border border-[#FDE2E4] rounded-2xl transition-colors cursor-pointer"
          >
            Hủy bỏ
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 sm:flex-initial px-6 py-2.5 bg-gradient-to-r from-[#FF5B65] to-[#F14652] hover:from-[#E84A54] hover:to-[#DE3D49] text-white text-xs font-black rounded-2xl shadow-md shadow-[#FF5B65]/25 transition-all flex items-center justify-center gap-2 cursor-pointer font-['Nunito',sans-serif]"
          >
            <span>{confirmText}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
