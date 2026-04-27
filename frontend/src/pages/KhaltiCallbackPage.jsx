import { AlertTriangle, CheckCircle2, LoaderCircle } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../api/client";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";
import { formatCurrency } from "../utils/formatters";

const KhaltiCallbackPage = () => {
  const { isAuthenticated } = useAuth();
  const { clearCart } = useCart();
  const [searchParams] = useSearchParams();
  const verifyStartedRef = useRef(false);
  const [state, setState] = useState({
    loading: true,
    error: "",
    message: "",
    order: null,
  });

  const payload = useMemo(
    () => ({
      pidx: searchParams.get("pidx") || "",
      status: searchParams.get("status") || "",
      transactionId: searchParams.get("transaction_id") || searchParams.get("tidx") || "",
      amount: searchParams.get("amount") || "",
      totalAmount: searchParams.get("total_amount") || "",
      mobile: searchParams.get("mobile") || "",
      purchaseOrderId: searchParams.get("purchase_order_id") || "",
      purchaseOrderName: searchParams.get("purchase_order_name") || "",
    }),
    [searchParams]
  );

  useEffect(() => {
    if (verifyStartedRef.current) {
      return;
    }

    if (!isAuthenticated) {
      setState({
        loading: false,
        error: "",
        message: "",
        order: null,
      });
      return;
    }

    if (!payload.pidx || !payload.purchaseOrderId) {
      setState({
        loading: false,
        error: "Khalti callback parameters are incomplete",
        message: "",
        order: null,
      });
      return;
    }

    verifyStartedRef.current = true;

    const verifyPayment = async () => {
      try {
        const { data } = await api.post("/orders/khalti/verify", payload);
        if (data.order?.paymentStatus === "Paid") {
          clearCart();
        }

        setState({
          loading: false,
          error: "",
          message: data.message,
          order: data.order,
        });
      } catch (apiError) {
        setState({
          loading: false,
          error: apiError.response?.data?.message || "Unable to verify Khalti payment",
          message: "",
          order: null,
        });
      }
    };

    verifyPayment();
  }, [clearCart, isAuthenticated, payload]);

  if (state.loading) {
    return (
      <section className="page-section container">
        <div className="mx-auto flex max-w-xl flex-col items-center rounded-[32px] border border-saffron-100 bg-white px-8 py-10 text-center shadow-card">
          <LoaderCircle className="h-10 w-10 animate-spin text-saffron-500" />
          <h1 className="mt-5 text-3xl font-semibold tracking-tight text-charcoal-900">Verifying Khalti payment</h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">Please wait while we confirm your order payment with Khalti.</p>
        </div>
      </section>
    );
  }

  if (!isAuthenticated) {
    return (
      <section className="page-section container">
        <div className="mx-auto max-w-xl rounded-[32px] border border-saffron-100 bg-white p-8 shadow-card">
          <h1 className="text-3xl font-semibold tracking-tight text-charcoal-900">Login required</h1>
          <p className="mt-4 text-sm leading-7 text-slate-600">Please log in again so we can finish verifying your Khalti payment and show the order result.</p>
          <Link to="/login" className="mt-6 inline-flex items-center justify-center rounded-full bg-charcoal-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-charcoal-800">
            Go to login
          </Link>
        </div>
      </section>
    );
  }

  const paid = state.order?.paymentStatus === "Paid";

  return (
    <section className="page-section container">
      <div className="mx-auto max-w-3xl rounded-[32px] border border-saffron-100 bg-white p-8 shadow-card">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <span className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${paid ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
              {paid ? <CheckCircle2 className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}
            </span>
            <div>
              <span className="inline-flex rounded-full border border-saffron-200 bg-saffron-100/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-saffron-600">
                Khalti payment
              </span>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-charcoal-900">{paid ? "Payment verified" : "Payment needs attention"}</h1>
              <p className="mt-3 text-sm leading-7 text-slate-600">{state.error || state.message}</p>
            </div>
          </div>
          {state.order ? <span className="subtle-pill">{state.order.paymentStatus}</span> : null}
        </div>

        {state.order ? (
          <div className="mt-8 grid gap-4 rounded-[24px] border border-slate-200 bg-cream-50/80 p-5 sm:grid-cols-3">
            <div>
              <small className="muted-text">Order number</small>
              <strong className="mt-1 block text-charcoal-900">#{state.order.orderNumber}</strong>
            </div>
            <div>
              <small className="muted-text">Restaurant</small>
              <strong className="mt-1 block text-charcoal-900">{state.order.vendor?.restaurantName}</strong>
            </div>
            <div>
              <small className="muted-text">Amount</small>
              <strong className="mt-1 block text-charcoal-900">{formatCurrency(state.order.totalPrice)}</strong>
            </div>
          </div>
        ) : null}

        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/user/orders" className="inline-flex items-center justify-center rounded-full bg-charcoal-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-charcoal-800">
            Open my orders
          </Link>
          <Link
            to="/cart"
            className="inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-saffron-200 hover:text-charcoal-900"
          >
            Back to cart
          </Link>
        </div>
      </div>
    </section>
  );
};

export default KhaltiCallbackPage;
