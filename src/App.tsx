import React, { useState } from 'react';
import { ShopProvider, useShop } from './context/ShopContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ToastContainer } from './components/ToastContainer';
import { OrderDetailModal } from './components/OrderDetailModal';
import { OverviewPage } from './pages/OverviewPage';
import { CreateOrderPage } from './pages/CreateOrderPage';
import { OrderHistoryPage } from './pages/OrderHistoryPage';
import { ShippingPage } from './pages/ShippingPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';

const AppContent: React.FC = () => {
  const { activeTab, selectedOrderForModal, setSelectedOrderForModal } = useShop();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FFF8F6] text-[#3D271D] flex">
      {/* Left Navigation Sidebar */}
      <Sidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 transition-all">
        {/* Top Header Bar */}
        <Header onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />

        {/* Dynamic Page Views */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-(--breakpoint-2xl) w-full mx-auto">
          {activeTab === 'overview' && <OverviewPage />}
          {activeTab === 'create-order' && <CreateOrderPage />}
          {activeTab === 'orders' && <OrderHistoryPage />}
          {activeTab === 'shipping' && <ShippingPage />}
          {activeTab === 'reports' && <ReportsPage />}
          {activeTab === 'settings' && <SettingsPage />}
        </main>
      </div>

      {/* Global Order Detail Modal */}
      {selectedOrderForModal && (
        <OrderDetailModal
          order={selectedOrderForModal}
          onClose={() => setSelectedOrderForModal(null)}
        />
      )}

      {/* Floating Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export function App() {
  return (
    <ShopProvider>
      <AppContent />
    </ShopProvider>
  );
}

export default App;
