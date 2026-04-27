import { useEffect, useState } from "react";
import api from "../../api/client";
import DataTable from "../../components/common/DataTable";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import StatusBadge from "../../components/common/StatusBadge";

const VendorsManagementPage = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const { data } = await api.get("/admin/vendors");
        setVendors(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();
  }, []);

  if (loading) {
    return <LoadingSpinner label="Loading vendors..." />;
  }

  return (
    <div className="list-stack">
      <div className="page-header">
        <div>
          <h1>Vendors Management</h1>
          <p className="muted-text">See all restaurant vendors and their current approval state.</p>
        </div>
      </div>

      <DataTable
        columns={[
          { header: "Restaurant", render: (row) => row.restaurantName },
          { header: "Owner", render: (row) => row.user?.name },
          { header: "Email", render: (row) => row.user?.email },
          { header: "Approval", render: (row) => <StatusBadge value={row.approvalStatus} /> },
        ]}
        rows={vendors}
      />
    </div>
  );
};

export default VendorsManagementPage;
