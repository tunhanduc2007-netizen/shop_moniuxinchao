import React, { createContext, useContext, useState, useEffect } from 'react';
import { Order, OrderStatus, ShippingStatus, StoreSettings, ProductCatalogItem, ActiveTab } from '../types';
import { INITIAL_ORDERS, INITIAL_PRODUCTS, INITIAL_SETTINGS } from '../data/initialData';
import { generateOrderCode } from '../utils/formatters';

interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message?: string;
  code?: string;
}

interface ShopContextType {
  orders: Order[];
  products: ProductCatalogItem[];
  settings: StoreSettings;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedOrderForModal: Order | null;
  setSelectedOrderForModal: (order: Order | null) => void;
  toasts: ToastMessage[];
  showToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  addOrder: (newOrderData: Partial<Order>) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  updateShippingStatus: (orderId: string, status: ShippingStatus) => void;
  deleteOrder: (orderId: string) => void;
  updateSettings: (newSettings: StoreSettings) => void;
  resetToDefault: () => void;
  generateUniqueCode: () => string;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

const ORDERS_KEY = 'moniu_clean_orders_v4';
const SETTINGS_KEY = 'moniu_clean_settings_v4';
const PRODUCTS_KEY = 'moniu_clean_products_v4';

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(ORDERS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load orders from localStorage', e);
    }
    return INITIAL_ORDERS;
  });

  const [settings, setSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load settings from localStorage', e);
    }
    return INITIAL_SETTINGS;
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderForModal, setSelectedOrderForModal] = useState<Order | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // 100% Dynamic products catalog stats derived from actual orders
  const dynamicProducts = React.useMemo(() => {
    const validOrders = orders.filter((o) => o.status !== 'Đã hủy');
    const totalRev = validOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    return INITIAL_PRODUCTS.map((prod) => {
      let soldCount = 0;
      let revenue = 0;

      validOrders.forEach((o) => {
        o.items.forEach((item) => {
          if (
            (item.productCode && item.productCode.trim().toUpperCase() === prod.code.toUpperCase()) ||
            (prod.tiktokId && item.productCode && item.productCode.trim() === prod.tiktokId) ||
            (item.productName && item.productName.toLowerCase() === prod.name.toLowerCase())
          ) {
            soldCount += Number(item.quantity) || 0;
            revenue += (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
          }
        });
      });

      const percentage = totalRev > 0 ? Math.round((revenue / totalRev) * 100) : 0;

      return {
        ...prod,
        soldCount,
        revenue,
        percentage,
      };
    });
  }, [orders]);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const showToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const generateUniqueCode = (): string => {
    const existingCodes = orders.map((o) => o.code);
    return generateOrderCode(existingCodes, settings.orderPrefix, settings.orderRandomLength);
  };

  const addOrder = (orderData: Partial<Order>): Order => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const timeString = `${hours}:${minutes}`;
    const dateFormatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${timeString}`;

    const code = orderData.code || generateUniqueCode();
    const id = `ord-${Date.now()}`;

    const newOrder: Order = {
      id,
      code,
      customerName: orderData.customerName?.trim() || 'Khách vãng lai',
      customerPhone: orderData.customerPhone?.trim() || '',
      shippingAddress: orderData.shippingAddress?.trim() || 'Chưa cập nhật địa chỉ',
      items: orderData.items && orderData.items.length > 0 ? orderData.items : [],
      subtotal: orderData.subtotal || 0,
      shippingFee: orderData.shippingFee ?? settings.defaultShippingFee,
      discount: orderData.discount || 0,
      totalAmount: orderData.totalAmount || 0,
      paymentMethod: orderData.paymentMethod || 'COD',
      isPaid: orderData.paymentMethod === 'Chuyển khoản',
      status: orderData.status || 'Chờ xử lý',
      carrier: orderData.carrier || settings.defaultCarrier,
      trackingCode: orderData.trackingCode || `${orderData.carrier || settings.defaultCarrier}${Math.floor(10000000 + Math.random() * 90000000)}`,
      shippingStatus: orderData.shippingStatus || 'Chờ lấy hàng',
      orderNote: orderData.orderNote || '',
      createdAt: dateFormatted,
      timeString,
      updatedAt: dateFormatted,
    };

    setOrders((prev) => [newOrder, ...prev]);

    showToast({
      type: 'success',
      title: 'Tạo đơn thành công!',
      message: `Đơn hàng #${newOrder.code} của ${newOrder.customerName} đã được lưu vào hệ thống.`,
      code: newOrder.code,
    });

    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          let shippingStatus = ord.shippingStatus;
          if (status === 'Đã giao') shippingStatus = 'Đã giao';
          else if (status === 'Đang giao') shippingStatus = 'Đang giao';
          else if (status === 'Đã hủy') shippingStatus = 'Chuyển hoàn';

          return {
            ...ord,
            status,
            shippingStatus,
            updatedAt: new Date().toISOString(),
          };
        }
        return ord;
      })
    );

    showToast({
      type: 'info',
      title: 'Cập nhật trạng thái',
      message: `Đã đổi trạng thái đơn thành: ${status}`,
    });
  };

  const updateShippingStatus = (orderId: string, status: ShippingStatus) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          let orderStatus = ord.status;
          if (status === 'Đã giao') orderStatus = 'Đã giao';
          else if (status === 'Đang giao' || status === 'Đang trung chuyển') orderStatus = 'Đang giao';
          else if (status === 'Chuyển hoàn') orderStatus = 'Đã hủy';

          return {
            ...ord,
            shippingStatus: status,
            status: orderStatus,
            updatedAt: new Date().toISOString(),
          };
        }
        return ord;
      })
    );

    showToast({
      type: 'info',
      title: 'Cập nhật vận chuyển',
      message: `Đã cập nhật vận đơn: ${status}`,
    });
  };

  const deleteOrder = (orderId: string) => {
    const target = orders.find((o) => o.id === orderId);
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    if (selectedOrderForModal?.id === orderId) {
      setSelectedOrderForModal(null);
    }
    showToast({
      type: 'warning',
      title: 'Đã xóa đơn hàng',
      message: `Đã xóa đơn #${target?.code || orderId}`,
    });
  };

  const updateSettings = (newSettings: StoreSettings) => {
    setSettings(newSettings);
    showToast({
      type: 'success',
      title: 'Cài đặt thành công',
      message: 'Các thay đổi cấu hình đã được lưu.',
    });
  };

  const resetToDefault = () => {
    setOrders([]);
    setSettings(INITIAL_SETTINGS);
    showToast({
      type: 'info',
      title: 'Đã làm mới sạch sẽ',
      message: 'Toàn bộ dữ liệu đơn hàng đã được xóa sạch về 0.',
    });
  };

  return (
    <ShopContext.Provider
      value={{
        orders,
        products: dynamicProducts,
        settings,
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        selectedOrderForModal,
        setSelectedOrderForModal,
        toasts,
        showToast,
        removeToast,
        addOrder,
        updateOrderStatus,
        updateShippingStatus,
        deleteOrder,
        updateSettings,
        resetToDefault,
        generateUniqueCode,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};
