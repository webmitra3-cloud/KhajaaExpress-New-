import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getDefaultRoute } from "../utils/routeHelpers";

const portalConfigs = {
  user: {
    kicker: "User Login",
    description: "Sign in to browse restaurants, order food, and track your orders.",
    note: "Users must activate the email link before login.",
    allowRegister: true,
  },
  vendor: {
    kicker: "Vendor Login",
    description: "Sign in to manage your menu, orders, and customer messages.",
    note: "Vendor login works only after email activation and admin approval.",
    allowRegister: true,
  },
  admin: {
    kicker: "Admin Login",
    description: "Sign in to manage vendors, foods, orders, and reports.",
    note: "Admin access works only for users manually set to the admin role in MongoDB.",
    allowRegister: false,
  },
};

const portalLinks = [
  { label: "User", path: "/login" },
  { label: "Vendor", path: "/vendor/login" },
  { label: "Admin", path: "/admin/login" },
];

const inputClassName =
  "w-full rounded-2xl border border-saffron-100 bg-white px-4 py-3 text-sm text-charcoal-900 outline-none transition placeholder:text-slate-400 focus:border-saffron-300 focus:ring-4 focus:ring-saffron-100/60";

const LoginPage = ({ portalTitle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user, isAuthenticated } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const portalKey = useMemo(() => {
    const normalizedTitle = portalTitle.toLowerCase();

    if (normalizedTitle.includes("vendor")) {
      return "vendor";
    }

    if (normalizedTitle.includes("admin")) {
      return "admin";
    }

    return "user";
  }, [portalTitle]);

  const config = portalConfigs[portalKey];

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(getDefaultRoute(user.role), { replace: true });
    }
  }, [isAuthenticated, navigate, user]);

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const data = await login(form);
      navigate(getDefaultRoute(data.user.role), { replace: true });
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="min-h-[calc(100vh-180px)] bg-[#fffdf7] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md">
        <div className="rounded-[32px] border border-saffron-100 bg-white p-6 shadow-card sm:p-8">
          <div className="text-center">
            <span className="inline-flex rounded-full border border-saffron-200 bg-saffron-100/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-saffron-600">
              {config.kicker}
            </span>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-charcoal-900">{portalTitle}</h1>
            <p className="mt-3 text-sm leading-7 text-slate-600">{config.description}</p>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-2 rounded-[24px] bg-cream-50 p-1.5">
            {portalLinks.map((portal) => (
              <Link
                key={portal.path}
                to={portal.path}
                className={`rounded-[18px] px-3 py-2 text-center text-sm font-medium transition ${
                  location.pathname === portal.path ? "bg-charcoal-900 text-white shadow-sm" : "text-slate-500 hover:bg-white hover:text-charcoal-900"
                }`}
              >
                {portal.label}
              </Link>
            ))}
          </div>

          {location.state?.message ? (
            <p className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              {location.state.message}
            </p>
          ) : null}
          {error ? <p className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</p> : null}

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-charcoal-900">Email</span>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
                className={inputClassName}
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-charcoal-900">Password</span>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                className={inputClassName}
              />
            </label>

            <div className="rounded-[24px] border border-saffron-100 bg-cream-50 px-4 py-4 text-sm text-slate-600">
              {config.note}
            </div>

            <div className="grid gap-3 pt-2 sm:grid-cols-2">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center rounded-full bg-charcoal-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-charcoal-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {submitting ? "Signing in..." : "Login"}
              </button>
              {config.allowRegister ? (
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-saffron-200 hover:text-charcoal-900"
                >
                  Sign Up
                </Link>
              ) : (
                <Link
                  to="/"
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-saffron-200 hover:text-charcoal-900"
                >
                  Back Home
                </Link>
              )}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default LoginPage;
