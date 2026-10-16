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

const ORDERS_KEY = 'moniu_orders_v2';
const SETTINGS_KEY = 'moniu_settings_v2';
const PRODUCTS_KEY = 'moniu_products_v2';

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

  const [products, setProducts] = useState<ProductCatalogItem[]>(() => {
    try {
      const saved = localStorage.getItem(PRODUCTS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load products from localStorage', e);
    }
    return INITIAL_PRODUCTS;
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

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  }, [products]);

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

    // Update product sold count
    if (newOrder.items && newOrder.items.length > 0) {
      setProducts((prev) =>
        prev.map((prod) => {
          const matchItem = newOrder.items.find((item) => item.productCode === prod.code);
          if (matchItem) {
            return {
              ...prod,
              soldCount: prod.soldCount + matchItem.quantity,
              revenue: prod.revenue + matchItem.unitPrice * matchItem.quantity,
            };
          }
          return prod;
        })
      );
    }

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
    setOrders(INITIAL_ORDERS);
    setProducts(INITIAL_PRODUCTS);
    setSettings(INITIAL_SETTINGS);
    showToast({
      type: 'info',
      title: 'Đã khôi phục dữ liệu mẫu',
      message: 'Toàn bộ dữ liệu đã được đặt lại như ban đầu.',
    });
  };

  return (
    <ShopContext.Provider
      value={{
        orders,
        products,
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
