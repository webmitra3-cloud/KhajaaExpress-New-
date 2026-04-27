import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import api from "../../api/client";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import StatCard from "../../components/common/StatCard";
import StatusBadge from "../../components/common/StatusBadge";
import { formatCurrency, formatDate } from "../../utils/formatters";

const AdminDashboardPage = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data } = await api.get("/admin/dashboard");
        setDashboard(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const stats = dashboard?.stats || {};

  const statCards = useMemo(
    () => [
      { label: "Total Users", value: stats.totalUsers || 0, helper: "Registered customer accounts" },
      { label: "Total Vendors", value: stats.totalVendors || 0, helper: "Restaurants on the platform" },
      { label: "Pending Approvals", value: stats.totalPendingVendors || 0, helper: "Vendors waiting for review" },
      { label: "Food Ordered", value: stats.totalFoodOrdered || 0, helper: "All ordered menu quantities" },
      { label: "Food Posted", value: stats.totalFoodPosted || 0, helper: "Menu items created by vendors" },
      { label: "Restaurants", value: stats.totalRestaurants || 0, helper: "Active restaurant records" },
    ],
    [stats]
  );

  if (loading) {
    return <LoadingSpinner label="Loading admin dashboard..." />;
  }

  return (
    <div className="dashboard-page-stack">
      <section className="card dashboard-hero-card">
        <div className="dashboard-hero-main">
          <div>
            <span className="section-kicker">Platform Overview</span>
            <h1>Admin Dashboard</h1>
            <p className="muted-text">Monitor users, vendors, foods, orders, and approvals from one clean control panel.</p>
          </div>

          <div className="dashboard-hero-pills">
            <div className="dashboard-hero-pill">
              <strong>{stats.totalPendingVendors || 0}</strong>
              <span>Pending approvals</span>
            </div>
            <div className="dashboard-hero-pill">
              <strong>{stats.totalRestaurants || 0}</strong>
              <span>Restaurants live</span>
            </div>
            <div className="dashboard-hero-pill">
              <strong>{stats.totalUsers || 0}</strong>
              <span>Customer accounts</span>
            </div>
          </div>
        </div>
      </section>

      <div className="stats-grid dashboard-stat-grid">
        {statCards.map((item) => (
          <StatCard key={item.label} label={item.label} value={item.value} helper={item.helper} />
        ))}
      </div>

      <div className="dashboard-section-grid">
        <section className="card dashboard-panel-card">
          <div className="dashboard-panel-header">
            <div>
              <h3>Recent Orders</h3>
              <p className="muted-text">Latest customer orders across the platform.</p>
            </div>
            <Link to="/admin/orders" className="button button-ghost inline-button dashboard-link-button">
              View All Orders
            </Link>
          </div>

          {dashboard?.recentOrders?.length ? (
            <div className="dashboard-feed-list">
              {dashboard.recentOrders.map((order) => (
                <div key={order._id} className="dashboard-feed-item">
                  <div className="dashboard-feed-main">
                    <strong>{order.user?.name || "User"}</strong>
                    <p className="muted-text">{order.vendor?.restaurantName || "Restaurant"}</p>
                    <small>{formatDate(order.createdAt)}</small>
                  </div>
                  <div className="dashboard-feed-side">
                    <strong>{formatCurrency(order.totalPrice || 0)}</strong>
                    <StatusBadge value={order.status} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="dashboard-empty-state">
              <strong>No recent orders</strong>
              <p className="muted-text">Orders will appear here as users start placing them.</p>
            </div>
          )}
        </section>

        <section className="card dashboard-panel-card">
          <div className="dashboard-panel-header">
            <div>
              <h3>Pending Vendors</h3>
              <p className="muted-text">New restaurant accounts waiting for admin review.</p>
            </div>
            <Link to="/admin/approvals" className="button button-ghost inline-button dashboard-link-button">
              Review Approvals
            </Link>
          </div>

          {dashboard?.recentPendingVendors?.length ? (
            <div className="dashboard-feed-list">
              {dashboard.recentPendingVendors.map((vendor) => (
                <div key={vendor._id} className="dashboard-feed-item dashboard-feed-item-soft">
                  <div className="dashboard-feed-main">
                    <strong>{vendor.restaurantName}</strong>
                    <p className="muted-text">{vendor.user?.name || "Vendor"}</p>
                    <small>{vendor.user?.email || "No email provided"}</small>
                    <small>{vendor.address || "Address not added yet"}</small>
                  </div>
                  <div className="dashboard-feed-side dashboard-feed-side-start">
                    <StatusBadge value={vendor.approvalStatus} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="dashboard-empty-state">
              <strong>No pending vendors</strong>
              <p className="muted-text">All vendor registrations are already reviewed.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default AdminDashboardPage;