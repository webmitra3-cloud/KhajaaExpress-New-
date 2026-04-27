import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import DashboardLayout from "./components/layouts/DashboardLayout";
import MainLayout from "./components/layouts/MainLayout";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminProfilePage from "./pages/admin/AdminProfilePage";
import FoodsManagementPage from "./pages/admin/FoodsManagementPage";
import HomepageContentPage from "./pages/admin/HomepageContentPage";
import OrdersManagementPage from "./pages/admin/OrdersManagementPage";
import ReportsPage from "./pages/admin/ReportsPage";
import UsersManagementPage from "./pages/admin/UsersManagementPage";
import VendorApprovalPage from "./pages/admin/VendorApprovalPage";
import VendorsManagementPage from "./pages/admin/VendorsManagementPage";
import ActivationPage from "./pages/ActivationPage";
import CategoriesPage from "./pages/CategoriesPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import KhaltiCallbackPage from "./pages/KhaltiCallbackPage";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import NotificationsPage from "./pages/NotificationsPage";
import OffersPage from "./pages/OffersPage";
import RegisterPage from "./pages/RegisterPage";
import RestaurantDetailsPage from "./pages/RestaurantDetailsPage";
import RestaurantsPage from "./pages/RestaurantsPage";
import UserChatPage from "./pages/UserChatPage";
import UserOrdersPage from "./pages/UserOrdersPage";
import UserProfilePage from "./pages/UserProfilePage";
import ManageCategoriesPage from "./pages/vendor/ManageCategoriesPage";
import ManageMenuPage from "./pages/vendor/ManageMenuPage";
import ManageOffersPage from "./pages/vendor/ManageOffersPage";
import VendorChatPage from "./pages/vendor/VendorChatPage";
import VendorDashboardPage from "./pages/vendor/VendorDashboardPage";
import VendorOrdersPage from "./pages/vendor/VendorOrdersPage";
import VendorProfilePage from "./pages/vendor/VendorProfilePage";
import VendorReportsPage from "./pages/vendor/VendorReportsPage";

const App = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="/login" element={<LoginPage portalTitle="User Login" />} />
        <Route path="/vendor/login" element={<LoginPage portalTitle="Vendor Login" />} />
        <Route path="/admin/login" element={<LoginPage portalTitle="Admin Login" />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/activate-account" element={<ActivationPage />} />
        <Route path="/payment/khalti/callback" element={<KhaltiCallbackPage />} />
        <Route path="/restaurants" element={<RestaurantsPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/offers" element={<OffersPage />} />
        <Route path="/restaurants/:id" element={<RestaurantDetailsPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute roles={["user"]}>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route
        path="/user"
        element={
          <ProtectedRoute roles={["user"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="orders" replace />} />
        <Route path="orders" element={<UserOrdersPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="chat" element={<UserChatPage />} />
        <Route path="profile" element={<UserProfilePage />} />
      </Route>

      <Route
        path="/vendor"
        element={
          <ProtectedRoute roles={["vendor"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<VendorDashboardPage />} />
        <Route path="categories" element={<ManageCategoriesPage />} />
        <Route path="offers" element={<ManageOffersPage />} />
        <Route path="menu" element={<ManageMenuPage />} />
        <Route path="orders" element={<VendorOrdersPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="reports" element={<VendorReportsPage />} />
        <Route path="chat" element={<VendorChatPage />} />
        <Route path="profile" element={<VendorProfilePage />} />
      </Route>

      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={["admin"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="users" element={<UsersManagementPage />} />
        <Route path="vendors" element={<VendorsManagementPage />} />
        <Route path="approvals" element={<VendorApprovalPage />} />
        <Route path="foods" element={<FoodsManagementPage />} />
        <Route path="orders" element={<OrdersManagementPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="homepage" element={<HomepageContentPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="profile" element={<AdminProfilePage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default App;
