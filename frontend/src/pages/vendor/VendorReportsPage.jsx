import { Download } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import api from "../../api/client";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import RatingStars from "../../components/common/RatingStars";
import StatCard from "../../components/common/StatCard";
import { formatCurrency, formatDate } from "../../utils/formatters";

const rangeOptions = [
  { label: "7 days", value: "7" },
  { label: "30 days", value: "30" },
  { label: "90 days", value: "90" },
  { label: "All time", value: "all" },
];

const VendorReportsPage = () => {
  const [range, setRange] = useState("30");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async (nextRange) => {
    setLoading(true);

    try {
      const { data } = await api.get(`/vendor/reports?days=${encodeURIComponent(nextRange)}`);
      setReport(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(range);
  }, [range]);

  const summaryCards = useMemo(
    () => [
      { label: "Orders", value: report?.summary?.totalOrders || 0, helper: "Orders in selected range" },
      { label: "Delivered", value: report?.summary?.deliveredOrders || 0, helper: "Completed deliveries" },
      { label: "Revenue", value: formatCurrency(report?.summary?.totalRevenue || 0), helper: "Non-cancelled sales" },
      { label: "Avg Order", value: formatCurrency(report?.summary?.averageOrderValue || 0), helper: "Average order value" },
      { label: "Reviews", value: report?.summary?.reviewCount || 0, helper: "Customer reviews received" },
    ],
    [report]
  );

  const handleDownload = () => {
    if (!report) {
      return;
    }

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `vendor-report-${range}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <LoadingSpinner label="Generating vendor report..." />;
  }

  if (!report) {
    return <div className="card form-card">Unable to load the vendor report.</div>;
  }

  return (
    <div className="list-stack">
      <div className="page-header">
        <div>
          <h1>Report Generator</h1>
          <p className="muted-text">Review sales, order flow, payment mix, and customer feedback in one place.</p>
        </div>
        <div className="action-row">
          <select value={range} onChange={(event) => setRange(event.target.value)}>
            {rangeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button type="button" className="button button-secondary" onClick={handleDownload}>
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      <div className="stats-grid">
        {summaryCards.map((item) => (
          <StatCard key={item.label} label={item.label} value={item.value} helper={item.helper} />
        ))}
      </div>

      <section className="card form-card">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3>Rating Snapshot</h3>
            <p className="muted-text">Average customer sentiment during the selected range.</p>
          </div>
          <RatingStars value={report?.summary?.averageRating || 0} reviewCount={report?.summary?.reviewCount || 0} showValue size="md" />
        </div>
      </section>

      <div className="grid-2">
        <section className="card form-card">
          <h3>Status Breakdown</h3>
          <div className="list-stack" style={{ marginTop: "1rem" }}>
            {report?.statusBreakdown?.map((item) => (
              <div key={item._id} className="summary-row">
                <span>{item._id}</span>
                <strong>{item.count}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="card form-card">
          <h3>Payment Breakdown</h3>
          <div className="list-stack" style={{ marginTop: "1rem" }}>
            {report?.paymentBreakdown?.map((item) => (
              <div key={item._id} className="summary-row">
                <span>{item._id}</span>
                <strong>{item.count}</strong>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid-2">
        <section className="card form-card">
          <h3>Top Foods</h3>
          <div className="list-stack" style={{ marginTop: "1rem" }}>
            {report?.topFoods?.map((item) => (
              <div key={item._id} className="message-box">
                <strong>{item._id}</strong>
                <p className="muted-text">Qty sold: {item.totalQuantity}</p>
                <p className="muted-text">Sales: {formatCurrency(item.totalSales)}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="card form-card">
          <h3>Recent Reviews</h3>
          <div className="list-stack" style={{ marginTop: "1rem" }}>
            {report?.recentReviews?.length ? (
              report.recentReviews.map((review) => (
                <div key={review._id} className="message-box">
                  <div className="flex items-center justify-between gap-3">
                    <strong>{review.user?.name || "Customer"}</strong>
                    <RatingStars value={review.rating} size="sm" />
                  </div>
                  <p className="muted-text">{review.comment || "No written comment provided."}</p>
                  <small>{formatDate(review.createdAt)}</small>
                </div>
              ))
            ) : (
              <p className="muted-text">No reviews in this range.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default VendorReportsPage;
