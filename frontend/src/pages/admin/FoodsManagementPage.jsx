import { useEffect, useState } from "react";
import api from "../../api/client";
import DataTable from "../../components/common/DataTable";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { formatCurrency } from "../../utils/formatters";

const FoodsManagementPage = () => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const { data } = await api.get("/admin/foods");
        setFoods(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchFoods();
  }, []);

  if (loading) {
    return <LoadingSpinner label="Loading foods..." />;
  }

  return (
    <div className="list-stack">
      <div className="page-header">
        <div>
          <h1>Foods Management</h1>
          <p className="muted-text">View all food items and which vendor created them.</p>
        </div>
      </div>

      <DataTable
        columns={[
          { header: "Food", render: (row) => row.name },
          { header: "Category", render: (row) => row.category?.name || "-" },
          { header: "Vendor", render: (row) => row.vendor?.restaurantName || "-" },
          { header: "Owner", render: (row) => row.vendor?.user?.name || "-" },
          { header: "Price", render: (row) => formatCurrency(row.price) },
        ]}
        rows={foods}
      />
    </div>
  );
};

export default FoodsManagementPage;
