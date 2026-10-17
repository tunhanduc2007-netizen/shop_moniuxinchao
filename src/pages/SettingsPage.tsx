import React, { useState } from 'react';
import {
  Save,
  Store,
  Truck,
  CreditCard,
  Hash,
  RotateCcw,
  CheckCircle,
  Heart,
  Sparkles,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import type { StoreSettings, ShippingCarrier } from '../types';
import { formatCurrency } from '../utils/formatters';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, resetToDefault } = useShop();
  const [formData, setFormData] = useState<StoreSettings>({ ...settings });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleChange = (field: keyof StoreSettings, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[#3D271D] tracking-tight font-['Nunito',sans-serif]">
              Cài đặt shop Moniu
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#FFF0F1] text-[#FF5B65] border border-[#FCD2D6] flex items-center gap-1">
              <Heart className="w-3 h-3 fill-current" />
              Store Settings
            </span>
          </div>
          <p className="text-sm text-[#8C7065] mt-0.5 font-medium">
            Cấu hình thông tin thương hiệu Moniu Xin chào, mã đơn hàng, cước ship và tài khoản ngân hàng
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={resetToDefault}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-[#8C7065] bg-white hover:bg-[#FFF9F6] border border-[#FDE2E4] rounded-2xl transition-colors shadow-2xs cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Khôi phục mặc định
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Thông tin cửa hàng Moniu */}
        <div className="bg-white rounded-3xl p-6 border border-[#FDE2E4] shadow-2xs space-y-4">
          <h2 className="text-sm font-extrabold text-[#3D271D] flex items-center gap-2 border-b border-[#FFF0F1] pb-3.5 font-['Nunito',sans-serif]">
            <Store className="w-4 h-4 text-[#FF5B65]" />
            Thông tin thương hiệu Moniu Xin chào
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#3D271D] mb-1.5">
                Tên cửa hàng chính thức
              </label>
              <input
                type="text"
                value={formData.storeName}
                onChange={(e) => handleChange('storeName', e.target.value)}
                className="w-full bg-[#FFF9F6] focus:bg-white text-xs text-[#3D271D] font-bold px-3.5 py-2.5 rounded-2xl border border-[#FDE2E4] focus:outline-hidden focus:border-[#FF5B65]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3D271D] mb-1.5">
                Tên người quản trị / livestream
              </label>
              <input
                type="text"
                value={formData.sellerName}
                onChange={(e) => handleChange('sellerName', e.target.value)}
                className="w-full bg-[#FFF9F6] focus:bg-white text-xs text-[#3D271D] font-bold px-3.5 py-2.5 rounded-2xl border border-[#FDE2E4] focus:outline-hidden focus:border-[#FF5B65]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3D271D] mb-1.5">
                Kênh TikTok Shop
              </label>
              <input
                type="text"
                value={formData.tiktokShopName}
                onChange={(e) => handleChange('tiktokShopName', e.target.value)}
                className="w-full bg-[#FFF9F6] focus:bg-white text-xs text-[#3D271D] px-3.5 py-2.5 rounded-2xl border border-[#FDE2E4] focus:outline-hidden focus:border-[#FF5B65]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3D271D] mb-1.5">
                Mã TikTok Shop Seller ID
              </label>
              <input
                type="text"
                value={formData.tiktokShopId}
                onChange={(e) => handleChange('tiktokShopId', e.target.value)}
                className="w-full bg-[#FFF9F6] focus:bg-white text-xs text-[#3D271D] px-3.5 py-2.5 rounded-2xl border border-[#FDE2E4] focus:outline-hidden focus:border-[#FF5B65]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3D271D] mb-1.5">
                Số điện thoại shop
              </label>
              <input
                type="text"
                value={formData.sellerPhone}
                onChange={(e) => handleChange('sellerPhone', e.target.value)}
                className="w-full bg-[#FFF9F6] focus:bg-white text-xs text-[#3D271D] px-3.5 py-2.5 rounded-2xl border border-[#FDE2E4] focus:outline-hidden focus:border-[#FF5B65]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3D271D] mb-1.5">
                Email chăm sóc khách hàng
              </label>
              <input
                type="email"
                value={formData.sellerEmail}
                onChange={(e) => handleChange('sellerEmail', e.target.value)}
                className="w-full bg-[#FFF9F6] focus:bg-white text-xs text-[#3D271D] px-3.5 py-2.5 rounded-2xl border border-[#FDE2E4] focus:outline-hidden focus:border-[#FF5B65]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#3D271D] mb-1.5">
                Địa chỉ kho gửi hàng cho bé
              </label>
              <input
                type="text"
                value={formData.storeAddress}
                onChange={(e) => handleChange('storeAddress', e.target.value)}
                className="w-full bg-[#FFF9F6] focus:bg-white text-xs text-[#3D271D] px-3.5 py-2.5 rounded-2xl border border-[#FDE2E4] focus:outline-hidden focus:border-[#FF5B65]"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Cấu hình mã đơn hàng */}
        <div className="bg-white rounded-3xl p-6 border border-[#FDE2E4] shadow-2xs space-y-4">
          <h2 className="text-sm font-extrabold text-[#3D271D] flex items-center gap-2 border-b border-[#FFF0F1] pb-3.5 font-['Nunito',sans-serif]">
            <Hash className="w-4 h-4 text-[#FF5B65]" />
            Cấu hình mã đơn Moniu
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div>
              <label className="block text-xs font-bold text-[#3D271D] mb-1.5">
                Tiền tố mã đơn hàng
              </label>
              <input
                type="text"
                value={formData.orderPrefix}
                onChange={(e) => handleChange('orderPrefix', e.target.value)}
                placeholder="MN-"
                className="w-full bg-[#FFF9F6] focus:bg-white text-xs font-mono font-black text-[#FF5B65] px-3.5 py-2.5 rounded-2xl border border-[#FDE2E4] focus:outline-hidden focus:border-[#FF5B65] uppercase"
              />
              <p className="text-[11px] text-[#8C7065] mt-1">Ví dụ: MN- sẽ sinh ra MN-7K9A2B1</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3D271D] mb-1.5">
                Độ dài ký tự ngẫu nhiên
              </label>
              <select
                value={formData.orderRandomLength}
                onChange={(e) => handleChange('orderRandomLength', Number(e.target.value))}
                className="w-full bg-[#FFF9F6] focus:bg-white text-xs font-bold text-[#3D271D] px-3.5 py-2.5 rounded-2xl border border-[#FDE2E4] focus:outline-hidden focus:border-[#FF5B65]"
              >
                <option value={6}>6 ký tự (Ví dụ: MN-7K9A2B)</option>
                <option value={7}>7 ký tự (Ví dụ: MN-7K9A2B1 - Khuyên dùng)</option>
                <option value={8}>8 ký tự (Ví dụ: MN-7K9A2B1C)</option>
              </select>
              <p className="text-[11px] text-[#8C7065] mt-1">
                Tự động kiểm tra trùng lặp và loại trừ ký tự nhầm lẫn (0, O, 1, I)
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Cấu hình vận chuyển & Phí */}
        <div className="bg-white rounded-3xl p-6 border border-[#FDE2E4] shadow-2xs space-y-4">
          <h2 className="text-sm font-extrabold text-[#3D271D] flex items-center gap-2 border-b border-[#FFF0F1] pb-3.5 font-['Nunito',sans-serif]">
            <Truck className="w-4 h-4 text-[#FF5B65]" />
            Cấu hình giao hàng & Phí ship
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#3D271D] mb-1.5">
                Đơn vị vận chuyển ưu tiên
              </label>
              <select
                value={formData.defaultCarrier}
                onChange={(e) => handleChange('defaultCarrier', e.target.value as ShippingCarrier)}
                className="w-full bg-[#FFF9F6] focus:bg-white text-xs font-bold text-[#3D271D] px-3.5 py-2.5 rounded-2xl border border-[#FDE2E4] focus:outline-hidden focus:border-[#FF5B65]"
              >
                <option value="GHN">GHN (Giao Hàng Nhanh)</option>
                <option value="GHTK">GHTK (Giao Hàng Tiết Kiệm)</option>
                <option value="J&T Express">J&T Express</option>
                <option value="Viettel Post">Viettel Post</option>
                <option value="SPX Express">SPX Express (Shopee Express)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3D271D] mb-1.5">
                Phí vận chuyển mặc định (VNĐ)
              </label>
              <input
                type="number"
                step="1000"
                value={formData.defaultShippingFee}
                onChange={(e) => handleChange('defaultShippingFee', Number(e.target.value))}
                className="w-full bg-[#FFF9F6] focus:bg-white text-xs font-black text-[#3D271D] px-3.5 py-2.5 rounded-2xl border border-[#FDE2E4] focus:outline-hidden focus:border-[#FF5B65]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3D271D] mb-1.5">
                Ngưỡng miễn phí ship (Freeship)
              </label>
              <input
                type="number"
                step="10000"
                value={formData.freeShippingThreshold}
                onChange={(e) => handleChange('freeShippingThreshold', Number(e.target.value))}
                className="w-full bg-[#FFF9F6] focus:bg-white text-xs font-black text-[#3D271D] px-3.5 py-2.5 rounded-2xl border border-[#FDE2E4] focus:outline-hidden focus:border-[#FF5B65]"
              />
              <p className="text-[11px] text-[#8C7065] mt-1">
                Đơn từ {formatCurrency(formData.freeShippingThreshold)} được freeship
              </p>
            </div>
          </div>
        </div>

        {/* Section 4: Cấu hình phương thức thanh toán */}
        <div className="bg-white rounded-3xl p-6 border border-[#FDE2E4] shadow-2xs space-y-4">
          <h2 className="text-sm font-extrabold text-[#3D271D] flex items-center gap-2 border-b border-[#FFF0F1] pb-3.5 font-['Nunito',sans-serif]">
            <CreditCard className="w-4 h-4 text-[#FF5B65]" />
            Phương thức thanh toán & Tài khoản ngân hàng
          </h2>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-6">
              <label className="flex items-center gap-2 text-xs font-bold text-[#3D271D] cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.enableCod}
                  onChange={(e) => handleChange('enableCod', e.target.checked)}
                  className="rounded text-[#FF5B65] focus:ring-[#FF5B65] w-4 h-4"
                />
                Cho phép thanh toán COD (Tiền mặt khi nhận hàng)
              </label>

              <label className="flex items-center gap-2 text-xs font-bold text-[#3D271D] cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.enableBankTransfer}
                  onChange={(e) => handleChange('enableBankTransfer', e.target.checked)}
                  className="rounded text-[#FF5B65] focus:ring-[#FF5B65] w-4 h-4"
                />
                Cho phép Chuyển khoản ngân hàng
              </label>
            </div>

            {formData.enableBankTransfer && (
              <div className="p-4 bg-[#FFF9F6] rounded-2xl border border-[#FDE2E4] grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#8C7065] mb-1">
                    Tên ngân hàng
                  </label>
                  <input
                    type="text"
                    value={formData.bankName}
                    onChange={(e) => handleChange('bankName', e.target.value)}
                    placeholder="MB Bank, Vietcombank, Techcombank..."
                    className="w-full bg-white text-xs font-bold text-[#3D271D] px-3.5 py-2 rounded-xl border border-[#FDE2E4]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#8C7065] mb-1">
                    Số tài khoản (STK)
                  </label>
                  <input
                    type="text"
                    value={formData.bankAccount}
                    onChange={(e) => handleChange('bankAccount', e.target.value)}
                    placeholder="0987654321..."
                    className="w-full bg-white text-xs font-mono font-black text-[#3D271D] px-3.5 py-2 rounded-xl border border-[#FDE2E4]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#8C7065] mb-1">
                    Chủ tài khoản
                  </label>
                  <input
                    type="text"
                    value={formData.bankAccountName}
                    onChange={(e) => handleChange('bankAccountName', e.target.value)}
                    placeholder="MONIU XIN CHAO"
                    className="w-full bg-white text-xs font-black uppercase text-[#3D271D] px-3.5 py-2 rounded-xl border border-[#FDE2E4]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#8C7065] mb-1">
                    Chi nhánh
                  </label>
                  <input
                    type="text"
                    value={formData.bankBranch}
                    onChange={(e) => handleChange('bankBranch', e.target.value)}
                    placeholder="Chi nhánh TP.HCM"
                    className="w-full bg-white text-xs text-[#3D271D] px-3.5 py-2 rounded-xl border border-[#FDE2E4]"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Save button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {savedSuccess && (
            <span className="text-xs text-[#238774] font-bold flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              Đã lưu cài đặt Moniu thành công!
            </span>
          )}

          <button
            type="submit"
            className="flex items-center gap-2 px-7 py-3 bg-gradient-to-r from-[#FF5B65] to-[#F14652] hover:from-[#E84A54] hover:to-[#DE3D49] text-white rounded-2xl text-xs font-black shadow-lg shadow-[#FF5B65]/30 transition-all cursor-pointer font-['Nunito',sans-serif]"
          >
            <Save className="w-4 h-4" />
            Lưu cài đặt shop
          </button>
        </div>
      </form>
    </div>
  );
};
