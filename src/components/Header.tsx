import React, { useState } from 'react';
import { Search, Bell, Menu, CheckCircle2, Package, Sparkles } from 'lucide-react';
import { useShop } from '../context/ShopContext';

interface HeaderProps {
  onOpenMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu }) => {
  const { searchQuery, setSearchQuery, setActiveTab } = useShop();
  const [showNotifications, setShowNotifications] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setActiveTab('orders');
    }
  };

  const recentNotifications = [
    {
      id: 'notif-1',
      title: 'Đơn mới từ TikTok Live Moniu',
      desc: 'Mẹ Bắp vừa chốt đơn MN-7K9A2B1 (189.000đ) - Set body chip',
      time: '3 phút trước',
      icon: Package,
      color: 'text-[#FF5B65] bg-[#FFF0F1]',
    },
    {
      id: 'notif-2',
      title: 'Giao hàng thành công',
      desc: 'GHN đã giao thành công đơn MN-8P7Q1Z5 cho Phạm Thị Thu',
      time: '28 phút trước',
      icon: CheckCircle2,
      color: 'text-[#238774] bg-[#EBF9F6]',
    },
    {
      id: 'notif-3',
      title: 'Khách yêu cầu tư vấn size',
      desc: 'Mẹ Kem hỏi tư vấn size váy công chúa Moniu 1-2 tuổi',
      time: '1 giờ trước',
      icon: Sparkles,
      color: 'text-[#B87B00] bg-[#FFF8E6]',
    },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#FDE2E4] px-4 sm:px-6 py-3 transition-all">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger + Global Search */}
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-2xl text-[#8C7065] hover:text-[#3D271D] hover:bg-[#FFF0F1] transition-colors cursor-pointer"
            aria-label="Mở menu"
          >
            <Menu className="w-5 h-5 text-[#FF5B65]" />
          </button>

          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search className="w-4 h-4 text-[#8C7065]/70 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm đơn hàng, tên mẹ/bé, SĐT, đồ sơ sinh..."
              className="w-full bg-[#FFF9F6] hover:bg-[#FFF0F1]/60 focus:bg-white text-xs sm:text-sm text-[#3D271D] placeholder-[#8C7065]/70 pl-10 pr-4 py-2.5 rounded-2xl border border-[#FDE2E4] focus:border-[#FF5B65] focus:ring-2 focus:ring-[#FF5B65]/15 outline-hidden transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8C7065] hover:text-[#3D271D] bg-[#FDE2E4] rounded-full w-4 h-4 flex items-center justify-center cursor-pointer"
              >
                ×
              </button>
            )}
          </form>
        </div>

        {/* Right: Notifications & User Profile */}
        <div className="flex items-center gap-2.5 sm:gap-4 relative">
          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2.5 rounded-2xl text-[#8C7065] hover:text-[#3D271D] hover:bg-[#FFF0F1] relative transition-colors cursor-pointer"
              aria-label="Thông báo"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#FF5B65] text-[10px] font-extrabold text-white shadow-xs">
                3
              </span>
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowNotifications(false)}
                />
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-[#FDE2E4] py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-[#FDE2E4]">
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-[#3D271D] text-sm font-['Nunito',sans-serif]">
                        Thông báo Moniu
                      </h3>
                      <span className="text-[11px] font-bold text-[#FF5B65] bg-[#FFF0F1] px-2.5 py-0.5 rounded-full border border-[#FCD2D6]">
                        3 mới
                      </span>
                    </div>
                  </div>
                  <div className="divide-y divide-[#FFF0F1] max-h-80 overflow-y-auto">
                    {recentNotifications.map((notif) => {
                      const Icon = notif.icon;
                      return (
                        <div
                          key={notif.id}
                          className="p-3.5 hover:bg-[#FFF9F6] transition-colors flex gap-3 cursor-pointer"
                        >
                          <div className={`p-2 rounded-2xl shrink-0 h-9 w-9 flex items-center justify-center ${notif.color}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-[#3D271D]">{notif.title}</p>
                            <p className="text-[11px] text-[#8C7065] mt-0.5 leading-relaxed">{notif.desc}</p>
                            <span className="text-[10px] text-[#8C7065]/70 mt-1 block">{notif.time}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="p-2 border-t border-[#FDE2E4] text-center">
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-xs text-[#FF5B65] hover:text-[#E84A54] font-bold py-1 cursor-pointer"
                    >
                      Đánh dấu tất cả đã đọc
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
