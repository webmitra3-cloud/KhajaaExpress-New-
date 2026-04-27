import { Outlet } from "react-router-dom";
import Sidebar from "../common/Sidebar";
import { useAuth } from "../../hooks/useAuth";

const DashboardLayout = () => {
  const { user } = useAuth();
  const roleClass = user?.role ? `dashboard-shell-${user.role}` : "";

  return (
    <div className={`dashboard-page dashboard-shell ${roleClass}`.trim()}>
      <Sidebar />
      <section className="dashboard-content">
        <Outlet />
      </section>
    </div>
  );
};

export default DashboardLayout;