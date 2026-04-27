import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import api from "../../api/client";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import StatCard from "../../components/common/StatCard";
import StatusBadge from "../../components/common/StatusBadge";
import { formatCurrency, formatDate } from "../../utils/formatters";

const VendorDashboardPage = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data } = await api.get("/vendor/dashboard");
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
      { label: "Menu Items", value: stats.foodCount || 0, helper: "Current menu items listed" },
      { label: "Total Orders", value: stats.totalOrders || 0, helper: "Orders received so far" },
      { label: "Pending Orders", value: stats.pendingOrders || 0, helper: "Orders in progress now" },
      { label: "Delivered Orders", value: stats.deliveredOrders || 0, helper: "Orders completed successfully" },
      { label: "Revenue", value: formatCurrency(stats.totalRevenue || 0), helper: "Total non-cancelled sales" },
      { label: "Rating", value: Number(stats.averageRating || 0).toFixed(1), helper: `${stats.reviewCount || 0} customer reviews` },
    ],
    [stats]
  );

  const quickActions = [
    { label: "Manage Offers", description: "Create homepage-ready promotions for customers.", path: "/vendor/offers" },
    { label: "Manage Menu", description: "Add, edit, or hide menu items.", path: "/vendor/menu" },
    { label: "View Orders", description: "Update order status step by step.", path: "/vendor/orders" },
    { label: "Reports", description: "Generate sales and review reports.", path: "/vendor/reports" },
    { label: "Open Chat", description: "Reply to customers in real time.", path: "/vendor/chat" },
    { label: "Restaurant Profile", description: "Update restaurant details and images.", path: "/vendor/profile" },
  ];

  if (loading) {
    return <LoadingSpinner label="Loading vendor dashboard..." />;
  }

  return (
    <div className="dashboard-page-stack">
      <section className="card dashboard-hero-card dashboard-hero-card-vendor">
        <div className="dashboard-hero-main">
          <div>
            <span className="section-kicker">Restaurant Overview</span>
            <h1>Vendor Dashboard</h1>
            <p className="muted-text">Manage menu items, orders, delivery progress, and customer communication from one simple panel.</p>
          </div>

          <div className="dashboard-hero-pills">
            <div className="dashboard-hero-pill">
              <strong>{stats.pendingOrders || 0}</strong>
              <span>Orders in progress</span>
            </div>
            <div className="dashboard-hero-pill">
              <strong>{formatCurrency(stats.totalRevenue || 0)}</strong>
              <span>Total revenue</span>
            </div>
            <div className="dashboard-hero-pill">
              <strong>{stats.foodCount || 0}</strong>
              <span>Menu items</span>
            </div>
          </div>
        </div>
      </section>

      <div className="stats-grid dashboard-stat-grid dashboard-stat-grid-vendor">
        {statCards.map((item) => (
          <StatCard key={item.label} label={item.label} value={item.value} helper={item.helper} />
        ))}
      </div>

      <div className="dashboard-section-grid dashboard-section-grid-vendor">
        <section className="card dashboard-panel-card">
          <div className="dashboard-panel-header">
            <div>
              <h3>Recent Orders</h3>
              <p className="muted-text">Latest incoming orders for your restaurant.</p>
            </div>
            <Link to="/vendor/orders" className="button button-ghost inline-button dashboard-link-button">
              Open Orders
            </Link>
          </div>

          {dashboard?.recentOrders?.length ? (
            <div className="dashboard-feed-list">
              {dashboard.recentOrders.map((order) => (
                <div key={order._id} className="dashboard-feed-item">
                  <div className="dashboard-feed-main">
                    <strong>{order.user?.name || "Customer"}</strong>
                    <p className="muted-text">Order #{order.orderNumber}</p>
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
              <p className="muted-text">New orders will show here as soon as customers place them.</p>
            </div>
          )}
        </section>

        <section className="card dashboard-panel-card">
          <div className="dashboard-panel-header">
            <div>
              <h3>Quick Actions</h3>
              <p className="muted-text">Most common tasks for day-to-day vendor activity.</p>
            </div>
          </div>

          <div className="dashboard-action-grid">
            {quickActions.map((action) => (
              <Link key={action.path} to={action.path} className="dashboard-action-card">
                <strong>{action.label}</strong>
                <p>{action.description}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default VendorDashboardPage;
