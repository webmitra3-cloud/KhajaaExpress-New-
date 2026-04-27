import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../api/client";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { getRoleLoginRoute } from "../utils/routeHelpers";

const ActivationPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const hasTriggeredRef = useRef(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!token || hasTriggeredRef.current) {
      setLoading(false);
      return;
    }

    hasTriggeredRef.current = true;

    const activate = async () => {
      try {
        const { data } = await api.post("/auth/activate", { token });
        setResult(data);
      } catch (apiError) {
        setError(apiError.response?.data?.message || "Activation failed");
      } finally {
        setLoading(false);
      }
    };

    activate();
  }, [token]);

  if (loading) {
    return <LoadingSpinner label="Activating your account..." />;
  }

  if (!token) {
    return (
      <section className="page-section container">
        <div className="card form-card">
          <h1>Invalid activation link</h1>
          <p className="muted-text">The activation token is missing from the link.</p>
        </div>
      </section>
    );
  }

  const loginPath = getRoleLoginRoute(result?.role);

  return (
    <section className="page-section container">
      <div className="mx-auto max-w-2xl rounded-[32px] border border-saffron-100 bg-white p-8 shadow-card">
        <span className="inline-flex rounded-full border border-saffron-200 bg-saffron-100/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-saffron-600">
          Email activation
        </span>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-charcoal-900">{error ? "Activation failed" : "Account activated"}</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">{error || result?.message}</p>

        <div className="mt-8 flex flex-wrap gap-3">
          {!error ? (
            <Link to={loginPath} className="inline-flex items-center justify-center rounded-full bg-charcoal-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-charcoal-800">
              Continue to login
            </Link>
          ) : null}
          <Link
            to="/register"
            className="inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-saffron-200 hover:text-charcoal-900"
          >
            Back to register
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ActivationPage;
