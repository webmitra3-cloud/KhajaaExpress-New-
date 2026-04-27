import { useEffect, useState } from "react";
import api from "../../api/client";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import StatCard from "../../components/common/StatCard";
import { formatCurrency } from "../../utils/formatters";

const ReportsPage = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const { data } = await api.get("/admin/reports");
        setReport(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, []);

  if (loading) {
    return <LoadingSpinner label="Loading reports..." />;
  }

  return (
    <div className="list-stack">
      <div className="page-header">
        <div>
          <h1>Reports</h1>
          <p className="muted-text">Basic project-ready reporting summary for viva and presentation.</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard label="Total Orders" value={report?.summary.totalOrders || 0} />
        <StatCard label="Delivered Orders" value={report?.summary.deliveredOrders || 0} />
        <StatCard label="Cancelled Orders" value={report?.summary.cancelledOrders || 0} />
      </div>

      <div className="grid-2">
        <div className="card form-card">
          <h3>Status Breakdown</h3>
          <div className="list-stack" style={{ marginTop: "1rem" }}>
            {report?.statusBreakdown?.map((item) => (
              <div key={item._id} className="summary-row">
                <span>{item._id}</span>
                <strong>{item.count}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="card form-card">
          <h3>Payment Breakdown</h3>
          <div className="list-stack" style={{ marginTop: "1rem" }}>
            {report?.paymentBreakdown?.map((item) => (
              <div key={item._id} className="summary-row">
                <span>{item._id}</span>
                <strong>{item.count}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card form-card">
          <h3>Sales by Vendor</h3>
          <div className="list-stack" style={{ marginTop: "1rem" }}>
            {report?.salesByVendor?.map((item) => (
              <div key={item.vendorId} className="message-box">
                <strong>{item.restaurantName}</strong>
                <p className="muted-text">Orders: {item.orderCount}</p>
                <p className="muted-text">Sales: {formatCurrency(item.totalSales)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card form-card">
          <h3>Top Foods</h3>
          <div className="list-stack" style={{ marginTop: "1rem" }}>
            {report?.topFoods?.map((item) => (
              <div key={item._id} className="summary-row">
                <span>{item._id}</span>
                <strong>{item.totalQuantity}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
