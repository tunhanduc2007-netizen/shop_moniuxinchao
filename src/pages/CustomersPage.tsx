import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Crown,
  Award,
  Sparkles,
  Phone,
  MapPin,
  ShoppingBag,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Gift,
  Copy,
  Check,
  ChevronRight,
  Heart,
  Baby,
  Star,
  ExternalLink,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import type { Customer, CustomerRank } from '../types';
import { CUSTOMER_RANKS } from '../types';
import { formatCurrency } from '../utils/formatters';
import { getNextSuggestedBabySize } from '../utils/customerUtils';

export const CustomersPage: React.FC = () => {
  const {
    customers,
    orders,
    setActiveTab,
    setSearchQuery,
    setInitialOrderPrefill,
    refreshDataFromSupabase,
    isSupabaseConnected,
    isSyncing,
    showToast,
  } = useShop();

  const [search, setSearch] = useState('');
  const [selectedRankFilter, setSelectedRankFilter] = useState<'all' | CustomerRank>('all');
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  // Top KPIs
  const stats = useMemo(() => {
    const totalCustomers = customers.length;
    const repeatCustomers = customers.filter((c) => c.totalOrders >= 2);
    const vipCustomers = customers.filter(
      (c) => c.rank === 'Mẹ Kim Cương' || c.rank === 'Mẹ Thông Thái' || c.rank === 'Bé Ngoan'
    );
    const repeatRevenue = repeatCustomers.reduce((sum, c) => sum + c.totalSpent, 0);
    const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
    const retentionRate = totalCustomers > 0 ? Math.round((repeatCustomers.length / totalCustomers) * 100) : 0;

    return {
      totalCustomers,
      vipCustomersCount: vipCustomers.length,
      repeatRevenue,
      retentionRate,
      kimCuongCount: customers.filter((c) => c.rank === 'Mẹ Kim Cương').length,
      thongThaiCount: customers.filter((c) => c.rank === 'Mẹ Thông Thái').length,
      beNgoanCount: customers.filter((c) => c.rank === 'Bé Ngoan').length,
      mamNhoCount: customers.filter((c) => c.rank === 'Mầm Nhỏ').length,
    };
  }, [customers]);

  // Top 3 Podium
  const topPodium = useMemo(() => {
    return customers.slice(0, 3);
  }, [customers]);

  // Filtered customers
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      // Rank filter
      if (selectedRankFilter !== 'all' && c.rank !== selectedRankFilter) {
        return false;
      }
      // Text search
      if (search.trim()) {
        const query = search.toLowerCase().trim();
        const matchName = c.name.toLowerCase().includes(query);
        const matchPhone = c.phone.includes(query);
        const matchAddress = c.address ? c.address.toLowerCase().includes(query) : false;
        return matchName || matchPhone || matchAddress;
      }
      return true;
    });
  }, [customers, selectedRankFilter, search]);

  const handleCopyPhone = (phone: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(phone);
    setCopiedPhone(phone);
    showToast({
      type: 'info',
      title: 'Đã sao chép SĐT',
      message: `Đã lưu số ${phone} vào bộ nhớ tạm.`,
    });
    setTimeout(() => {
      setCopiedPhone(null);
    }, 2000);
  };

  const handleQuickCreateOrder = (cust: Customer) => {
    setInitialOrderPrefill({
      customerName: cust.name,
      customerPhone: cust.phone,
      shippingAddress: cust.address || '',
    });
    setActiveTab('create-order');
    showToast({
      type: 'success',
      title: 'Tạo đơn nhanh',
      message: `Đã điền sẵn thông tin của mẹ ${cust.name}`,
    });
  };

  const handleViewCustomerOrders = (phone: string) => {
    setSearchQuery(phone);
    setActiveTab('orders');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      {/* PAGE HEADER */}
      <div className="bg-gradient-to-r from-white via-[#FFF9F6] to-white rounded-3xl p-6 sm:p-8 border border-[#FDE2E4] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-[#FFF0F1] text-[#FF5B65] border border-[#FCD2D6] flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5 text-[#FF5B65]" />
              Hệ thống Khách Quen & Loyalty VIP
            </span>
            {isSupabaseConnected ? (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#EBF9F6] text-[#238774] border border-[#B8ECE1] flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#238774] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#238774]"></span>
                </span>
                Supabase Cloud: Đồng bộ tức thì
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FFF8E6] text-[#B87B00] border border-[#FDE199]">
                Chế độ Offline Lưu trữ máy
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#3D271D] font-['Nunito',sans-serif]">
            Khách hàng & Bảng xếp hạng VIP
          </h1>
          <p className="text-xs sm:text-sm text-[#8C7065] mt-1 font-medium">
            Tự động nhận diện khách quen bằng SĐT & Nickname, lưu lịch sử đơn vĩnh viễn và áp dụng quyền lợi giảm giá VIP trực tiếp khi livestream.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 self-stretch md:self-auto shrink-0">
          <button
            type="button"
            onClick={() => refreshDataFromSupabase()}
            disabled={isSyncing}
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-[#FCD2D6] text-xs font-bold text-[#3D271D] hover:bg-[#FFF9F6] shadow-2xs transition-all cursor-pointer disabled:opacity-50"
            title="Đồng bộ lại từ đám mây Supabase"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#FF5B65] ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ đám mây'}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('create-order')}
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-[#FF5B65] hover:bg-[#E84A54] text-white text-xs font-black shadow-md shadow-[#FF5B65]/20 hover:shadow-lg transition-all cursor-pointer active:scale-95"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            Vào chốt đơn Live
          </button>
        </div>
      </div>

      {/* TOP 4 STATISTIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Tổng khách */}
        <div className="bg-white rounded-3xl p-5 border border-[#FDE2E4] shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#8C7065]">Tổng số khách hàng</span>
            <div className="w-9 h-9 rounded-2xl bg-[#FFF0F1] flex items-center justify-center text-[#FF5B65]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#3D271D]">
            {stats.totalCustomers}
          </div>
          <p className="text-[11px] text-[#8C7065] mt-1">
            Đã lưu trữ hồ sơ vĩnh viễn trên Supabase
          </p>
        </div>

        {/* Card 2: Khách VIP */}
        <div className="bg-white rounded-3xl p-5 border border-[#FDE2E4] shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#8C7065]">Khách VIP & Thân thiết</span>
            <div className="w-9 h-9 rounded-2xl bg-[#FAF5FF] flex items-center justify-center text-[#8050D9]">
              <Crown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#8050D9]">
            {stats.vipCustomersCount}
          </div>
          <p className="text-[11px] text-[#8C7065] mt-1">
            Hưởng ưu đãi giảm -3%, -5% và -8%
          </p>
        </div>

        {/* Card 3: Doanh thu khách quen */}
        <div className="bg-white rounded-3xl p-5 border border-[#FDE2E4] shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#8C7065]">Doanh thu khách quen</span>
            <div className="w-9 h-9 rounded-2xl bg-[#EBF9F6] flex items-center justify-center text-[#238774]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#238774]">
            {formatCurrency(stats.repeatRevenue)}
          </div>
          <p className="text-[11px] text-[#8C7065] mt-1">
            Chiếm tỉ trọng chi tiêu cao nhất shop
          </p>
        </div>

        {/* Card 4: Tỉ lệ khách quay lại */}
        <div className="bg-white rounded-3xl p-5 border border-[#FDE2E4] shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#8C7065]">Tỷ lệ khách quay lại</span>
            <div className="w-9 h-9 rounded-2xl bg-[#FFF8E6] flex items-center justify-center text-[#B87B00]">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#B87B00]">
            {stats.retentionRate}%
          </div>
          <p className="text-[11px] text-[#8C7065] mt-1">
            {stats.vipCustomersCount} mẹ đã mua từ 2 đơn trở lên
          </p>
        </div>
      </div>

      {/* PODIUM: TOP 3 MẸ VIP MONIU (HONOR PODIUM) */}
      {topPodium.length > 0 && (
        <div className="bg-gradient-to-br from-[#FFF5F6] via-[#FFF9F6] to-[#FFF0F1] rounded-3xl p-6 sm:p-8 border border-[#FCD2D6] shadow-sm">
          <div className="text-center max-w-lg mx-auto mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#FCD2D6] text-xs font-extrabold text-[#FF5B65] mb-2 shadow-2xs">
              <Crown className="w-3.5 h-3.5 text-[#FF5B65]" />
              Bảng vinh danh Khách hàng Thân thiết
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#3D271D] font-['Nunito',sans-serif]">
              Top 3 Mẹ Yêu Thích Moniu Nhất
            </h2>
            <p className="text-xs text-[#8C7065] mt-1">
              Những khách hàng thân thiết luôn đồng hành cùng shop trong từng buổi livestream
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 items-end">
            {/* Rank 2 (Silver) */}
            {topPodium[1] ? (
              <div className="bg-white rounded-3xl p-5 border border-[#E5E7EB] shadow-xs order-2 md:order-1 text-center relative group hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 font-black text-xl flex items-center justify-center mx-auto mb-3 shadow-inner ring-4 ring-white">
                  🥈
                </div>
                <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#FFF8E6] text-[#B87B00] mb-2">
                  Top 2 Mẹ VIP
                </div>
                <h3 className="text-base font-black text-[#3D271D] truncate">
                  {topPodium[1].name}
                </h3>
                <p className="text-xs text-[#8C7065] font-mono font-medium mt-0.5">
                  {topPodium[1].phone}
                </p>
                <div className="mt-3 py-2 px-3 bg-[#FFF9F6] rounded-2xl border border-[#FDE2E4]">
                  <p className="text-xs text-[#8C7065]">Tổng chi tiêu:</p>
                  <p className="text-sm font-black text-[#FF5B65]">
                    {formatCurrency(topPodium[1].totalSpent)}
                  </p>
                  <p className="text-[11px] font-bold text-[#3D271D] mt-0.5">
                    {topPodium[1].totalOrders} đơn hàng
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleQuickCreateOrder(topPodium[1])}
                  className="mt-3 w-full py-2 bg-[#FFF0F1] hover:bg-[#FF5B65] text-[#FF5B65] hover:text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  ⚡ Tạo đơn nhanh
                </button>
              </div>
            ) : null}

            {/* Rank 1 (Gold - Taller Podium) */}
            {topPodium[0] ? (
              <div className="bg-gradient-to-b from-white via-white to-[#FFF5F6] rounded-3xl p-6 border-2 border-[#FFD147] shadow-lg order-1 md:order-2 text-center relative -translate-y-2 group hover:shadow-xl transition-all">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-[#FFD147] to-[#FFA000] text-[#3D271D] font-black text-xs shadow-md flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5" />
                  Mẹ VIP Số 1
                </div>
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#FFF9C4] to-[#FFE082] text-3xl flex items-center justify-center mx-auto mt-2 mb-3 shadow-md ring-4 ring-[#FFD147]/30">
                  👑
                </div>
                <h3 className="text-lg font-black text-[#3D271D] truncate">
                  {topPodium[0].name}
                </h3>
                <p className="text-xs text-[#8C7065] font-mono font-medium mt-0.5">
                  {topPodium[0].phone}
                </p>
                <div className="mt-1 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#FAF5FF] text-[#8050D9] border border-[#E9D5FF]">
                  {CUSTOMER_RANKS[topPodium[0].rank].icon} {topPodium[0].rank}
                </div>
                <div className="mt-4 py-3 px-4 bg-gradient-to-r from-[#FFF0F1] to-[#FFF9F6] rounded-2xl border border-[#FCD2D6]">
                  <p className="text-xs text-[#8C7065]">Tổng chi tiêu kỷ lục:</p>
                  <p className="text-base sm:text-lg font-black text-[#FF5B65]">
                    {formatCurrency(topPodium[0].totalSpent)}
                  </p>
                  <p className="text-xs font-bold text-[#3D271D] mt-0.5">
                    {topPodium[0].totalOrders} đơn hàng đã mua
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleQuickCreateOrder(topPodium[0])}
                  className="mt-3.5 w-full py-2.5 bg-[#FF5B65] hover:bg-[#E84A54] text-white rounded-xl text-xs font-black shadow-md shadow-[#FF5B65]/20 transition-all cursor-pointer"
                >
                  ⚡ Tạo đơn cho Mẹ số 1
                </button>
              </div>
            ) : null}

            {/* Rank 3 (Bronze) */}
            {topPodium[2] ? (
              <div className="bg-white rounded-3xl p-5 border border-[#E5E7EB] shadow-xs order-3 md:order-3 text-center relative group hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200 text-amber-800 font-black text-xl flex items-center justify-center mx-auto mb-3 shadow-inner ring-4 ring-white">
                  🥉
                </div>
                <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#FFF0F1] text-[#FF5B65] mb-2">
                  Top 3 Mẹ VIP
                </div>
                <h3 className="text-base font-black text-[#3D271D] truncate">
                  {topPodium[2].name}
                </h3>
                <p className="text-xs text-[#8C7065] font-mono font-medium mt-0.5">
                  {topPodium[2].phone}
                </p>
                <div className="mt-3 py-2 px-3 bg-[#FFF9F6] rounded-2xl border border-[#FDE2E4]">
                  <p className="text-xs text-[#8C7065]">Tổng chi tiêu:</p>
                  <p className="text-sm font-black text-[#FF5B65]">
                    {formatCurrency(topPodium[2].totalSpent)}
                  </p>
                  <p className="text-[11px] font-bold text-[#3D271D] mt-0.5">
                    {topPodium[2].totalOrders} đơn hàng
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleQuickCreateOrder(topPodium[2])}
                  className="mt-3 w-full py-2 bg-[#FFF0F1] hover:bg-[#FF5B65] text-[#FF5B65] hover:text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  ⚡ Tạo đơn nhanh
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* RANK POLICY SUMMARY CARDS */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#FDE2E4] shadow-2xs space-y-3">
        <h2 className="text-sm font-black text-[#3D271D] flex items-center gap-2 font-['Nunito',sans-serif]">
          <ShieldCheck className="w-4 h-4 text-[#FF5B65]" />
          Chính sách 4 Phân hạng Khách hàng Moniu Xin Chào
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Rank 1: Mầm Nhỏ */}
          <div className="p-3.5 rounded-2xl bg-[#FFF0F1]/60 border border-[#FCD2D6] space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-base">🥉</span>
              <span className="text-xs font-black text-[#FF5B65]">Mầm Nhỏ</span>
              <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white text-[#8C7065]">1 đơn</span>
            </div>
            <p className="text-[11px] text-[#3D271D] font-medium leading-relaxed">
              Khách mới lần đầu mua hàng. Tặng kèm thiệp cảm ơn Moniu và bộ sticker Nous xinh xắn.
            </p>
          </div>

          {/* Rank 2: Bé Ngoan */}
          <div className="p-3.5 rounded-2xl bg-[#FFF8E6]/70 border border-[#FDE199] space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-base">🥈</span>
              <span className="text-xs font-black text-[#B87B00]">Bé Ngoan</span>
              <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white text-[#B87B00]">Giảm 3%</span>
            </div>
            <p className="text-[11px] text-[#3D271D] font-medium leading-relaxed">
              Từ 2 đơn hoặc từ 1.000.000đ. Tự động trừ 3% trên live + Freeship đơn từ 299k.
            </p>
          </div>

          {/* Rank 3: Mẹ Thông Thái */}
          <div className="p-3.5 rounded-2xl bg-[#EBF9F6]/80 border border-[#B8ECE1] space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-base">🥇</span>
              <span className="text-xs font-black text-[#238774]">Mẹ Thông Thái</span>
              <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white text-[#238774]">Giảm 5%</span>
            </div>
            <p className="text-[11px] text-[#3D271D] font-medium leading-relaxed">
              Từ 5 đơn hoặc từ 3.000.000đ. Giảm 5% tự động + Quà sinh nhật bé + Ưu tiên soạn đơn trước.
            </p>
          </div>

          {/* Rank 4: Mẹ Kim Cương */}
          <div className="p-3.5 rounded-2xl bg-[#FAF5FF] border border-[#E9D5FF] space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-base">💎</span>
              <span className="text-xs font-black text-[#8050D9]">Mẹ Kim Cương</span>
              <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white text-[#8050D9]">Giảm 8%</span>
            </div>
            <p className="text-[11px] text-[#3D271D] font-medium leading-relaxed">
              Từ 10 đơn hoặc từ 6.000.000đ. Giảm 8% trọn đời + Luôn Freeship + Tặng quà BST độc quyền.
            </p>
          </div>
        </div>
      </div>

      {/* FILTER TABS & SEARCH BAR */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#FDE2E4] shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Rank Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedRankFilter('all')}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                selectedRankFilter === 'all'
                  ? 'bg-[#FF5B65] text-white shadow-xs'
                  : 'bg-[#FFF9F6] text-[#8C7065] hover:bg-[#FFF0F1] hover:text-[#3D271D]'
              }`}
            >
              Tất cả ({customers.length})
            </button>

            <button
              type="button"
              onClick={() => setSelectedRankFilter('Mẹ Kim Cương')}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedRankFilter === 'Mẹ Kim Cương'
                  ? 'bg-[#8050D9] text-white shadow-xs'
                  : 'bg-[#FAF5FF] text-[#8050D9] hover:bg-[#F3E8FF]'
              }`}
            >
              <span>💎 Kim Cương ({stats.kimCuongCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedRankFilter('Mẹ Thông Thái')}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedRankFilter === 'Mẹ Thông Thái'
                  ? 'bg-[#238774] text-white shadow-xs'
                  : 'bg-[#EBF9F6] text-[#238774] hover:bg-[#D1FAE5]'
              }`}
            >
              <span>🥇 Thông Thái ({stats.thongThaiCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedRankFilter('Bé Ngoan')}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedRankFilter === 'Bé Ngoan'
                  ? 'bg-[#B87B00] text-white shadow-xs'
                  : 'bg-[#FFF8E6] text-[#B87B00] hover:bg-[#FEF3C7]'
              }`}
            >
              <span>🥈 Bé Ngoan ({stats.beNgoanCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedRankFilter('Mầm Nhỏ')}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedRankFilter === 'Mầm Nhỏ'
                  ? 'bg-[#FF5B65] text-white shadow-xs'
                  : 'bg-[#FFF0F1] text-[#FF5B65] hover:bg-[#FDE2E4]'
              }`}
            >
              <span>🥉 Mầm Nhỏ ({stats.mamNhoCount})</span>
            </button>
          </div>

          {/* Quick Search Input */}
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 text-[#8C7065] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên, SĐT, địa chỉ..."
              className="w-full bg-[#FFF9F6] focus:bg-white text-xs text-[#3D271D] pl-10 pr-3.5 py-2.5 rounded-2xl border border-[#FDE2E4] focus:border-[#FF5B65] focus:ring-2 focus:ring-[#FF5B65]/15 outline-hidden font-medium"
            />
          </div>
        </div>

        {/* CUSTOMERS DATA TABLE */}
        {filteredCustomers.length === 0 ? (
          <div className="text-center py-16 px-4 bg-[#FFF9F6] rounded-3xl border border-dashed border-[#FCD2D6]">
            <Users className="w-12 h-12 text-[#FF5B65]/40 mx-auto mb-3" />
            <p className="text-sm font-black text-[#3D271D]">Chưa có khách hàng nào phù hợp</p>
            <p className="text-xs text-[#8C7065] mt-1 max-w-sm mx-auto">
              Khi bạn chốt đơn trên live hoặc tạo đơn hàng mới, danh sách khách hàng và lịch sử mua sẽ tự động xuất hiện ở đây.
            </p>
            <button
              type="button"
              onClick={() => setActiveTab('create-order')}
              className="mt-4 px-4 py-2 bg-[#FF5B65] text-white rounded-2xl text-xs font-bold shadow-xs hover:bg-[#E84A54] transition-colors cursor-pointer"
            >
              Tạo đơn hàng đầu tiên
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#FFF0F1] text-[11px] font-black text-[#8C7065] uppercase tracking-wider">
                  <th className="py-3 px-3">Mẹ / Khách hàng</th>
                  <th className="py-3 px-3">Hạng VIP & Ưu đãi</th>
                  <th className="py-3 px-3">Số đơn / Tích lũy</th>
                  <th className="py-3 px-3">Địa chỉ giao hàng</th>
                  <th className="py-3 px-3">Size bé / Lần mua cuối</th>
                  <th className="py-3 px-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FFF0F1]">
                {filteredCustomers.map((cust) => {
                  const rankInfo = CUSTOMER_RANKS[cust.rank];
                  return (
                    <tr
                      key={cust.id || cust.phone}
                      className="hover:bg-[#FFF9F6] transition-colors group"
                    >
                      {/* Name & Phone */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-2xl bg-[#FFF0F1] text-[#FF5B65] font-black text-sm flex items-center justify-center shrink-0 border border-[#FCD2D6]">
                            {cust.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-black text-[#3D271D] text-xs">
                              {cust.name}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="font-mono text-[11px] font-bold text-[#8C7065]">
                                {cust.phone}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => handleCopyPhone(cust.phone, e)}
                                className="text-[#8C7065] hover:text-[#FF5B65] transition-colors cursor-pointer"
                                title="Sao chép SĐT"
                              >
                                {copiedPhone === cust.phone ? (
                                  <Check className="w-3 h-3 text-[#238774]" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Rank Badge */}
                      <td className="py-3.5 px-3">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-black border"
                          style={{
                            backgroundColor:
                              cust.rank === 'Mẹ Kim Cương'
                                ? '#FAF5FF'
                                : cust.rank === 'Mẹ Thông Thái'
                                ? '#FFFBEB'
                                : cust.rank === 'Bé Ngoan'
                                ? '#F0FDF4'
                                : '#FFF0F1',
                            borderColor:
                              cust.rank === 'Mẹ Kim Cương'
                                ? '#E9D5FF'
                                : cust.rank === 'Mẹ Thông Thái'
                                ? '#FCD34D'
                                : cust.rank === 'Bé Ngoan'
                                ? '#86EFAC'
                                : '#FCD2D6',
                            color:
                              cust.rank === 'Mẹ Kim Cương'
                                ? '#8050D9'
                                : cust.rank === 'Mẹ Thông Thái'
                                ? '#D97706'
                                : cust.rank === 'Bé Ngoan'
                                ? '#15803D'
                                : '#FF5B65',
                          }}
                        >
                          <span>{rankInfo.icon}</span>
                          <span>{cust.rank}</span>
                        </div>
                        {rankInfo.discountPercent > 0 && (
                          <p className="text-[10px] text-[#238774] font-bold mt-1">
                            ✨ Giảm -{rankInfo.discountPercent}% VIP đơn live
                          </p>
                        )}
                      </td>

                      {/* Total orders & spent */}
                      <td className="py-3.5 px-3">
                        <div className="font-black text-[#FF5B65] text-xs">
                          {formatCurrency(cust.totalSpent)}
                        </div>
                        <div className="text-[11px] font-bold text-[#3D271D] mt-0.5">
                          {cust.totalOrders} đơn hàng
                        </div>
                      </td>

                      {/* Address */}
                      <td className="py-3.5 px-3 max-w-[220px]">
                        <p className="text-xs text-[#3D271D] line-clamp-2 leading-relaxed font-medium">
                          {cust.address || 'Chưa cập nhật địa chỉ'}
                        </p>
                      </td>

                      {/* Baby Size memory */}
                      <td className="py-3.5 px-3">
                        {cust.lastBabySize ? (
                          <div>
                            <span className="text-[11px] font-bold text-[#3D271D] bg-[#FFF0F1] px-2 py-0.5 rounded-md border border-[#FCD2D6]">
                              {cust.lastBabySize}
                            </span>
                            <p className="text-[10px] text-[#8C7065] mt-1">
                              {getNextSuggestedBabySize(cust.lastBabySize)}
                            </p>
                          </div>
                        ) : (
                          <span className="text-[11px] text-[#8C7065] italic">Chưa có thông tin size</span>
                        )}
                        {cust.lastOrderDate && (
                          <p className="text-[10px] text-[#A68F86] mt-1">
                            Lần cuối: {cust.lastOrderDate.split(' ')[0]}
                          </p>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleQuickCreateOrder(cust)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#FF5B65] hover:bg-[#E84A54] text-white font-bold text-[11px] shadow-2xs transition-all cursor-pointer active:scale-95 shrink-0"
                            title="Tạo đơn hàng mới với thông tin khách này"
                          >
                            <Zap className="w-3 h-3 fill-current" />
                            Tạo đơn
                          </button>

                          <button
                            type="button"
                            onClick={() => handleViewCustomerOrders(cust.phone)}
                            className="p-1.5 rounded-xl bg-white hover:bg-[#FFF0F1] text-[#8C7065] hover:text-[#FF5B65] border border-[#FCD2D6] transition-colors cursor-pointer shrink-0"
                            title="Xem lịch sử đơn của khách này"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
