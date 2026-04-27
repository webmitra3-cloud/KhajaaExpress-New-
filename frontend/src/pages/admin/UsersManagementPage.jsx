import { useEffect, useState } from "react";
import api from "../../api/client";
import DataTable from "../../components/common/DataTable";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import StatusBadge from "../../components/common/StatusBadge";

const UsersManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await api.get("/admin/users");
        setUsers(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return <LoadingSpinner label="Loading users..." />;
  }

  return (
    <div className="list-stack">
      <div className="page-header">
        <div>
          <h1>Users Management</h1>
          <p className="muted-text">Review all platform accounts and their linked vendor status.</p>
        </div>
      </div>

      <DataTable
        columns={[
          { header: "Name", render: (row) => row.name },
          { header: "Email", render: (row) => row.email },
          { header: "Role", render: (row) => <StatusBadge value={row.role} /> },
          { header: "Phone", render: (row) => row.phone || "-" },
          {
            header: "Vendor Info",
            render: (row) => row.vendorInfo ? `${row.vendorInfo.restaurantName} (${row.vendorInfo.approvalStatus})` : "-",
          },
        ]}
        rows={users}
      />
    </div>
  );
};

export default UsersManagementPage;
