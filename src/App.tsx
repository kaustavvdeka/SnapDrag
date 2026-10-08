import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext.js';
import { LocationProvider } from './context/LocationContext.js';
import BrutalNavbar from './components/common/BrutalNavbar.js';
import BrutalFooter from './components/common/BrutalFooter.js';
import ShoppingAssistant from './components/assistant/ShoppingAssistant.js';

// Pages
import LandingPage from './pages/LandingPage.js';
import ExplorePage from './pages/ExplorePage.js';
import ProductDetailPage from './pages/ProductDetailPage.js';
import ShopsPage from './pages/ShopsPage.js';
import ShopDetailPage from './pages/ShopDetailPage.js';
import MapDiscoveryPage from './pages/MapDiscoveryPage.js';
import FavoritesPage from './pages/FavoritesPage.js';
import CustomerReservationsPage from './pages/CustomerReservationsPage.js';
import LoginPage from './pages/LoginPage.js';
import RegisterPage from './pages/RegisterPage.js';
import ProfilePage from './pages/ProfilePage.js';
import GoogleCallbackPage from './pages/GoogleCallbackPage.js';

// Shopkeeper & Admin Dashboard Pages
import ShopkeeperDashboardPage from './pages/dashboard/ShopkeeperDashboardPage.js';
import ShopkeeperProductsPage from './pages/dashboard/ShopkeeperProductsPage.js';
import ShopkeeperAddProductPage from './pages/dashboard/ShopkeeperAddProductPage.js';
import ShopkeeperEditProductPage from './pages/dashboard/ShopkeeperEditProductPage.js';
import ShopkeeperReservationsPage from './pages/dashboard/ShopkeeperReservationsPage.js';
import ShopkeeperLocationPage from './pages/dashboard/ShopkeeperLocationPage.js';
import ShopkeeperAnalyticsPage from './pages/dashboard/ShopkeeperAnalyticsPage.js';
import AdminPage from './pages/admin/AdminPage.js';
import AdminUsersPage from './pages/admin/AdminUsersPage.js';
import AdminShopsPage from './pages/admin/AdminShopsPage.js';
import AdminProductsPage from './pages/admin/AdminProductsPage.js';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage.js';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 60000,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LocationProvider>
          <BrowserRouter>
            <div className="flex flex-col min-h-screen">
              <BrutalNavbar />
              <main className="flex-1">
                <Routes>
                  {/* Public Discovery Routes */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/explore" element={<ExplorePage />} />
                  <Route path="/products/:id" element={<ProductDetailPage />} />
                  <Route path="/shops" element={<ShopsPage />} />
                  <Route path="/shops/:id" element={<ShopDetailPage />} />
                  <Route path="/map" element={<MapDiscoveryPage />} />

                  {/* Customer Private Routes */}
                  <Route path="/favorites" element={<FavoritesPage />} />
                  <Route path="/reservations" element={<CustomerReservationsPage />} />
                  <Route path="/profile" element={<ProfilePage />} />

                  {/* Auth Routes */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />

                  {/* Shopkeeper Dashboard Routes */}
                  <Route path="/dashboard" element={<ShopkeeperDashboardPage />} />
                  <Route path="/dashboard/products" element={<ShopkeeperProductsPage />} />
                  <Route path="/dashboard/products/new" element={<ShopkeeperAddProductPage />} />
                  <Route path="/dashboard/products/:id/edit" element={<ShopkeeperEditProductPage />} />
                  <Route path="/dashboard/reservations" element={<ShopkeeperReservationsPage />} />
                  <Route path="/dashboard/shop" element={<ShopkeeperLocationPage />} />
                  <Route path="/dashboard/location" element={<ShopkeeperLocationPage />} />
                  <Route path="/dashboard/analytics" element={<ShopkeeperAnalyticsPage />} />

                  {/* Admin Routes */}
                  <Route path="/admin" element={<AdminPage />} />
                  <Route path="/admin/users" element={<AdminUsersPage />} />
                  <Route path="/admin/shops" element={<AdminShopsPage />} />
                  <Route path="/admin/products" element={<AdminProductsPage />} />
                  <Route path="/admin/categories" element={<AdminCategoriesPage />} />
                </Routes>
              </main>
              <BrutalFooter />
              <ShoppingAssistant />
            </div>
          </BrowserRouter>
        </LocationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
