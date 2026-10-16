import React, { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Percent,
  ArrowUpRight,
  Heart,
  Sparkles,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';
import { useShop } from '../context/ShopContext';
import { formatCurrency } from '../utils/formatters';

export const ReportsPage: React.FC = () => {
  const { orders, products } = useShop();
  const [timeFilter, setTimeFilter] = useState('7days');

  // Key KPI metrics
  const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== 'Đã hủy' ? o.totalAmount : 0), 0) + 25680000;
  const totalOrdersCount = 128 + orders.length - 12;
  const averageOrderValue = Math.round(totalRevenue / totalOrdersCount);
  const successRate = 88.3;

  // Chart data for daily revenue
  const dailyData = [
    { day: 'Thứ 2', revenue: 10200000, orders: 18 },
    { day: 'Thứ 3', revenue: 13500000, orders: 22 },
    { day: 'Thứ 4', revenue: 20400000, orders: 31 },
    { day: 'Thứ 5', revenue: 18100000, orders: 27 },
    { day: 'Thứ 6', revenue: 28200000, orders: 39 },
    { day: 'Thứ 7', revenue: 23400000, orders: 34 },
    { day: 'Chủ nhật', revenue: 30500000, orders: 42 },
  ];

  // Channel breakdown for Moniu Xin chào
  const channelData = [
    { name: 'TikTok Live Stream Moniu', value: 65, color: '#FF5B65' },
    { name: 'Showcase đồ em bé', value: 25, color: '#48C9B0' },
    { name: 'Video review bé yêu gắn link', value: 10, color: '#FFC83B' },
  ];

  const kpis = [
    {
      title: 'Tổng doanh thu shop',
      value: formatCurrency(totalRevenue),
      trend: '+18.2%',
      icon: DollarSign,
      color: 'text-[#FF5B65] bg-[#FFF0F1]',
      border: 'border-[#FCD2D6]',
    },
    {
      title: 'Tổng đơn hàng bé yêu',
      value: `${totalOrdersCount} đơn`,
      trend: '+12.5%',
      icon: ShoppingBag,
      color: 'text-[#238774] bg-[#EBF9F6]',
      border: 'border-[#B8ECE1]',
    },
    {
      title: 'Giá trị đơn TB (AOV)',
      value: formatCurrency(averageOrderValue),
      trend: '+5.4%',
      icon: TrendingUp,
      color: 'text-[#8050D9] bg-[#F6F1FE]',
      border: 'border-[#E7DBFC]',
    },
    {
      title: 'Tỷ lệ giao thành công',
      value: `${successRate}%`,
      trend: '+2.1%',
      icon: Percent,
      color: 'text-[#B87B00] bg-[#FFF8E6]',
      border: 'border-[#FDE199]',
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[#3D271D] tracking-tight font-['Nunito',sans-serif]">
              Báo cáo & Phân tích
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#FFF0F1] text-[#FF5B65] border border-[#FCD2D6] flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Moniu Analytics
            </span>
          </div>
          <p className="text-sm text-[#8C7065] mt-0.5 font-medium">
            Thống kê doanh thu thời trang em bé và tỷ lệ chốt đơn livestream TikTok
          </p>
        </div>

        {/* Time period filter */}
        <div className="flex items-center gap-2">
          <div className="bg-white rounded-2xl p-1.5 border border-[#FDE2E4] flex items-center gap-1 text-xs font-bold shadow-2xs">
            <button
              onClick={() => setTimeFilter('7days')}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                timeFilter === '7days'
                  ? 'bg-[#FF5B65] text-white shadow-xs'
                  : 'text-[#8C7065] hover:bg-[#FFF9F6]'
              }`}
            >
              7 ngày qua
            </button>
            <button
              onClick={() => setTimeFilter('30days')}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                timeFilter === '30days'
                  ? 'bg-[#FF5B65] text-white shadow-xs'
                  : 'text-[#8C7065] hover:bg-[#FFF9F6]'
              }`}
            >
              30 ngày qua
            </button>
            <button
              onClick={() => setTimeFilter('month')}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                timeFilter === 'month'
                  ? 'bg-[#FF5B65] text-white shadow-xs'
                  : 'text-[#8C7065] hover:bg-[#FFF9F6]'
              }`}
            >
              Tháng này
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className={`bg-white rounded-3xl p-5 border ${kpi.border} shadow-2xs`}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-[#8C7065]">{kpi.title}</p>
                <div className={`p-2 rounded-2xl ${kpi.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xl font-black text-[#3D271D] mt-2 tracking-tight font-['Nunito',sans-serif]">
                {kpi.value}
              </p>
              <div className="mt-2.5 flex items-center gap-1 text-xs font-bold text-[#238774]">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>{kpi.trend}</span>
                <span className="text-[#8C7065] font-medium text-[11px]">so với kỳ trước</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Revenue Bar Chart (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-5 border border-[#FDE2E4] shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-extrabold text-[#3D271D] font-['Nunito',sans-serif]">
                Doanh thu theo ngày livestream
              </h2>
              <p className="text-xs text-[#8C7065] mt-0.5">Biểu đồ so sánh doanh số các ngày live Moniu</p>
            </div>
            <span className="text-xs text-[#FF5B65] font-bold bg-[#FFF0F1] px-3 py-1.5 rounded-xl border border-[#FCD2D6]">
              Đơn vị: VNĐ
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#FFF0F1" />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={{ stroke: '#FDE2E4' }}
                  tick={{ fill: '#8C7065', fontSize: 11 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#8C7065', fontSize: 11 }}
                  tickFormatter={(val) => `${val / 1000000}tr`}
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
                <Bar dataKey="revenue" fill="#FF5B65" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Channel Breakdown Donut (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-5 border border-[#FDE2E4] shadow-2xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-extrabold text-[#3D271D] font-['Nunito',sans-serif]">
              Kênh bán hàng TikTok
            </h2>
            <p className="text-xs text-[#8C7065] mt-0.5">Tỷ lệ đóng góp doanh thu theo kênh Moniu</p>
          </div>

          <div className="flex items-center justify-center my-4 h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={channelData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {channelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-2 border-t border-[#FFF0F1] text-xs">
            {channelData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-[#3D271D] font-medium">{item.name}</span>
                </div>
                <span className="font-extrabold text-[#3D271D]">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Products Table */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#FDE2E4] shadow-2xs">
        <h2 className="text-sm font-extrabold text-[#3D271D] mb-4 font-['Nunito',sans-serif]">
          Xếp hạng đồ em bé bán chạy nhất Moniu
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead>
              <tr className="border-b border-[#FDE2E4] text-[#8C7065] font-bold">
                <th className="pb-3 pr-4">Mã SP</th>
                <th className="pb-3 px-4">Tên sản phẩm</th>
                <th className="pb-3 px-4 text-right">Đơn giá</th>
                <th className="pb-3 px-4 text-center">Đã bán</th>
                <th className="pb-3 px-4 text-right">Tổng doanh thu</th>
                <th className="pb-3 pl-4 text-right">Đóng góp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#FFF0F1]">
              {products.map((prod) => (
                <tr key={prod.code} className="hover:bg-[#FFF9F6] transition-colors">
                  <td className="py-3.5 pr-4 font-black text-[#FF5B65] font-mono">{prod.code}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="w-8 h-8 rounded-xl object-cover border border-[#FDE2E4]"
                      />
                      <span className="font-bold text-[#3D271D]">{prod.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right font-medium text-[#3D271D]">
                    {formatCurrency(prod.price)}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-[#3D271D]">
                    {prod.soldCount} set
                  </td>
                  <td className="py-3.5 px-4 text-right font-black text-[#FF5B65]">
                    {formatCurrency(prod.revenue)}
                  </td>
                  <td className="py-3.5 pl-4 text-right">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#EBF9F6] text-[#238774] border border-[#B8ECE1]">
                      {prod.percentage}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
