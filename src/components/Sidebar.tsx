import React from 'react';
import {
  LayoutDashboard,
  PlusSquare,
  FileText,
  Users,
  Truck,
  TrendingUp,
  Boxes,
  Settings,
  X,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import type { ActiveTab } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { activeTab, setActiveTab, customers } = useShop();

  const menuItems: { id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'overview', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'create-order', label: 'Tạo đơn hàng', icon: PlusSquare },
    { id: 'orders', label: 'Lịch sử đơn hàng', icon: FileText },
    { id: 'customers', label: 'Khách hàng & Rank', icon: Users },
    { id: 'products', label: 'Kho sản phẩm', icon: Boxes },
    { id: 'shipping', label: 'Vận chuyển', icon: Truck },
    { id: 'reports', label: 'Báo cáo', icon: TrendingUp },
    { id: 'settings', label: 'Cài đặt', icon: Settings },
  ];

  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    onClose();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-[#3D271D]/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-gradient-to-b from-[#FF5B65] via-[#FA545F] to-[#F14652] text-white flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } shadow-2xl lg:shadow-xl lg:shadow-[#FF5B65]/10`}
      >
        {/* Top Logo & App Title */}
        <div>
          <div className="flex items-center justify-between px-5 py-5 border-b border-white/15">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white p-1 shadow-md shadow-[#C83B47]/30 flex items-center justify-center shrink-0 overflow-hidden ring-2 ring-white/60">
                <img
                  src="/branding/logo-mark.png"
                  alt="Moniu Xin chào"
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-extrabold tracking-tight text-white leading-tight flex items-center gap-1 font-['Nunito',sans-serif]">
                  Moniu Xin chào
                </h1>
                <div className="mt-0.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold text-white tracking-wider uppercase border border-white/25">
                  Baby & Kid Shop
                </div>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition-colors"
              aria-label="Đóng menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="px-3.5 py-5 space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl font-bold text-sm transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-white text-[#FF5B65] shadow-lg shadow-[#D83B47]/25 translate-x-1'
                      : 'text-white/90 hover:text-white hover:bg-white/15'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 transition-transform ${
                      isActive ? 'text-[#FF5B65] stroke-[2.4]' : 'text-white/80'
                    }`}
                  />
                  <span>{item.label}</span>
                  {item.id === 'products' && (
                    <span
                      className={`ml-auto text-[10px] font-extrabold px-2 py-0.5 rounded-full transition-colors ${
                        isActive
                          ? 'bg-[#FF5B65] text-white shadow-xs'
                          : 'bg-white/20 text-white border border-white/25 shadow-xs'
                      }`}
                    >
                      330 SP
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom System Status */}
        <div className="p-4 border-t border-white/15">
          <div className="bg-white/15 backdrop-blur-xs rounded-2xl p-3 border border-white/20 shadow-inner">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#48C9B0] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#48C9B0]"></span>
              </span>
              <span className="text-xs font-bold text-white">Hệ thống sẵn sàng</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px] text-white/80 font-medium">
              <span>Moniu TikTok Live</span>
              <span>16/10/2025</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
