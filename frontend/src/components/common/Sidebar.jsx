import { Link, NavLink, useNavigate } from "react-router-dom";
import { dashboardMenus } from "../../data/dashboardMenus";
import { useAuth } from "../../hooks/useAuth";

const roleContent = {
  user: {
    caption: "My Panel",
    title: "Customer Area",
    description: "Orders, messages, and profile",
  },
  vendor: {
    caption: "Control Panel",
    title: "Vendor Area",
    description: "Menu, orders, and chat",
  },
  admin: {
    caption: "Control Panel",
    title: "Admin Area",
    description: "Users, vendors, and reports",
  },
};

const Sidebar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const items = dashboardMenus[user?.role] || [];
  const content = roleContent[user?.role] || roleContent.user;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("")
    : "K";

  return (
    <aside className={`sidebar card sidebar-role-${user?.role || "user"}`}>
      <div className="sidebar-topline">
        <p className="sidebar-caption">{content.caption}</p>
        <Link to="/" className="sidebar-brand">
          {content.title}
        </Link>
        <small className="muted-text sidebar-description">{content.description}</small>
      </div>

      <div className="sidebar-user-card">
        <div className="sidebar-avatar">{initials}</div>
        <div>
          <h3>{user?.name}</h3>
          <p className="muted-text">{user?.email}</p>
        </div>
        <span className="subtle-pill">{user?.role}</span>
      </div>

      <nav className="sidebar-links">
        {items.map((item) => (
          <NavLink key={item.path} to={item.path} end={item.path === "/" || item.path === "/vendor" || item.path === "/admin"}>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <button type="button" className="button button-secondary full-width sidebar-logout" onClick={handleLogout}>
        Logout
      </button>
    </aside>
  );
};

export default Sidebar;
