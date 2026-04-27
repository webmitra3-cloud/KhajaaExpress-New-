import { useEffect, useState } from "react";
import api from "../../api/client";
import DataTable from "../../components/common/DataTable";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const VendorApprovalPage = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPendingVendors = async () => {
    try {
      const { data } = await api.get("/admin/vendors/pending");
      setVendors(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingVendors();
  }, []);

  const handleApprove = async (vendorId) => {
    await api.patch(`/admin/vendors/${vendorId}/approve`);
    fetchPendingVendors();
  };

  const handleReject = async (vendorId) => {
    const reason = window.prompt("Optional rejection reason", "Rejected by admin") || "Rejected by admin";
    await api.patch(`/admin/vendors/${vendorId}/reject`, { reason });
    fetchPendingVendors();
  };

  if (loading) {
    return <LoadingSpinner label="Loading pending approvals..." />;
  }

  return (
    <div className="list-stack">
      <div className="page-header">
        <div>
          <h1>Vendor Approvals</h1>
          <p className="muted-text">Approve or reject vendors before they are allowed to log in.</p>
        </div>
      </div>

      <DataTable
        columns={[
          { header: "Restaurant", render: (row) => row.restaurantName },
          { header: "Owner", render: (row) => row.user?.name },
          { header: "Email", render: (row) => row.user?.email },
          { header: "Phone", render: (row) => row.phone },
          {
            header: "Actions",
            render: (row) => (
              <div className="action-row">
                <button type="button" className="button" onClick={() => handleApprove(row._id)}>
                  Approve
                </button>
                <button type="button" className="button button-secondary" onClick={() => handleReject(row._id)}>
                  Reject
                </button>
              </div>
            ),
          },
        ]}
        rows={vendors}
      />
    </div>
  );
};

export default VendorApprovalPage;
