import { Bell, Menu, ShoppingCart, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";
import { useNotifications } from "../../hooks/useNotifications";
import { getDefaultRoute, getNotificationRoute } from "../../utils/routeHelpers";

const navLinkBase = "inline-flex items-center rounded-full px-4 py-2 text-sm font-medium transition";
const routeLinkClassName = ({ isActive }) =>
  `${navLinkBase} ${isActive ? "bg-saffron-500 text-charcoal-900" : "text-slate-600 hover:bg-white hover:text-charcoal-900"}`;
const hashLinkClassName = `${navLinkBase} text-slate-600 hover:bg-white hover:text-charcoal-900`;

const publicLinks = [
  { label: "Home", to: "/", type: "route", end: true },
  { label: "Restaurants", to: "/restaurants", type: "route" },
  { label: "Categories", to: "/categories", type: "route" },
  { label: "Offers", to: "/offers", type: "route" },
];

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const { unreadCount } = useNotifications();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.hash]);

  const initials = useMemo(() => {
    if (!user?.name) {
      return "K";
    }

    return user.name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
  }, [user?.name]);

  const primaryPath = user?.role === "user" ? "/user/profile" : getDefaultRoute(user?.role);
  const primaryLabel = user?.role === "user" ? "Profile" : "Dashboard";
  const notificationsPath = getNotificationRoute(user?.role);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-saffron-100/80 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 py-4">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-saffron-500 text-base font-semibold text-charcoal-900 shadow-sm">
              KE
            </span>
            <div>
              <p className="text-lg font-semibold tracking-tight text-charcoal-900">KhajaExpress</p>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Local food marketplace</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 rounded-full border border-saffron-100 bg-cream-50/80 p-1.5 md:flex">
            {publicLinks.map((item) =>
              item.type === "route" ? (
                <NavLink key={item.label} to={item.to} end={item.end} className={routeLinkClassName}>
                  {item.label}
                </NavLink>
              ) : (
                <Link key={item.label} to={item.to} className={hashLinkClassName}>
                  {item.label}
                </Link>
              )
            )}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <NavLink
              to="/cart"
              className={({ isActive }) =>
                `inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "border-saffron-300 bg-saffron-100 text-charcoal-900"
                    : "border-saffron-100 bg-white text-slate-600 hover:border-saffron-200 hover:text-charcoal-900"
                }`
              }
            >
              <ShoppingCart className="h-4 w-4" />
              Cart
              <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-saffron-500 px-1.5 py-0.5 text-xs font-semibold text-charcoal-900">
                {itemCount}
              </span>
            </NavLink>

            {isAuthenticated ? (
              <>
                <button
                  type="button"
                  onClick={() => navigate(notificationsPath)}
                  className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-saffron-100 bg-white text-slate-600 transition hover:border-saffron-200 hover:text-charcoal-900"
                  aria-label="Open notifications"
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount ? (
                    <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-charcoal-900 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                      {unreadCount}
                    </span>
                  ) : null}
                </button>
                <button
                  type="button"
                  onClick={() => navigate(primaryPath)}
                  className="inline-flex items-center gap-3 rounded-full border border-saffron-100 bg-white px-4 py-2 text-left transition hover:border-saffron-200"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-charcoal-900 text-sm font-semibold text-white">{initials}</span>
                  <span>
                    <span className="block text-sm font-semibold text-charcoal-900">{user?.name}</span>
                    <span className="block text-xs uppercase tracking-[0.18em] text-slate-400">{user?.role}</span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-saffron-200 hover:text-charcoal-900"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-saffron-200 hover:text-charcoal-900"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center rounded-full bg-charcoal-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-charcoal-800"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((value) => !value)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-saffron-100 bg-white text-charcoal-900 md:hidden"
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileOpen ? (
          <div className="pb-4 md:hidden">
            <div className="rounded-[28px] border border-saffron-100 bg-white p-4 shadow-card">
              <div className="grid gap-2">
                {publicLinks.map((item) =>
                  item.type === "route" ? (
                    <NavLink key={item.label} to={item.to} end={item.end} className={routeLinkClassName}>
                      {item.label}
                    </NavLink>
                  ) : (
                    <Link key={item.label} to={item.to} className={hashLinkClassName}>
                      {item.label}
                    </Link>
                  )
                )}
                <NavLink to="/cart" className={routeLinkClassName}>
                  <span className="inline-flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    Cart
                    <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-saffron-500 px-1.5 py-0.5 text-xs font-semibold text-charcoal-900">
                      {itemCount}
                    </span>
                  </span>
                </NavLink>
                {isAuthenticated ? (
                  <button
                    type="button"
                    onClick={() => navigate(notificationsPath)}
                    className="relative inline-flex items-center rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-charcoal-900"
                  >
                    Notifications
                    {unreadCount ? (
                      <span className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-charcoal-900 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                        {unreadCount}
                      </span>
                    ) : null}
                  </button>
                ) : null}
              </div>

              <div className="mt-4 grid gap-3 border-t border-saffron-100 pt-4">
                {isAuthenticated ? (
                  <>
                    <button
                      type="button"
                      onClick={() => navigate(primaryPath)}
                      className="inline-flex items-center justify-between rounded-2xl bg-cream-50 px-4 py-3 text-left"
                    >
                      <span>
                        <span className="block text-sm font-semibold text-charcoal-900">{user?.name}</span>
                        <span className="block text-xs uppercase tracking-[0.18em] text-slate-400">{primaryLabel}</span>
                      </span>
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-charcoal-900 text-sm font-semibold text-white">{initials}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600">
                      Login
                    </Link>
                    <Link to="/register" className="inline-flex items-center justify-center rounded-2xl bg-charcoal-900 px-4 py-3 text-sm font-semibold text-white">
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
};

export default Navbar;
