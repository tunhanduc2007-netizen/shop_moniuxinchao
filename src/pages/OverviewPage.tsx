import React, { useState } from 'react';
import {
  ShoppingBag,
  CheckCircle,
  Clock,
  XCircle,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  ChevronDown,
  Eye,
  ChevronRight,
  Sparkles,
  Heart,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useShop } from '../context/ShopContext';
import { INITIAL_CARRIERS, REVENUE_7_DAYS } from '../data/initialData';
import { formatCurrency, getStatusStyle } from '../utils/formatters';

export const OverviewPage: React.FC = () => {
  const { orders, products, setActiveTab, setSelectedOrderForModal } = useShop();
  const [dateRange, setDateRange] = useState('Hôm nay (16/10/2025)');
  const [showDateDropdown, setShowDateDropdown] = useState(false);

  // Status pie chart with official Moniu pastel palette
  const statusPieData = [
    { name: 'Đã giao', value: 89, percent: 70, color: '#48C9B0' },      // Mint Green
    { name: 'Đang vận chuyển', value: 18, percent: 14, color: '#58B4FA' }, // Sky Blue
    { name: 'Chờ xử lý', value: 9, percent: 7, color: '#FFC83B' },       // Honey Yellow
    { name: 'Đã hủy', value: 6, percent: 5, color: '#FF5B65' },          // Coral Pink
  ];

  // 5 top metrics matching the reference with Moniu brand color tokens
  const statCards = [
    {
      title: 'Tổng đơn hàng',
      value: '128',
      change: '+12%',
      isIncrease: true,
      compareText: 'so với hôm qua',
      icon: ShoppingBag,
      iconColor: 'text-[#FF5B65]',
      iconBg: 'bg-[#FFF0F1]',
      border: 'border-[#FCD2D6]',
    },
    {
      title: 'Đơn thành công',
      value: '113',
      change: '+15%',
      isIncrease: true,
      compareText: 'so với hôm qua',
      icon: CheckCircle,
      iconColor: 'text-[#238774]',
      iconBg: 'bg-[#EBF9F6]',
      border: 'border-[#B8ECE1]',
    },
    {
      title: 'Đang xử lý',
      value: '9',
      change: '+50%',
      isIncrease: true,
      compareText: 'so với hôm qua',
      icon: Clock,
      iconColor: 'text-[#B87B00]',
      iconBg: 'bg-[#FFF8E6]',
      border: 'border-[#FDE199]',
    },
    {
      title: 'Đã hủy',
      value: '6',
      change: '-25%',
      isIncrease: false,
      compareText: 'so với hôm qua',
      icon: XCircle,
      iconColor: 'text-[#D93D48]',
      iconBg: 'bg-[#FFF0F1]',
      border: 'border-[#FCD2D6]',
    },
    {
      title: 'Doanh thu (ước tính)',
      value: '25.680.000đ',
      change: '+18%',
      isIncrease: true,
      compareText: 'so với hôm qua',
      icon: Wallet,
      iconColor: 'text-[#8050D9]',
      iconBg: 'bg-[#F6F1FE]',
      border: 'border-[#E7DBFC]',
    },
  ];

  const todayOrders = orders.slice(0, 5);
  const recentOrders = orders.slice(0, 7);

  const dateOptions = [
    'Hôm nay (16/10/2025)',
    'Hôm qua (15/10/2025)',
    '7 ngày gần nhất',
    'Tháng này (10/2025)',
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Brand Welcome Banner & Header Bar */}
      <div className="bg-gradient-to-r from-[#FFF0F1] via-[#FFF9F6] to-[#FFF5ED] border border-[#FDE2E4] rounded-3xl p-5 sm:p-6 shadow-2xs relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 max-w-[240px] opacity-15 sm:opacity-25 pointer-events-none flex items-center justify-end pr-4">
          <img
            src="/branding/logo-mark.png"
            alt="Moniu Xin chào"
            className="w-40 h-40 object-contain"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white p-1 shadow-md shadow-[#FF5B65]/15 border border-[#FDE2E4] shrink-0">
              <img
                src="/branding/logo-mark.png"
                alt="Moniu Logo"
                className="w-full h-full object-contain rounded-xl"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-[#3D271D] tracking-tight font-['Nunito',sans-serif]">
                  Moniu Xin chào
                </h1>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#FF5B65] text-white shadow-xs">
                  <Heart className="w-2.5 h-2.5 fill-current" />
                  Baby & Kid Shop
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#8C7065] mt-1 font-medium">
                Tình hình kinh doanh và chốt đơn thời trang em bé hôm nay
              </p>
            </div>
          </div>

          {/* Date Selector */}
          <div className="relative self-start sm:self-auto">
            <button
              onClick={() => setShowDateDropdown(!showDateDropdown)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-2xl border border-[#FDE2E4] text-xs font-bold text-[#3D271D] shadow-2xs hover:bg-[#FFF9F6] transition-colors cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-[#FF5B65]" />
              <span>{dateRange}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#8C7065] ml-1" />
            </button>

            {showDateDropdown && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowDateDropdown(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#FDE2E4] py-1.5 z-20">
                  {dateOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setDateRange(opt);
                        setShowDateDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors cursor-pointer ${
                        dateRange === opt
                          ? 'text-[#FF5B65] font-bold bg-[#FFF0F1]'
                          : 'text-[#3D271D] hover:bg-[#FFF9F6]'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 5 Metric Stat Cards (Top Row) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`bg-white rounded-3xl p-4.5 border ${card.border} shadow-2xs hover:shadow-md transition-shadow relative overflow-hidden`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-2xl ${card.iconBg} flex items-center justify-center shrink-0 shadow-2xs`}
                >
                  <Icon className={`w-5 h-5 ${card.iconColor}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#8C7065] truncate">{card.title}</p>
                  <p className="text-xl font-black text-[#3D271D] tracking-tight mt-0.5 font-['Nunito',sans-serif]">
                    {card.value}
                  </p>
                </div>
              </div>

              {/* Trend Badge */}
              <div className="mt-3 pt-2.5 border-t border-[#FFF0F1] flex items-center gap-1.5 text-xs">
                {card.isIncrease ? (
                  <span className="flex items-center text-[#238774] font-bold">
                    <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                    {card.change}
                  </span>
                ) : (
                  <span className="flex items-center text-[#D93D48] font-bold">
                    <ArrowDownRight className="w-3.5 h-3.5 stroke-[2.5]" />
                    {card.change}
                  </span>
                )}
                <span className="text-[#8C7065]/80 text-[11px] font-medium">{card.compareText}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Middle Row: Revenue 7 days | Status Donut | Today's Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Widget 1: Revenue 7 days chart (5 cols on lg) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-5 border border-[#FDE2E4] shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-extrabold text-[#3D271D] font-['Nunito',sans-serif]">
                Doanh thu 7 ngày gần nhất
              </h2>
              <p className="text-xs text-[#8C7065] mt-0.5">Xu hướng chốt đơn đồ bé theo tuần</p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-[#FF5B65] bg-[#FFF0F1] px-3 py-1.5 rounded-xl border border-[#FCD2D6]">
              <span>Doanh thu</span>
              <ChevronDown className="w-3 h-3 text-[#FF5B65]" />
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={REVENUE_7_DAYS}
                margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorMoniuRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF5B65" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#FFAAA6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={{ stroke: '#FDE2E4' }}
                  tick={{ fill: '#8C7065', fontSize: 11 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#8C7065', fontSize: 11 }}
                  tickFormatter={(val) => `${val / 1000000}tr`}
                  domain={[0, 40000000]}
                  ticks={[0, 10000000, 20000000, 30000000, 40000000]}
                />
                <Tooltip
                  formatter={(val: any) => [formatCurrency(Number(val) || 0), 'Doanh thu']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    boxShadow: '0 10px 25px -5px rgba(255, 91, 101, 0.15)',
                    border: '1px solid #FDE2E4',
                    fontSize: '12px',
                    color: '#3D271D',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#FF5B65"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorMoniuRev)"
                  dot={{ r: 4, fill: '#FF5B65', strokeWidth: 2, stroke: '#ffffff' }}
                  activeDot={{ r: 6, fill: '#E84A54', stroke: '#ffffff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Widget 2: Donut Status chart (3 cols on lg) */}
        <div className="lg:col-span-3 bg-white rounded-3xl p-5 border border-[#FDE2E4] shadow-2xs flex flex-col justify-between">
          <div className="mb-2">
            <h2 className="text-sm font-extrabold text-[#3D271D] font-['Nunito',sans-serif]">
              Trạng thái đơn hàng
            </h2>
            <p className="text-xs text-[#8C7065] mt-0.5">Tỷ lệ xử lý đơn trong ngày</p>
          </div>

          <div className="flex items-center justify-center relative my-1">
            <div className="w-36 h-36">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={46}
                    outerRadius={64}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {statusPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-black text-[#3D271D] font-['Nunito',sans-serif]">128</span>
              <span className="text-[10px] text-[#8C7065] font-bold -mt-0.5">đơn bé yêu</span>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-2 mt-2 pt-2 border-t border-[#FFF0F1] text-xs">
            {statusPieData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-[#3D271D] font-medium">{item.name}</span>
                </div>
                <span className="font-bold text-[#3D271D]">
                  {item.value} <span className="text-[#8C7065] font-normal">({item.percent}%)</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Widget 3: Today's Orders (4 cols on lg) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-5 border border-[#FDE2E4] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-extrabold text-[#3D271D] font-['Nunito',sans-serif]">
                Đơn hàng hôm nay
              </h2>
              <p className="text-xs text-[#8C7065] mt-0.5">Chốt đơn gần nhất lúc live</p>
            </div>
            <button
              onClick={() => setActiveTab('orders')}
              className="text-xs text-[#FF5B65] hover:text-[#E84A54] font-bold flex items-center gap-0.5 cursor-pointer"
            >
              Xem tất cả
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-[#FFF0F1] flex-1">
            {todayOrders.map((ord) => {
              const statusStyle = getStatusStyle(ord.status);
              const firstItem = ord.items[0];
              return (
                <div
                  key={ord.id}
                  onClick={() => setSelectedOrderForModal(ord)}
                  className="py-2.5 flex items-center justify-between gap-2 hover:bg-[#FFF9F6] rounded-2xl px-2 transition-colors cursor-pointer"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold text-[#3D271D] font-mono">{ord.code}</p>
                    <p className="text-[11px] text-[#8C7065] truncate mt-0.5 font-medium">
                      {firstItem ? `${firstItem.productName} (${firstItem.variant})` : 'Chưa có sản phẩm'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusStyle.bg} ${statusStyle.text} border ${statusStyle.border}`}
                    >
                      {ord.status}
                    </span>
                    <span className="text-[10px] text-[#8C7065] font-semibold">{ord.timeString}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Orders Table & Stacked Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Recent Orders Table */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-5 border border-[#FDE2E4] shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-extrabold text-[#3D271D] font-['Nunito',sans-serif]">
                Đơn hàng gần đây
              </h2>
              <p className="text-xs text-[#8C7065] mt-0.5">Danh sách các đơn chốt live TikTok Moniu</p>
            </div>
            <button
              onClick={() => setActiveTab('orders')}
              className="text-xs text-[#FF5B65] hover:text-[#E84A54] font-bold flex items-center gap-0.5 cursor-pointer"
            >
              Xem tất cả
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Responsive Table Wrapper */}
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead>
                <tr className="text-[#8C7065] border-b border-[#FDE2E4] font-bold">
                  <th className="pb-3 pr-3">Mã đơn</th>
                  <th className="pb-3 px-3">Khách hàng</th>
                  <th className="pb-3 px-3">Sản phẩm</th>
                  <th className="pb-3 px-3 text-center">SL</th>
                  <th className="pb-3 px-3">Tổng tiền</th>
                  <th className="pb-3 px-3 text-center">Trạng thái</th>
                  <th className="pb-3 px-3 text-right">Thời gian</th>
                  <th className="pb-3 pl-3 text-center">Xem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FFF0F1]">
                {recentOrders.map((ord) => {
                  const statusStyle = getStatusStyle(ord.status);
                  const firstItem = ord.items[0];
                  const totalQty = ord.items.reduce((acc, it) => acc + it.quantity, 0);

                  return (
                    <tr
                      key={ord.id}
                      className="hover:bg-[#FFF9F6] transition-colors group cursor-pointer"
                      onClick={() => setSelectedOrderForModal(ord)}
                    >
                      <td className="py-3 pr-3 font-extrabold text-[#3D271D] font-mono">{ord.code}</td>
                      <td className="py-3 px-3 font-bold text-[#3D271D]">{ord.customerName}</td>
                      <td className="py-3 px-3 text-[#8C7065] max-w-[150px] truncate font-medium">
                        {firstItem ? firstItem.variant : 'Sản phẩm mẫu'}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-[#3D271D]">{totalQty}</td>
                      <td className="py-3 px-3 font-black text-[#FF5B65]">
                        {formatCurrency(ord.totalAmount)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${statusStyle.bg} ${statusStyle.text} border ${statusStyle.border}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right text-[#8C7065] font-semibold">{ord.timeString}</td>
                      <td className="py-3 pl-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedOrderForModal(ord)}
                          className="p-1.5 text-[#8C7065] hover:text-[#FF5B65] hover:bg-[#FFF0F1] rounded-xl transition-colors cursor-pointer"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Stacked Cards (Vận chuyển & Doanh thu theo sản phẩm) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Card 1: Vận chuyển */}
          <div className="bg-white rounded-3xl p-5 border border-[#FDE2E4] shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-extrabold text-[#3D271D] font-['Nunito',sans-serif]">
                  Vận chuyển
                </h2>
                <p className="text-xs text-[#8C7065] mt-0.5">Tiến độ giao hàng đối tác</p>
              </div>
              <button
                onClick={() => setActiveTab('shipping')}
                className="text-xs text-[#FF5B65] hover:text-[#E84A54] font-bold cursor-pointer"
              >
                Xem chi tiết
              </button>
            </div>

            <div className="space-y-3.5">
              {INITIAL_CARRIERS.map((carrier) => (
                <div key={carrier.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center font-black text-[10px] text-white shrink-0 shadow-2xs"
                      style={{ backgroundColor: carrier.color }}
                    >
                      {carrier.logo}
                    </div>
                    <span className="font-bold text-[#3D271D]">{carrier.id}</span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="text-[#8C7065]">
                      Đang giao <strong className="text-[#3D271D] font-bold">{carrier.delivering}</strong>
                    </span>
                    <span className="text-[#8C7065]">
                      Thành công <strong className="text-[#238774] font-bold">{carrier.success}</strong>
                    </span>
                    <span className="text-[#8C7065]">
                      Thất bại <strong className="text-[#D93D48] font-bold">{carrier.failed}</strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Doanh thu theo sản phẩm */}
          <div className="bg-white rounded-3xl p-5 border border-[#FDE2E4] shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-extrabold text-[#3D271D] font-['Nunito',sans-serif]">
                  Doanh thu theo sản phẩm
                </h2>
                <p className="text-xs text-[#8C7065] mt-0.5">Mặt hàng bé yêu bán chạy</p>
              </div>
              <button
                onClick={() => setActiveTab('reports')}
                className="text-xs text-[#FF5B65] hover:text-[#E84A54] font-bold cursor-pointer"
              >
                Xem chi tiết
              </button>
            </div>

            <div className="space-y-3">
              {products.map((prod) => (
                <div key={prod.code} className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-10 h-10 rounded-2xl object-cover bg-[#FFF0F1] shrink-0 border border-[#FDE2E4]"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-[#3D271D] truncate">
                        {prod.code} - {prod.name}
                      </p>
                      <p className="text-[10px] text-[#8C7065] font-semibold">Đã bán: {prod.soldCount} set</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="font-black text-[#FF5B65]">{formatCurrency(prod.revenue)}</p>
                    <p className="text-[10px] text-[#8C7065] font-bold">{prod.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
