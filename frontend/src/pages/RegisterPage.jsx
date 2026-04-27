import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ImageUploadField from "../components/common/ImageUploadField";
import { useAuth } from "../hooks/useAuth";
import { getDefaultRoute } from "../utils/routeHelpers";

const initialForm = {
  name: "",
  email: "",
  password: "",
  phone: "",
  address: "",
  accountType: "user",
  restaurantName: "",
  description: "",
  logoUrl: "",
  coverImageUrl: "",
};

const inputClassName =
  "w-full rounded-2xl border border-saffron-100 bg-white px-4 py-3 text-sm text-charcoal-900 outline-none transition placeholder:text-slate-400 focus:border-saffron-300 focus:ring-4 focus:ring-saffron-100/60";

const Field = ({ label, name, value, onChange, placeholder, type = "text", required = false }) => (
  <label className="block space-y-2">
    <span className="text-sm font-medium text-charcoal-900">{label}</span>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className={inputClassName}
    />
  </label>
);

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, user, isAuthenticated } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isVendor = form.accountType === "vendor";

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

  const handleImageChange = (field, imageUrl) => {
    setForm((current) => ({
      ...current,
      [field]: imageUrl,
    }));
  };

  const handleTypeChange = (accountType) => {
    setForm((current) => ({
      ...current,
      accountType,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const data = await register(form);
      navigate(isVendor ? "/vendor/login" : "/login", {
        replace: true,
        state: { message: data.message },
      });
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="min-h-[calc(100vh-180px)] bg-[#fffdf7] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-[32px] border border-saffron-100 bg-white p-6 shadow-card sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="inline-flex rounded-full border border-saffron-200 bg-saffron-100/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-saffron-600">
                Create account
              </span>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-charcoal-900">Simple signup</h1>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Choose a user or vendor account. Admin accounts are not created from this form.
              </p>
            </div>
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-saffron-200 hover:text-charcoal-900"
            >
              Already have an account?
            </Link>
          </div>

          <div className="mt-6 inline-grid grid-cols-2 gap-2 rounded-[24px] bg-cream-50 p-1.5">
            <button
              type="button"
              onClick={() => handleTypeChange("user")}
              className={`rounded-[18px] px-4 py-2.5 text-sm font-medium transition ${
                form.accountType === "user" ? "bg-charcoal-900 text-white shadow-sm" : "text-slate-500 hover:bg-white hover:text-charcoal-900"
              }`}
            >
              User
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange("vendor")}
              className={`rounded-[18px] px-4 py-2.5 text-sm font-medium transition ${
                form.accountType === "vendor" ? "bg-charcoal-900 text-white shadow-sm" : "text-slate-500 hover:bg-white hover:text-charcoal-900"
              }`}
            >
              Vendor
            </button>
          </div>

          <div className="mt-5 rounded-[24px] border border-saffron-100 bg-cream-50 px-4 py-4 text-sm text-slate-600">
            {isVendor
              ? "A vendor account is created only after email activation, and then it stays pending until admin approval."
              : "User accounts are created only after the activation link from email is clicked."}
          </div>

          {error ? <p className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</p> : null}

          <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
            <Field label="Full Name" name="name" value={form.name} onChange={handleChange} placeholder="Enter your full name" required />
            <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="Enter your email" required />
            <Field label="Password" name="password" type="password" value={form.password} onChange={handleChange} placeholder="Create a password" required />
            <Field label="Phone" name="phone" value={form.phone} onChange={handleChange} placeholder="Enter phone number" required={isVendor} />
            <div className="md:col-span-2">
              <Field
                label="Address"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder={isVendor ? "Restaurant address" : "Delivery address"}
                required={isVendor}
              />
            </div>

            {isVendor ? (
              <>
                <Field
                  label="Restaurant Name"
                  name="restaurantName"
                  value={form.restaurantName}
                  onChange={handleChange}
                  placeholder="Enter restaurant name"
                  required
                />
                <label className="block space-y-2 md:col-span-2">
                  <span className="text-sm font-medium text-charcoal-900">Description</span>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Short restaurant description"
                    className={`${inputClassName} min-h-[120px] resize-y`}
                  />
                </label>
                <ImageUploadField
                  label="Restaurant Logo"
                  value={form.logoUrl}
                  onChange={(imageUrl) => handleImageChange("logoUrl", imageUrl)}
                  helperText="Upload a local restaurant logo."
                />
                <ImageUploadField
                  label="Cover Image"
                  value={form.coverImageUrl}
                  onChange={(imageUrl) => handleImageChange("coverImageUrl", imageUrl)}
                  helperText="Upload a cover image for restaurant cards and details."
                />
              </>
            ) : null}

            <div className="grid gap-3 pt-2 md:col-span-2 sm:grid-cols-2">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center rounded-full bg-charcoal-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-charcoal-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {submitting ? "Submitting..." : isVendor ? "Register Vendor" : "Register User"}
              </button>
              <Link
                to={isVendor ? "/vendor/login" : "/login"}
                className="inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-saffron-200 hover:text-charcoal-900"
              >
                Go to Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default RegisterPage;
