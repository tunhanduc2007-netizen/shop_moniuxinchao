import React, { useState, useMemo } from 'react';
import {
  Package,
  Search,
  Grid,
  List,
  Sparkles,
  Heart,
  Plus,
  Download,
  Eye,
  X,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Boxes,
  Check,
  Copy,
  Tag,
  ArrowUpDown,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import type { ProductCatalogItem } from '../types';
import { formatCurrency } from '../utils/formatters';
import { SizeSelectionModal } from '../components/SizeSelectionModal';

export const ProductsPage: React.FC = () => {
  const { products, setActiveTab, setPendingOrderItem, showToast } = useShop();

  // Search, Filter & Sort states
  const [searchTerm, setSearchTerm] = useState('');
  const [brandFilter, setBrandFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'name'>('default');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = viewMode === 'grid' ? 12 : 10;

  // Selected product for detail modal
  const [selectedProduct, setSelectedProduct] = useState<ProductCatalogItem | null>(null);
  const [productForSizeModal, setProductForSizeModal] = useState<ProductCatalogItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Brand counts
  const brandStats = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p) => {
      const b = p.brand || 'Khác';
      counts[b] = (counts[b] || 0) + 1;
    });
    return {
      nous: counts['NOUS'] || 0,
      lapomme: counts['LA POMME'] || 0,
      monona: counts['MONONA'] || 0,
      moniu: counts['Moniu'] || 0,
      total: products.length,
    };
  }, [products]);

  // Category counts
  const categoryStats = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p) => {
      const c = p.category || 'Khác';
      counts[c] = (counts[c] || 0) + 1;
    });
    return counts;
  }, [products]);

  // Filtering & Sorting
  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => {
      const q = searchTerm.toLowerCase().trim();
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        (p.tiktokId && p.tiktokId.includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q));

      const matchBrand = brandFilter === 'all' || p.brand === brandFilter;
      const matchCategory = categoryFilter === 'all' || p.category === categoryFilter;

      return matchSearch && matchBrand && matchCategory;
    });

    if (sortBy === 'price-asc') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result = [...result].sort((a, b) => b.price - a.price);
    } else if (sortBy === 'name') {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [products, searchTerm, brandFilter, categoryFilter, sortBy]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const handleCopy = (text?: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportCSV = () => {
    const headers = ['Mã Moniu', 'Mã TikTok Shop ID', 'Tên sản phẩm', 'Thương hiệu', 'Danh mục', 'Đơn giá', 'Các size/biến thể'];
    const rows = filteredProducts.map((p) => [
      p.code,
      p.tiktokId || '',
      `"${p.name.replace(/"/g, '""')}"`,
      p.brand || 'Moniu',
      p.category || 'Đồ sơ sinh',
      p.price,
      `"${p.variants.join('; ')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Kho_San_Pham_Moniu_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Bước chọn size khi bấm Chốt đơn
  const handleCreateOrderWithProduct = (prod: ProductCatalogItem) => {
    setProductForSizeModal(prod);
  };

  const handleConfirmSizeSelection = (
    prod: ProductCatalogItem,
    selectedSize: string,
    quantity: number
  ) => {
    setPendingOrderItem({
      id: Math.random().toString(),
      productCode: prod.code,
      productName: prod.name,
      variant: selectedSize,
      unitPrice: prod.price,
      quantity: quantity,
      image: prod.image,
    });

    showToast({
      type: 'success',
      title: 'Đã chọn size cho sản phẩm!',
      message: `${prod.name} (Size: ${selectedSize}, SL: ${quantity})`,
      code: prod.code,
    });

    setActiveTab('create-order');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[#3D271D] tracking-tight font-['Nunito',sans-serif]">
              Kho 330 sản phẩm thực tế
            </h1>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#FFF0F1] text-[#FF5B65] border border-[#FCD2D6] flex items-center gap-1">
              <Heart className="w-3 h-3 fill-[#FF5B65]" />
              TikTok Shop Catalog
            </span>
          </div>
          <p className="text-sm text-[#8C7065] mt-0.5 font-medium">
            Quản lý, tra cứu nhanh toàn bộ kho đồ sơ sinh chính hãng NOUS, LA POMME, MONONA
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#3D271D] bg-white hover:bg-[#FFF9F6] border border-[#FDE2E4] rounded-2xl transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#8C7065]" />
            Xuất Excel kho SP
          </button>
          <button
            onClick={() => setActiveTab('create-order')}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-extrabold text-white bg-gradient-to-r from-[#FF5B65] to-[#F14652] hover:from-[#E84A54] hover:to-[#DE3D49] rounded-2xl transition-all shadow-md shadow-[#FF5B65]/20 cursor-pointer font-['Nunito',sans-serif]"
          >
            <Plus className="w-4 h-4" />
            Lên đơn chốt live
          </button>
        </div>
      </div>

      {/* Brand Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-4.5 border border-[#FDE2E4] shadow-2xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#FFF0F1] text-[#FF5B65] flex items-center justify-center shrink-0 shadow-2xs">
            <Package className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-[#8C7065]">Tổng kho sản phẩm</p>
            <p className="text-xl font-black text-[#3D271D] font-['Nunito',sans-serif] mt-0.5">
              {brandStats.total} <span className="text-xs text-[#8C7065] font-normal">mẫu</span>
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-4.5 border border-[#B8ECE1] shadow-2xs flex items-center gap-3 notranslate" translate="no">
          <div className="w-11 h-11 rounded-2xl bg-[#EBF9F6] text-[#238774] flex items-center justify-center shrink-0 shadow-2xs font-black text-xs font-mono">
            NOUS
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-[#8C7065]">Hãng NOUS</p>
            <p className="text-xl font-black text-[#238774] font-['Nunito',sans-serif] mt-0.5">
              {brandStats.nous} <span className="text-xs text-[#8C7065] font-normal">mẫu</span>
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-4.5 border border-[#FDE199] shadow-2xs flex items-center gap-3 notranslate" translate="no">
          <div className="w-11 h-11 rounded-2xl bg-[#FFF8E6] text-[#B87B00] flex items-center justify-center shrink-0 shadow-2xs font-black text-xs font-mono">
            LAP
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-[#8C7065]">Hãng LA POMME</p>
            <p className="text-xl font-black text-[#B87B00] font-['Nunito',sans-serif] mt-0.5">
              {brandStats.lapomme} <span className="text-xs text-[#8C7065] font-normal">mẫu</span>
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-4.5 border border-[#E7DBFC] shadow-2xs flex items-center gap-3 notranslate" translate="no">
          <div className="w-11 h-11 rounded-2xl bg-[#F6F1FE] text-[#8050D9] flex items-center justify-center shrink-0 shadow-2xs font-black text-xs font-mono">
            MON
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-[#8C7065]">Hãng MONONA</p>
            <p className="text-xl font-black text-[#8050D9] font-['Nunito',sans-serif] mt-0.5">
              {brandStats.monona} <span className="text-xs text-[#8C7065] font-normal">mẫu</span>
            </p>
          </div>
        </div>
      </div>

      {/* Filter, Search & View Controls */}
      <div className="bg-white rounded-3xl p-5 border border-[#FDE2E4] shadow-2xs space-y-4">
        {/* Search bar & Sort */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-8 relative">
            <Search className="w-4 h-4 text-[#8C7065] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Tìm theo tên đồ bé, mã ngắn (MN-001...), mã TikTok ID (58102720478), chất liệu..."
              className="w-full bg-[#FFF9F6] focus:bg-white text-xs text-[#3D271D] pl-10 pr-9 py-2.5 rounded-2xl border border-[#FDE2E4] focus:outline-hidden focus:border-[#FF5B65] focus:ring-2 focus:ring-[#FF5B65]/15 font-medium"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setCurrentPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8C7065] hover:text-[#3D271D] cursor-pointer"
              >
                ×
              </button>
            )}
          </div>

          <div className="sm:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full bg-[#FFF9F6] text-xs font-bold text-[#3D271D] px-3 py-2.5 rounded-2xl border border-[#FDE2E4] focus:outline-hidden focus:border-[#FF5B65]"
            >
              <option value="default">Sắp xếp: Mặc định</option>
              <option value="price-asc">Giá: Thấp đến cao</option>
              <option value="price-desc">Giá: Cao đến thấp</option>
              <option value="name">Tên sản phẩm: A-Z</option>
            </select>
          </div>

          <div className="sm:col-span-2 flex items-center justify-end gap-1.5 bg-[#FFF9F6] p-1 rounded-2xl border border-[#FDE2E4]">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-[#FF5B65] shadow-xs'
                  : 'text-[#8C7065] hover:text-[#3D271D]'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              Lưới
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-[#FF5B65] shadow-xs'
                  : 'text-[#8C7065] hover:text-[#3D271D]'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              Bảng
            </button>
          </div>
        </div>

        {/* Brand Filter Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#FFF0F1]">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none notranslate" translate="no">
            <span className="text-[11px] font-bold text-[#8C7065] mr-1 shrink-0">Hãng:</span>
            {[
              { id: 'all', label: `Tất cả (${brandStats.total})` },
              { id: 'NOUS', label: `NOUS (${brandStats.nous})` },
              { id: 'LA POMME', label: `LA POMME (${brandStats.lapomme})` },
              { id: 'MONONA', label: `MONONA (${brandStats.monona})` },
              ...(brandStats.moniu > 0 ? [{ id: 'Moniu', label: `Moniu (${brandStats.moniu})` }] : []),
            ].map((b) => (
              <button
                key={b.id}
                translate="no"
                onClick={() => {
                  setBrandFilter(b.id);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer notranslate ${
                  brandFilter === b.id
                    ? 'bg-[#FF5B65] text-white shadow-xs'
                    : 'bg-[#FFF9F6] text-[#8C7065] hover:bg-[#FFF0F1] hover:text-[#FF5B65] border border-[#FDE2E4]'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-[11px] font-bold text-[#8C7065] shrink-0">Lọc danh mục:</span>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-[#FFF9F6] text-xs font-bold text-[#3D271D] px-3 py-1.5 rounded-xl border border-[#FDE2E4] focus:outline-hidden focus:border-[#FF5B65]"
            >
              <option value="all">Tất cả phân loại ({products.length} SP)</option>
              <option value="Bộ quần áo bé">Bộ quần áo bé ({categoryStats['Bộ quần áo bé'] || 0})</option>
              <option value="Bodysuit & Đồ liền">Bodysuit & Đồ liền ({categoryStats['Bodysuit & Đồ liền'] || 0})</option>
              <option value="Áo & Áo khoác">Áo & Áo khoác ({categoryStats['Áo & Áo khoác'] || 0})</option>
              <option value="Nón & Mũ bé">Nón & Mũ bé ({categoryStats['Nón & Mũ bé'] || 0})</option>
              <option value="Yếm cho bé">Yếm cho bé ({categoryStats['Yếm cho bé'] || 0})</option>
              <option value="Bao tay & Bao chân">Bao tay & Bao chân ({categoryStats['Bao tay & Bao chân'] || 0})</option>
              <option value="Chăn gối & Đệm ngủ">Chăn gối & Đệm ngủ ({categoryStats['Chăn gối & Đệm ngủ'] || 0})</option>
              <option value="Váy đầm bé gái">Váy đầm bé gái ({categoryStats['Váy đầm bé gái'] || 0})</option>
              <option value="Quần yếm & Set yếm">Quần yếm & Set yếm ({categoryStats['Quần yếm & Set yếm'] || 0})</option>
              <option value="Phụ kiện & Khác">Phụ kiện & Khác ({categoryStats['Phụ kiện & Khác'] || 0})</option>
              <option value="Quà tặng kèm">Quà tặng kèm ({categoryStats['Quà tặng kèm'] || 0})</option>
            </select>
          </div>
        </div>

        {/* Quick Category Filter Pills */}
        <div className="pt-2 border-t border-[#FFF0F1] flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] font-bold text-[#8C7065] mr-1 shrink-0">Phân loại:</span>
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'Bộ quần áo bé', label: `Bộ quần áo (${categoryStats['Bộ quần áo bé'] || 0})` },
            { id: 'Bodysuit & Đồ liền', label: `Bodysuit (${categoryStats['Bodysuit & Đồ liền'] || 0})` },
            { id: 'Áo & Áo khoác', label: `Áo khoác (${categoryStats['Áo & Áo khoác'] || 0})` },
            { id: 'Nón & Mũ bé', label: `Nón / Mũ (${categoryStats['Nón & Mũ bé'] || 0})` },
            { id: 'Yếm cho bé', label: `Yếm (${categoryStats['Yếm cho bé'] || 0})` },
            { id: 'Bao tay & Bao chân', label: `Bao tay/chân (${categoryStats['Bao tay & Bao chân'] || 0})` },
            { id: 'Chăn gối & Đệm ngủ', label: `Chăn gối (${categoryStats['Chăn gối & Đệm ngủ'] || 0})` },
            { id: 'Váy đầm bé gái', label: `Váy đầm (${categoryStats['Váy đầm bé gái'] || 0})` },
            { id: 'Quần yếm & Set yếm', label: `Quần yếm (${categoryStats['Quần yếm & Set yếm'] || 0})` },
            { id: 'Phụ kiện & Khác', label: `Phụ kiện (${categoryStats['Phụ kiện & Khác'] || 0})` },
            { id: 'Quà tặng kèm', label: `Quà tặng (${categoryStats['Quà tặng kèm'] || 0})` },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setCategoryFilter(cat.id);
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                categoryFilter === cat.id
                  ? 'bg-[#3D271D] text-white shadow-xs'
                  : 'bg-[#FFF9F6] text-[#8C7065] hover:bg-[#FFF0F1] hover:text-[#3D271D] border border-[#FDE2E4]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Product Content: Grid or Table */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 border border-[#FDE2E4] shadow-2xs text-center text-[#8C7065]">
          <Package className="w-12 h-12 mx-auto text-[#FF5B65]/40 mb-3" />
          <h3 className="text-sm font-bold text-[#3D271D]">Không tìm thấy sản phẩm nào trong kho</h3>
          <p className="text-xs text-[#8C7065] mt-1">
            Hãy thử tìm bằng từ khóa khác hoặc bấm nút "Tất cả" để xóa bộ lọc.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setBrandFilter('all');
              setCategoryFilter('all');
            }}
            className="mt-4 px-4 py-2 bg-[#FFF0F1] hover:bg-[#FDE2E4] text-[#FF5B65] rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Làm mới bộ lọc
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {paginatedProducts.map((prod) => (
            <div
              key={prod.code}
              className="bg-white rounded-3xl p-4 border border-[#FDE2E4] shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group relative"
            >
              <div>
                {/* Image & Brand badge overlay */}
                <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-[#FFF0F1] border border-[#FDE2E4] mb-3">
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 flex items-center gap-1">
                    <span className="font-mono font-black text-[10px] text-white bg-[#FF5B65] px-2 py-0.5 rounded-lg shadow-xs">
                      {prod.code}
                    </span>
                    {prod.brand && (
                      <span
                        translate="no"
                        className="font-extrabold text-[9px] text-[#238774] bg-white/95 px-2 py-0.5 rounded-lg shadow-xs backdrop-blur-xs notranslate"
                      >
                        {prod.brand}
                      </span>
                    )}
                  </div>

                  <span className="absolute bottom-2 right-2 text-[10px] font-bold text-[#3D271D] bg-white/90 px-2 py-0.5 rounded-lg shadow-xs backdrop-blur-xs">
                    {prod.category}
                  </span>
                </div>

                {/* TikTok ID */}
                {prod.tiktokId && (
                  <div className="flex items-center justify-between text-[10px] text-[#8C7065] mb-1 font-mono">
                    <span>TikTok ID: {prod.tiktokId}</span>
                    <button
                      onClick={() => handleCopy(prod.tiktokId)}
                      className="hover:text-[#FF5B65] transition-colors p-0.5"
                      title="Sao chép ID"
                    >
                      {copiedId === prod.tiktokId ? (
                        <Check className="w-3 h-3 text-[#238774]" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                )}

                {/* Name */}
                <h3
                  onClick={() => setSelectedProduct(prod)}
                  className="font-bold text-xs text-[#3D271D] line-clamp-2 hover:text-[#FF5B65] transition-colors cursor-pointer leading-snug"
                  title={prod.name}
                >
                  {prod.name}
                </h3>

                {/* Variants pills */}
                {prod.variants.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2.5">
                    {prod.variants.slice(0, 3).map((v) => (
                      <span
                        key={v}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#FFF9F6] text-[#8C7065] border border-[#FDE2E4]"
                      >
                        {v}
                      </span>
                    ))}
                    {prod.variants.length > 3 && (
                      <span className="text-[10px] font-semibold px-1 text-[#8C7065]">
                        +{prod.variants.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom: Price & Quick Order */}
              <div className="mt-4 pt-3 border-t border-[#FFF0F1] flex items-center justify-between">
                <div>
                  <span className="text-sm font-black text-[#FF5B65] font-['Nunito',sans-serif]">
                    {prod.price === 0 ? 'Quà tặng kèm (0đ)' : formatCurrency(prod.price)}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setSelectedProduct(prod)}
                    className="p-1.5 text-[#8C7065] hover:text-[#FF5B65] hover:bg-[#FFF0F1] rounded-xl transition-colors cursor-pointer"
                    title="Xem chi tiết mô tả"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleCreateOrderWithProduct(prod)}
                    className="text-xs font-bold px-3 py-1.5 bg-[#FF5B65] hover:bg-[#E84A54] text-white rounded-xl transition-all shadow-xs flex items-center gap-1 cursor-pointer font-['Nunito',sans-serif]"
                  >
                    <Plus className="w-3 h-3" />
                    Chốt đơn
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-3xl border border-[#FDE2E4] shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead>
                <tr className="bg-[#FFF9F6] text-[#8C7065] border-b border-[#FDE2E4] font-bold">
                  <th className="py-3.5 px-4">Mã SP Moniu</th>
                  <th className="py-3.5 px-3">TikTok Shop ID</th>
                  <th className="py-3.5 px-3">Sản phẩm đồ em bé</th>
                  <th className="py-3.5 px-3 text-center">Hãng</th>
                  <th className="py-3.5 px-3 text-center">Danh mục</th>
                  <th className="py-3.5 px-3 text-right">Đơn giá</th>
                  <th className="py-3.5 px-3">Các size/biến thể</th>
                  <th className="py-3.5 px-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FFF0F1]">
                {paginatedProducts.map((prod) => (
                  <tr
                    key={prod.code}
                    className="hover:bg-[#FFF9F6] transition-colors cursor-pointer group"
                    onClick={() => setSelectedProduct(prod)}
                  >
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-black text-[#FF5B65] bg-[#FFF0F1] px-2.5 py-1 rounded-xl border border-[#FCD2D6]">
                        {prod.code}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-mono text-[#8C7065] text-[11px]">
                      {prod.tiktokId || '-'}
                    </td>
                    <td className="py-3.5 px-3 max-w-xs">
                      <div className="flex items-center gap-3">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-9 h-9 rounded-xl object-cover border border-[#FDE2E4] shrink-0 bg-[#FFF0F1]"
                        />
                        <span className="font-bold text-[#3D271D] truncate group-hover:text-[#FF5B65] transition-colors">
                          {prod.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span
                        translate="no"
                        className="inline-block text-[10px] font-black px-2 py-0.5 rounded-md bg-[#EBF9F6] text-[#238774] border border-[#B8ECE1] notranslate"
                      >
                        {prod.brand || 'Moniu'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center text-[#8C7065] font-semibold text-[11px]">
                      {prod.category}
                    </td>
                    <td className="py-3.5 px-3 text-right font-black text-[#FF5B65]">
                      {prod.price === 0 ? 'Quà tặng' : formatCurrency(prod.price)}
                    </td>
                    <td className="py-3.5 px-3 max-w-[200px] truncate text-[11px] text-[#8C7065]">
                      {prod.variants.join(', ')}
                    </td>
                    <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleCreateOrderWithProduct(prod)}
                        className="text-xs font-bold px-3 py-1.5 bg-[#FFF0F1] hover:bg-[#FF5B65] text-[#FF5B65] hover:text-white rounded-xl transition-all cursor-pointer"
                      >
                        Chốt đơn
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Bar */}
      <div className="p-4 bg-white rounded-3xl border border-[#FDE2E4] shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#8C7065]">
        <div>
          Hiển thị <span className="font-bold text-[#3D271D]">{paginatedProducts.length}</span> trong tổng số{' '}
          <span className="font-bold text-[#3D271D]">{filteredProducts.length}</span> sản phẩm thực tế
        </div>

        <div className="flex items-center gap-1.5">
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

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-[#3D271D]/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="relative bg-white rounded-3xl shadow-2xl border border-[#FDE2E4] w-full max-w-2xl overflow-hidden transition-all animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4.5 border-b border-[#FFF0F1] flex items-center justify-between bg-[#FFF9F6]">
              <div className="flex items-center gap-2.5">
                <span className="font-mono font-black text-xs text-[#FF5B65] bg-[#FFF0F1] px-2.5 py-1 rounded-xl border border-[#FCD2D6]">
                  {selectedProduct.code}
                </span>
                <span
                  translate="no"
                  className="font-bold text-xs px-2.5 py-1 rounded-xl bg-[#EBF9F6] text-[#238774] border border-[#B8ECE1] notranslate"
                >
                  {selectedProduct.brand || 'Moniu'}
                </span>
                <span className="text-xs text-[#8C7065] font-semibold">
                  {selectedProduct.category}
                </span>
              </div>

              <button
                onClick={() => setSelectedProduct(null)}
                className="p-1.5 text-[#8C7065] hover:text-[#FF5B65] hover:bg-[#FFF0F1] rounded-2xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              <div className="flex flex-col sm:flex-row gap-5 items-start">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="w-32 h-32 rounded-2xl object-cover border border-[#FDE2E4] shrink-0 bg-[#FFF0F1]"
                />

                <div className="space-y-2">
                  <h2 className="text-base font-extrabold text-[#3D271D] leading-snug font-['Nunito',sans-serif]">
                    {selectedProduct.name}
                  </h2>

                  {selectedProduct.tiktokId && (
                    <div className="flex items-center gap-2 text-xs text-[#8C7065] font-mono">
                      <span>Mã TikTok Shop: <strong>{selectedProduct.tiktokId}</strong></span>
                      <button
                        onClick={() => handleCopy(selectedProduct.tiktokId)}
                        className="text-[#FF5B65] hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        {copiedId === selectedProduct.tiktokId ? 'Đã sao chép' : 'Sao chép'}
                      </button>
                    </div>
                  )}

                  <div className="pt-1">
                    <span className="text-xl font-black text-[#FF5B65] font-['Nunito',sans-serif]">
                      {selectedProduct.price === 0 ? 'Quà tặng kèm đơn (0đ)' : formatCurrency(selectedProduct.price)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sizes & Variants */}
              <div className="p-4 bg-[#FFF9F6] rounded-2xl border border-[#FDE2E4] space-y-2">
                <h4 className="text-xs font-bold text-[#8C7065] uppercase tracking-wider">
                  Phân loại / Size có sẵn:
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedProduct.variants.map((v) => (
                    <span
                      key={v}
                      className="text-xs font-bold px-3 py-1 rounded-xl bg-white text-[#3D271D] border border-[#FDE2E4] shadow-2xs"
                    >
                      {v}
                    </span>
                  ))}
                </div>
              </div>

              {/* Full Description from TikTok Shop */}
              {selectedProduct.description && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-[#8C7065] uppercase tracking-wider">
                    Mô tả chi tiết từ TikTok Shop:
                  </h4>
                  <div className="p-4 bg-white rounded-2xl border border-[#FDE2E4] text-xs text-[#3D271D] leading-relaxed whitespace-pre-line font-medium max-h-48 overflow-y-auto">
                    {selectedProduct.description}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-[#FFF0F1] bg-[#FFF9F6] flex items-center justify-between">
              <button
                onClick={() => setSelectedProduct(null)}
                className="px-4 py-2 bg-white text-xs font-bold text-[#8C7065] hover:bg-[#FFF0F1] border border-[#FDE2E4] rounded-2xl transition-colors cursor-pointer"
              >
                Đóng
              </button>

              <button
                onClick={() => {
                  setSelectedProduct(null);
                  handleCreateOrderWithProduct(selectedProduct);
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-[#FF5B65] to-[#F14652] hover:from-[#E84A54] hover:to-[#DE3D49] text-white text-xs font-black rounded-2xl shadow-md shadow-[#FF5B65]/25 transition-all flex items-center gap-1.5 cursor-pointer font-['Nunito',sans-serif]"
              >
                <Plus className="w-4 h-4" />
                Lên đơn ngay với sản phẩm này
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Chọn Size khi bấm Chốt đơn */}
      <SizeSelectionModal
        isOpen={!!productForSizeModal}
        onClose={() => setProductForSizeModal(null)}
        product={productForSizeModal}
        onConfirm={handleConfirmSizeSelection}
        confirmText="Xác nhận Chốt Size & Chuyển Đến Tạo Đơn"
      />
    </div>
  );
};
