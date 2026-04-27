import { useEffect, useState } from "react";
import api from "../../api/client";
import EmptyState from "../../components/common/EmptyState";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import StatusBadge from "../../components/common/StatusBadge";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { getNextStatuses } from "../../utils/routeHelpers";

const VendorOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get("/vendor/orders");
      setOrders(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusUpdate = async (orderId, status) => {
    try {
      await api.patch(`/vendor/orders/${orderId}/status`, { status });
      fetchOrders();
    } catch (error) {
      alert(error.response?.data?.message || "Unable to update order status");
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading vendor orders..." />;
  }

  if (!orders.length) {
    return <EmptyState title="No active orders yet" description="Paid Khalti orders and cash on delivery orders will appear here." />;
  }

  return (
    <div className="list-stack">
      <div className="page-header">
        <div>
          <h1>Vendor Orders</h1>
          <p className="muted-text">Move each order through the delivery steps in order and keep payment visibility clear.</p>
        </div>
      </div>

      {orders.map((order) => {
        const nextStatuses = getNextStatuses(order.status);

        return (
          <div className="card order-card" key={order._id}>
            <div className="order-row">
              <div>
                <h3>{order.user?.name}</h3>
                <p className="muted-text">Order #{order.orderNumber}</p>
                <p className="muted-text">{formatDate(order.createdAt)}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <StatusBadge value={order.status} />
                <StatusBadge value={order.paymentStatus} />
              </div>
            </div>

            <div className="grid gap-3 rounded-[24px] border border-slate-200 bg-cream-50/80 p-4 md:grid-cols-3">
              <div>
                <small className="muted-text">Payment Method</small>
                <strong className="mt-1 block text-charcoal-900">{order.paymentMethod}</strong>
              </div>
              <div>
                <small className="muted-text">Order Total</small>
                <strong className="mt-1 block text-charcoal-900">{formatCurrency(order.totalPrice)}</strong>
              </div>
              <div>
                <small className="muted-text">Delivery Address</small>
                <strong className="mt-1 block text-charcoal-900">{order.deliveryAddress}</strong>
              </div>
            </div>

            <div className="list-stack" style={{ marginTop: "1rem" }}>
              {order.items.map((item) => (
                <div key={`${order._id}-${item.food}`} className="summary-row">
                  <span>
                    {item.name} x {item.quantity}
                  </span>
                  <strong>{formatCurrency(item.price * item.quantity)}</strong>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-[24px] border border-slate-200 bg-white p-4">
              <strong className="text-charcoal-900">Tracking history</strong>
              <div className="mt-3 grid gap-3">
                {order.statusHistory?.map((step, index) => (
                  <div key={`${order._id}-${step.status}-${index}`} className="flex items-start justify-between gap-3 rounded-2xl border border-slate-100 px-4 py-3">
                    <div>
                      <strong className="text-sm text-charcoal-900">{step.status}</strong>
                      {step.note ? <p className="mt-1 text-sm text-slate-500">{step.note}</p> : null}
                    </div>
                    <small className="text-slate-400">{formatDate(step.changedAt)}</small>
                  </div>
                ))}
              </div>
            </div>

            {order.review ? (
              <div className="mt-4 rounded-[24px] border border-emerald-100 bg-emerald-50/70 p-4 text-sm text-emerald-800">
                Customer review received: {order.review.rating}/5
                {order.review.comment ? ` - ${order.review.comment}` : ""}
              </div>
            ) : null}

            {nextStatuses.length ? (
              <div className="action-row" style={{ marginTop: "1rem" }}>
                {nextStatuses.map((status) => (
                  <button key={status} type="button" className="button button-ghost" onClick={() => handleStatusUpdate(order._id, status)}>
                    {status}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

export default VendorOrdersPage;
