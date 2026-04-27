import { useEffect, useState } from "react";
import api from "../../api/client";
import DataTable from "../../components/common/DataTable";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import StatusBadge from "../../components/common/StatusBadge";
import { formatCurrency, formatDate } from "../../utils/formatters";

const OrdersManagementPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get("/admin/orders");
        setOrders(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return <LoadingSpinner label="Loading orders..." />;
  }

  return (
    <div className="list-stack">
      <div className="page-header">
        <div>
          <h1>Orders Management</h1>
          <p className="muted-text">Review all orders across the platform.</p>
        </div>
      </div>

      <DataTable
        columns={[
          { header: "Order", render: (row) => row.orderNumber },
          { header: "User", render: (row) => row.user?.name || "-" },
          { header: "Vendor", render: (row) => row.vendor?.restaurantName || "-" },
          { header: "Status", render: (row) => <StatusBadge value={row.status} /> },
          { header: "Total", render: (row) => formatCurrency(row.totalPrice) },
          { header: "Date", render: (row) => formatDate(row.createdAt) },
        ]}
        rows={orders}
      />
    </div>
  );
};

export default OrdersManagementPage;
