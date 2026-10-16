import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Eye,
  Trash2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  Plus,
  Phone,
  Sparkles,
  Clock,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import type { Order, OrderStatus } from '../types';
import { formatCurrency, getStatusStyle } from '../utils/formatters';
import { LiveHoldOrdersModal } from '../components/LiveHoldOrdersModal';

export const OrderHistoryPage: React.FC = () => {
  const {
    orders,
    updateOrderStatus,
    deleteOrder,
    setSelectedOrderForModal,
    setActiveTab,
    searchQuery: globalSearch,
  } = useShop();

  const [localSearch, setLocalSearch] = useState(globalSearch || '');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLiveHoldModalOpen, setIsLiveHoldModalOpen] = useState(false);
  const itemsPerPage = 7;

  // Đếm đơn chờ live
  const pendingHoldCount = useMemo(() => {
    return orders.filter((o) => o.status === 'Chờ thông tin' || o.isPendingInfo).length;
  }, [orders]);

  // Filter orders
  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      const query = localSearch.toLowerCase().trim();
      const matchSearch =
        !query ||
        ord.code.toLowerCase().includes(query) ||
        ord.customerName.toLowerCase().includes(query) ||
        ord.customerPhone.toLowerCase().includes(query) ||
        ord.items.some((it) => it.productName.toLowerCase().includes(query));

      const matchStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'Chờ thông tin'
          ? ord.status === 'Chờ thông tin' || ord.isPendingInfo
          : ord.status === statusFilter;
      const matchPayment = paymentFilter === 'all' || ord.paymentMethod === paymentFilter;

      return matchSearch && matchStatus && matchPayment;
    });
  }, [orders, localSearch, statusFilter, paymentFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;
  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(start, start + itemsPerPage);
  }, [filteredOrders, currentPage]);

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleExportCSV = () => {
    const headers = ['Mã đơn Moniu', 'Tên khách / Mẹ', 'SĐT', 'Đồ em bé', 'Tổng tiền', 'Thanh toán', 'Trạng thái', 'Ngày tạo'];
    const rows = filteredOrders.map((o) => [
      o.code,
      `"${o.customerName}"`,
      `"${o.customerPhone}"`,
      `"${o.items.map((i) => `${i.productName} (${i.variant}) x${i.quantity}`).join('; ')}"`,
      o.totalAmount,
      o.paymentMethod,
      o.status,
      `"${o.createdAt}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MoniuXinChao_Orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statusList: { key: string; label: string; count: number }[] = [
    { key: 'all', label: 'Tất cả đơn', count: orders.length },
    {
      key: 'Chờ thông tin',
      label: '⏳ Chờ thông tin (Giữ live)',
      count: pendingHoldCount,
    },
    { key: 'Chờ xử lý', label: 'Chờ xử lý', count: orders.filter((o) => o.status === 'Chờ xử lý').length },
    { key: 'Đang xử lý', label: 'Đang xử lý', count: orders.filter((o) => o.status === 'Đang xử lý').length },
    { key: 'Đang giao', label: 'Đang giao', count: orders.filter((o) => o.status === 'Đang giao').length },
    { key: 'Đã giao', label: 'Đã giao', count: orders.filter((o) => o.status === 'Đã giao').length },
    { key: 'Đã hủy', label: 'Đã hủy', count: orders.filter((o) => o.status === 'Đã hủy').length },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#3D271D] tracking-tight font-['Nunito',sans-serif]">
            Lịch sử đơn hàng
          </h1>
          <p className="text-sm text-[#8C7065] mt-0.5 font-medium">
            Quản lý, tìm kiếm và cập nhật trạng thái toàn bộ đơn chốt live Moniu
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsLiveHoldModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-2xl transition-colors shadow-2xs cursor-pointer"
            title="Mở khay đơn hàng giữ đồ trên live"
          >
            <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
            <span>⏳ Khay hàng chờ live</span>
            {pendingHoldCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white shadow-2xs">
                {pendingHoldCount}
              </span>
            )}
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-[#3D271D] bg-white hover:bg-[#FFF9F6] border border-[#FDE2E4] rounded-2xl transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#8C7065]" />
            Xuất Excel/CSV
          </button>
          <button
            onClick={() => setActiveTab('create-order')}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-extrabold text-white bg-gradient-to-r from-[#FF5B65] to-[#F14652] hover:from-[#E84A54] hover:to-[#DE3D49] rounded-2xl transition-all shadow-md shadow-[#FF5B65]/20 cursor-pointer font-['Nunito',sans-serif]"
          >
            <Plus className="w-4 h-4" />
            Chốt đơn mới
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#FDE2E4] shadow-2xs space-y-4">
        {/* Status filter pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {statusList.map((tab) => {
            const isActive = statusFilter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => handleStatusFilterChange(tab.key)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-[#FF5B65] text-white shadow-md shadow-[#FF5B65]/25'
                    : 'bg-[#FFF9F6] text-[#8C7065] hover:bg-[#FFF0F1] hover:text-[#FF5B65] border border-[#FDE2E4]'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                    isActive ? 'bg-white text-[#FF5B65]' : 'bg-[#FDE2E4] text-[#3D271D]'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Extra Filters row */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-3 border-t border-[#FFF0F1]">
          <div className="sm:col-span-8 relative">
            <Search className="w-4 h-4 text-[#8C7065] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => {
                setLocalSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Tìm theo mã đơn (MN-...), tên mẹ/khách, SĐT hoặc tên đồ bé..."
              className="w-full bg-[#FFF9F6] focus:bg-white text-xs text-[#3D271D] pl-10 pr-8 py-2.5 rounded-2xl border border-[#FDE2E4] focus:outline-hidden focus:border-[#FF5B65] focus:ring-2 focus:ring-[#FF5B65]/15 font-medium"
            />
            {localSearch && (
              <button
                onClick={() => setLocalSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C7065] hover:text-[#3D271D] text-xs cursor-pointer"
              >
                ×
              </button>
            )}
          </div>

          <div className="sm:col-span-4 flex items-center gap-2">
            <select
              value={paymentFilter}
              onChange={(e) => {
                setPaymentFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#FFF9F6] text-xs font-bold text-[#3D271D] px-3.5 py-2.5 rounded-2xl border border-[#FDE2E4] focus:outline-hidden focus:border-[#FF5B65]"
            >
              <option value="all">Tất cả thanh toán</option>
              <option value="COD">Tiền mặt (COD)</option>
              <option value="Chuyển khoản">Chuyển khoản</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table Container */}
      <div className="bg-white rounded-3xl border border-[#FDE2E4] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead>
              <tr className="bg-[#FFF9F6] text-[#8C7065] border-b border-[#FDE2E4] font-bold">
                <th className="py-3.5 px-4">Mã đơn</th>
                <th className="py-3.5 px-3">Mẹ & Bé (Khách)</th>
                <th className="py-3.5 px-3">Chi tiết đồ em bé</th>
                <th className="py-3.5 px-3">Tổng tiền</th>
                <th className="py-3.5 px-3 text-center">Thanh toán</th>
                <th className="py-3.5 px-3 text-center">Trạng thái</th>
                <th className="py-3.5 px-3 text-right">Ngày chốt</th>
                <th className="py-3.5 px-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#FFF0F1]">
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#8C7065] text-xs font-medium">
                    Không tìm thấy đơn hàng nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                currentItems.map((ord) => {
                  const statusStyle = getStatusStyle(ord.status);
                  const firstItem = ord.items[0];

                  return (
                    <tr
                      key={ord.id}
                      className="hover:bg-[#FFF9F6] transition-colors group cursor-pointer"
                      onClick={() => setSelectedOrderForModal(ord)}
                    >
                      {/* Mã đơn */}
                      <td className="py-3.5 px-4 font-mono font-black text-[#FF5B65]">
                        <span className="bg-[#FFF0F1] px-2.5 py-1 rounded-xl border border-[#FCD2D6]">
                          {ord.code}
                        </span>
                      </td>

                      {/* Khách hàng & SĐT */}
                      <td className="py-3.5 px-3">
                        <p className="font-bold text-[#3D271D]">{ord.customerName}</p>
                        <p className="text-[11px] text-[#8C7065] flex items-center gap-1 mt-0.5 font-medium">
                          <Phone className="w-2.5 h-2.5 text-[#FF5B65]" />
                          {ord.customerPhone || 'Chưa có SĐT'}
                        </p>
                      </td>

                      {/* Sản phẩm */}
                      <td className="py-3.5 px-3 max-w-[220px] truncate">
                        <p className="text-[#3D271D] font-bold truncate">
                          {firstItem ? `${firstItem.productName} (${firstItem.variant})` : 'Chưa có SP'}
                        </p>
                        {ord.items.length > 1 && (
                          <span className="text-[10px] text-[#FF5B65] font-extrabold">
                            +{ord.items.length - 1} món đồ khác
                          </span>
                        )}
                      </td>

                      {/* Tổng tiền */}
                      <td className="py-3.5 px-3">
                        <span className="font-black text-[#FF5B65] text-sm">
                          {formatCurrency(ord.totalAmount)}
                        </span>
                      </td>

                      {/* Thanh toán */}
                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-xl ${
                            ord.paymentMethod === 'Chuyển khoản'
                              ? 'bg-[#F6F1FE] text-[#8050D9] border border-[#E7DBFC]'
                              : 'bg-[#FFF9F6] text-[#8C7065] border border-[#FDE2E4]'
                          }`}
                        >
                          {ord.paymentMethod}
                        </span>
                      </td>

                      {/* Trạng thái dropdown/badge */}
                      <td className="py-3.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={ord.status}
                          onChange={(e) =>
                            updateOrderStatus(ord.id, e.target.value as OrderStatus)
                          }
                          className={`text-[11px] font-bold px-3 py-1 rounded-full cursor-pointer focus:outline-hidden ${statusStyle.bg} ${statusStyle.text} border ${statusStyle.border}`}
                        >
                          <option value="Chờ thông tin">⏳ Chờ thông tin (Giữ đồ)</option>
                          <option value="Chờ xử lý">Chờ xử lý</option>
                          <option value="Đang xử lý">Đang xử lý</option>
                          <option value="Đang giao">Đang giao</option>
                          <option value="Đã giao">Đã giao</option>
                          <option value="Đã hủy">Đã hủy</option>
                        </select>
                      </td>

                      {/* Ngày tạo */}
                      <td className="py-3.5 px-3 text-right text-[#8C7065] text-[11px] font-semibold">
                        {ord.createdAt}
                      </td>

                      {/* Thao tác */}
                      <td
                        className="py-3.5 px-4 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedOrderForModal(ord)}
                            className="p-1.5 text-[#8C7065] hover:text-[#FF5B65] hover:bg-[#FFF0F1] rounded-xl transition-colors cursor-pointer"
                            title="Xem chi tiết đơn"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteOrder(ord.id)}
                            className="p-1.5 text-[#8C7065] hover:text-[#D93D48] hover:bg-[#FFF0F1] rounded-xl transition-colors cursor-pointer"
                            title="Xóa đơn hàng"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-[#FDE2E4] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#8C7065]">
          <div>
            Hiển thị <span className="font-bold text-[#3D271D]">{currentItems.length}</span> /{' '}
            <span className="font-bold text-[#3D271D]">{filteredOrders.length}</span> đơn hàng
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl border border-[#FDE2E4] text-[#8C7065] hover:bg-[#FFF9F6] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 py-1 text-[#3D271D] font-bold">
              Trang {currentPage} / {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl border border-[#FDE2E4] text-[#8C7065] hover:bg-[#FFF9F6] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal Quản lý Hàng chờ Live */}
      <LiveHoldOrdersModal
        isOpen={isLiveHoldModalOpen}
        onClose={() => setIsLiveHoldModalOpen(false)}
      />
    </div>
  );
};
