import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  Order,
  OrderItem,
  OrderStatus,
  ShippingStatus,
  StoreSettings,
  ProductCatalogItem,
  ActiveTab,
  Customer,
} from '../types';
import { INITIAL_ORDERS, INITIAL_PRODUCTS, INITIAL_SETTINGS } from '../data/initialData';
import { generateOrderCode } from '../utils/formatters';
import { supabase } from '../lib/supabase';
import { deriveCustomersFromOrders } from '../utils/customerUtils';

interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message?: string;
  code?: string;
}

export interface CustomerOrderPrefill {
  customerName?: string;
  customerPhone?: string;
  shippingAddress?: string;
}

interface ShopContextType {
  orders: Order[];
  customers: Customer[];
  products: ProductCatalogItem[];
  settings: StoreSettings;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedOrderForModal: Order | null;
  setSelectedOrderForModal: (order: Order | null) => void;
  pendingOrderItem: OrderItem | null;
  setPendingOrderItem: (item: OrderItem | null) => void;
  initialOrderPrefill: CustomerOrderPrefill | null;
  setInitialOrderPrefill: (prefill: CustomerOrderPrefill | null) => void;
  toasts: ToastMessage[];
  showToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  addOrder: (newOrderData: Partial<Order>) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  updateShippingStatus: (orderId: string, status: ShippingStatus) => Promise<void>;
  updateOrder: (orderId: string, updatedFields: Partial<Order>) => Promise<void>;
  mergeIntoOrder: (targetOrderId: string, additionalItems: OrderItem[], additionalDiscount?: number) => Promise<void>;
  completePendingOrder: (orderId: string, customerPhone: string, shippingAddress: string, customerName?: string) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  updateSettings: (newSettings: StoreSettings) => void;
  resetToDefault: () => Promise<void>;
  generateUniqueCode: () => string;
  refreshDataFromSupabase: () => Promise<void>;
  isSupabaseConnected: boolean;
  isSyncing: boolean;
}


const ShopContext = createContext<ShopContextType | undefined>(undefined);

const ORDERS_KEY = 'moniu_clean_orders_v4';
const SETTINGS_KEY = 'moniu_clean_settings_v4';

function mapDbOrderToOrder(row: any): Order {
  const dateObj = new Date(row.created_at || Date.now());
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  const timeString = `${hours}:${minutes}`;
  const dateFormatted = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')} ${timeString}`;

  return {
    id: row.id,
    code: row.code,
    customerName: row.customer_name || 'Khách vãng lai',
    customerPhone: row.customer_phone || '',
    shippingAddress: row.shipping_address || 'Chưa cập nhật địa chỉ',
    items: Array.isArray(row.items) ? row.items : [],
    subtotal: Number(row.subtotal) || 0,
    shippingFee: Number(row.shipping_fee) || 0,
    discount: Number(row.discount) || 0,
    totalAmount: Number(row.total_amount) || 0,
    paymentMethod: row.payment_method || 'COD',
    isPaid: Boolean(row.is_paid),
    status: row.status || 'Chờ xử lý',
    carrier: row.carrier || 'GHN',
    trackingCode: row.tracking_code || '',
    shippingStatus: row.shipping_status || 'Chờ lấy hàng',
    orderNote: row.order_note || '',
    isPendingInfo:
      row.status === 'Chờ thông tin' ||
      !row.customer_phone ||
      row.customer_phone === 'Chưa có SĐT' ||
      row.shipping_address === 'Chờ khách gửi địa chỉ inbox',
    holdExpiresAt: row.hold_expires_at || undefined,
    createdAt: dateFormatted,
    timeString,
    updatedAt: row.updated_at || dateFormatted,
  };
}


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
  const [pendingOrderItem, setPendingOrderItem] = useState<OrderItem | null>(null);
  const [initialOrderPrefill, setInitialOrderPrefill] = useState<CustomerOrderPrefill | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [supabaseCustomers, setSupabaseCustomers] = useState<Customer[]>([]);

  // Toast Notification handler
  const showToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fetch orders and customers from Supabase
  const refreshDataFromSupabase = useCallback(async () => {
    setIsSyncing(true);
    try {
      const { data: dbOrders, error: orderErr } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (orderErr) {
        console.warn('Supabase orders fetch error (using offline mode):', orderErr.message);
        setIsSupabaseConnected(false);
      } else if (dbOrders && dbOrders.length > 0) {
        setIsSupabaseConnected(true);
        const mappedOrders = dbOrders.map(mapDbOrderToOrder);
        setOrders(mappedOrders);
        localStorage.setItem(ORDERS_KEY, JSON.stringify(mappedOrders));
      }

      // Fetch customers table
      const { data: dbCusts, error: custErr } = await supabase
        .from('customers')
        .select('*')
        .order('total_spent', { ascending: false });

      if (!custErr && dbCusts) {
        const mapped: Customer[] = dbCusts.map((c) => ({
          id: c.id,
          phone: c.phone,
          name: c.name,
          address: c.address || '',
          rank: c.rank || 'Mầm Nhỏ',
          totalOrders: Number(c.total_orders) || 0,
          totalSpent: Number(c.total_spent) || 0,
          notes: c.notes || '',
          createdAt: c.created_at || '',
          updatedAt: c.updated_at || '',
        }));
        setSupabaseCustomers(mapped);
      }
    } catch (err) {
      console.warn('Network or Supabase connection issue:', err);
      setIsSupabaseConnected(false);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Initial load from Supabase and real-time subscription
  useEffect(() => {
    refreshDataFromSupabase();

    // Listen for Realtime inserts/updates on orders
    const channel = supabase
      .channel('moniu-realtime-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          console.log('Realtime Order Event received:', payload);
          refreshDataFromSupabase();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'customers' },
        (payload) => {
          console.log('Realtime Customer Event received:', payload);
          refreshDataFromSupabase();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refreshDataFromSupabase]);

  // Save to localStorage whenever orders change
  useEffect(() => {
    try {
      localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    } catch (e) {
      console.error('Failed to save orders to localStorage', e);
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings to localStorage', e);
    }
  }, [settings]);

  // Derived Customers: merges Supabase DB records with orders-derived records
  const customers = useMemo(() => {
    const derived = deriveCustomersFromOrders(orders);
    if (!supabaseCustomers.length) return derived;

    // Merge: prioritize Supabase if exists, else derived
    const map = new Map<string, Customer>();
    derived.forEach((c) => map.set(c.phone, c));
    supabaseCustomers.forEach((sc) => {
      const existing = map.get(sc.phone);
      if (existing) {
        map.set(sc.phone, {
          ...existing,
          rank: sc.rank || existing.rank,
          totalOrders: Math.max(existing.totalOrders, sc.totalOrders),
          totalSpent: Math.max(existing.totalSpent, sc.totalSpent),
          address: sc.address || existing.address,
          name: sc.name || existing.name,
        });
      } else {
        map.set(sc.phone, sc);
      }
    });

    return Array.from(map.values()).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [orders, supabaseCustomers]);

  // 100% Dynamic products catalog stats derived from actual orders
  const dynamicProducts = useMemo(() => {
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

  const generateUniqueCode = useCallback((): string => {
    const existingCodes = orders.map((o) => o.code);
    return generateOrderCode(existingCodes, settings.orderPrefix, settings.orderRandomLength);
  }, [orders, settings.orderPrefix, settings.orderRandomLength]);

  const addOrder = async (orderData: Partial<Order>): Promise<Order> => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const timeString = `${hours}:${minutes}`;
    const dateFormatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${timeString}`;

    const code = orderData.code || generateUniqueCode();
    const id = `ord-${Date.now()}`;

    const isPending = orderData.status === 'Chờ thông tin' || Boolean(orderData.isPendingInfo);
    const holdExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const newOrder: Order = {
      id,
      code,
      customerName: orderData.customerName?.trim() || 'Khách xem live',
      customerPhone: orderData.customerPhone?.trim() || '',
      shippingAddress:
        orderData.shippingAddress?.trim() ||
        (isPending ? 'Chờ khách gửi địa chỉ inbox' : 'Chưa cập nhật địa chỉ'),
      items: orderData.items && orderData.items.length > 0 ? orderData.items : [],
      subtotal: orderData.subtotal || 0,
      shippingFee: orderData.shippingFee ?? (isPending ? 0 : settings.defaultShippingFee),
      discount: orderData.discount || 0,
      totalAmount: orderData.totalAmount || 0,
      paymentMethod: orderData.paymentMethod || 'COD',
      isPaid: orderData.paymentMethod === 'Chuyển khoản',
      status: isPending ? 'Chờ thông tin' : (orderData.status || 'Chờ xử lý'),
      carrier: orderData.carrier || settings.defaultCarrier,
      trackingCode: isPending
        ? ''
        : (orderData.trackingCode ||
          `${orderData.carrier || settings.defaultCarrier}${Math.floor(10000000 + Math.random() * 90000000)}`),
      shippingStatus: isPending ? 'Chờ lấy hàng' : (orderData.shippingStatus || 'Chờ lấy hàng'),
      orderNote: orderData.orderNote || '',
      isPendingInfo: isPending,
      holdExpiresAt,
      createdAt: dateFormatted,
      timeString,
      updatedAt: dateFormatted,
    };

    // Optimistic UI update
    setOrders((prev) => [newOrder, ...prev]);

    // Push to Supabase in background
    try {
      const { error } = await supabase.from('orders').insert({
        code: newOrder.code,
        customer_name: newOrder.customerName,
        customer_phone: newOrder.customerPhone,
        shipping_address: newOrder.shippingAddress,
        order_note: newOrder.orderNote,
        items: newOrder.items,
        subtotal: newOrder.subtotal,
        shipping_fee: newOrder.shippingFee,
        discount: newOrder.discount,
        total_amount: newOrder.totalAmount,
        payment_method: newOrder.paymentMethod,
        is_paid: newOrder.isPaid,
        status: newOrder.status,
        carrier: newOrder.carrier,
        tracking_code: newOrder.trackingCode,
        shipping_status: newOrder.shippingStatus,
      });

      if (error) {
        console.warn('Supabase background insert warning:', error.message);
      } else {
        // Refresh customer rankings from Supabase trigger
        setTimeout(() => {
          refreshDataFromSupabase();
        }, 600);
      }
    } catch (err) {
      console.warn('Failed to push order to Supabase:', err);
    }

    if (isPending) {
      showToast({
        type: 'info',
        title: '⏳ Đã lưu đơn giữ đồ Live!',
        message: `Đơn chờ #${newOrder.code} của mẹ ${newOrder.customerName} đang giữ tạm ${newOrder.items.length} món.`,
        code: newOrder.code,
      });
    } else {
      showToast({
        type: 'success',
        title: 'Tạo đơn thành công!',
        message: `Đơn hàng #${newOrder.code} của ${newOrder.customerName} đã được lưu vào hệ thống đám mây.`,
        code: newOrder.code,
      });
    }

    return newOrder;
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    let orderCode = '';
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId || ord.code === orderId) {
          orderCode = ord.code;
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

    // Sync to Supabase
    try {
      await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .or(`id.eq.${orderId},code.eq.${orderId}`);
    } catch (e) {
      console.warn('Supabase update status failed:', e);
    }

    showToast({
      type: 'info',
      title: 'Cập nhật trạng thái',
      message: `Đã đổi trạng thái đơn ${orderCode || orderId} thành: ${status}`,
    });
  };

  const updateShippingStatus = async (orderId: string, status: ShippingStatus) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId || ord.code === orderId) {
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

    // Sync to Supabase
    try {
      await supabase
        .from('orders')
        .update({ shipping_status: status, updated_at: new Date().toISOString() })
        .or(`id.eq.${orderId},code.eq.${orderId}`);
    } catch (e) {
      console.warn('Supabase update shipping failed:', e);
    }

    showToast({
      type: 'info',
      title: 'Cập nhật vận chuyển',
      message: `Đã cập nhật vận đơn: ${status}`,
    });
  };

  const updateOrder = async (orderId: string, updatedFields: Partial<Order>) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId || ord.code === orderId) {
          return {
            ...ord,
            ...updatedFields,
            updatedAt: new Date().toISOString(),
          };
        }
        return ord;
      })
    );

    try {
      const dbPayload: any = {};
      if (updatedFields.customerName !== undefined) dbPayload.customer_name = updatedFields.customerName;
      if (updatedFields.customerPhone !== undefined) dbPayload.customer_phone = updatedFields.customerPhone;
      if (updatedFields.shippingAddress !== undefined) dbPayload.shipping_address = updatedFields.shippingAddress;
      if (updatedFields.status !== undefined) dbPayload.status = updatedFields.status;
      if (updatedFields.items !== undefined) dbPayload.items = updatedFields.items;
      if (updatedFields.subtotal !== undefined) dbPayload.subtotal = updatedFields.subtotal;
      if (updatedFields.discount !== undefined) dbPayload.discount = updatedFields.discount;
      if (updatedFields.totalAmount !== undefined) dbPayload.total_amount = updatedFields.totalAmount;
      if (updatedFields.orderNote !== undefined) dbPayload.order_note = updatedFields.orderNote;
      dbPayload.updated_at = new Date().toISOString();

      await supabase
        .from('orders')
        .update(dbPayload)
        .or(`id.eq.${orderId},code.eq.${orderId}`);
    } catch (e) {
      console.warn('Supabase updateOrder failed:', e);
    }
  };

  const mergeIntoOrder = async (
    targetOrderId: string,
    additionalItems: OrderItem[],
    additionalDiscount = 0
  ) => {
    const target = orders.find((o) => o.id === targetOrderId || o.code === targetOrderId);
    if (!target) return;

    const mergedItems = [...target.items, ...additionalItems];
    const newSubtotal = mergedItems.reduce(
      (sum, item) => sum + (Number(item.unitPrice) || 0) * (Number(item.quantity) || 1),
      0
    );
    const newDiscount = (Number(target.discount) || 0) + additionalDiscount;
    const newTotal = Math.max(0, newSubtotal + (Number(target.shippingFee) || 0) - newDiscount);

    await updateOrder(targetOrderId, {
      items: mergedItems,
      subtotal: newSubtotal,
      discount: newDiscount,
      totalAmount: newTotal,
    });

    showToast({
      type: 'success',
      title: 'Đã gộp đơn live thành công!',
      message: `Đã thêm ${additionalItems.length} món vào giỏ chờ #${target.code} của ${target.customerName}.`,
      code: target.code,
    });
  };

  const completePendingOrder = async (
    orderId: string,
    customerPhone: string,
    shippingAddress: string,
    customerName?: string
  ) => {
    const target = orders.find((o) => o.id === orderId || o.code === orderId);
    if (!target) return;

    const finalName = customerName?.trim() || target.customerName;
    const finalPhone = customerPhone.trim();
    const finalAddress = shippingAddress.trim();

    await updateOrder(orderId, {
      customerName: finalName,
      customerPhone: finalPhone,
      shippingAddress: finalAddress,
      status: 'Chờ xử lý',
      shippingStatus: 'Chờ lấy hàng',
      isPendingInfo: false,
    });

    setTimeout(() => {
      refreshDataFromSupabase();
    }, 600);

    showToast({
      type: 'success',
      title: 'Hoàn tất đơn hàng!',
      message: `Đơn #${target.code} của mẹ ${finalName} đã chuyển sang chờ đóng gói.`,
      code: target.code,
    });
  };


  const deleteOrder = async (orderId: string) => {
    const target = orders.find((o) => o.id === orderId || o.code === orderId);
    setOrders((prev) => prev.filter((o) => o.id !== orderId && o.code !== orderId));
    if (selectedOrderForModal?.id === orderId || selectedOrderForModal?.code === orderId) {
      setSelectedOrderForModal(null);
    }

    try {
      await supabase
        .from('orders')
        .delete()
        .or(`id.eq.${orderId},code.eq.${orderId}`);
      setTimeout(() => {
        refreshDataFromSupabase();
      }, 500);
    } catch (e) {
      console.warn('Supabase delete failed:', e);
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

  const resetToDefault = async () => {
    setOrders([]);
    setSettings(INITIAL_SETTINGS);
    setSupabaseCustomers([]);

    try {
      await supabase.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('customers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    } catch (e) {
      console.warn('Failed to clear Supabase table:', e);
    }

    showToast({
      type: 'info',
      title: 'Đã làm mới sạch sẽ',
      message: 'Toàn bộ dữ liệu đơn hàng và khách hàng đã được xóa sạch về 0.',
    });
  };

  return (
    <ShopContext.Provider
      value={{
        orders,
        customers,
        products: dynamicProducts,
        settings,
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        selectedOrderForModal,
        setSelectedOrderForModal,
        pendingOrderItem,
        setPendingOrderItem,
        initialOrderPrefill,
        setInitialOrderPrefill,
        toasts,
        showToast,
        removeToast,
        addOrder,
        updateOrderStatus,
        updateShippingStatus,
        updateOrder,
        mergeIntoOrder,
        completePendingOrder,
        deleteOrder,
        updateSettings,
        resetToDefault,
        generateUniqueCode,
        refreshDataFromSupabase,
        isSupabaseConnected,
        isSyncing,
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

