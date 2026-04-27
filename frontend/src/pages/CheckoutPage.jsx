import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import FormInput from "../components/common/FormInput";
import EmptyState from "../components/common/EmptyState";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";
import { formatCurrency } from "../utils/formatters";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const [form, setForm] = useState({
    deliveryAddress: user?.address || "",
    notes: "",
    paymentMethod: "Cash on Delivery",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!cart.items.length) {
    return (
      <section className="page-section container">
        <EmptyState title="No items to checkout" description="Add items to your cart before placing an order." />
      </section>
    );
  }

  const payload = {
    vendorId: cart.vendorId,
    items: cart.items,
    deliveryAddress: form.deliveryAddress,
    notes: form.notes,
    paymentMethod: form.paymentMethod,
  };

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      if (form.paymentMethod === "Khalti") {
        const { data } = await api.post("/orders/khalti/initiate", payload);
        window.location.href = data.paymentUrl;
        return;
      }

      await api.post("/orders", payload);
      clearCart();
      navigate("/user/orders", { replace: true });
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Unable to place order");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="page-section container">
      <div className="page-header">
        <div>
          <h1>Checkout</h1>
          <p className="muted-text">Choose cash on delivery or pay securely through Khalti sandbox.</p>
        </div>
      </div>

      <div className="grid-2">
        <form className="card form-card" onSubmit={handleSubmit}>
          {error ? <p className="error-text">{error}</p> : null}
          <FormInput label="Delivery Address" name="deliveryAddress" value={form.deliveryAddress} onChange={handleChange} required />
          <div className="form-field">
            <span>Notes</span>
            <textarea name="notes" value={form.notes} onChange={handleChange} rows={4} placeholder="Optional instructions" />
          </div>
          <FormInput
            label="Payment Method"
            name="paymentMethod"
            value={form.paymentMethod}
            onChange={handleChange}
            as="select"
            options={[
              { label: "Cash on Delivery", value: "Cash on Delivery" },
              { label: "Khalti", value: "Khalti" },
            ]}
          />
          <div className="rounded-2xl border border-saffron-100 bg-cream-50 px-4 py-4 text-sm text-slate-600">
            {form.paymentMethod === "Khalti"
              ? "You will be redirected to Khalti sandbox to complete the payment. The order will be confirmed only after Khalti verification."
              : "Cash will be collected on delivery. The payment status will switch to paid when the order is delivered."}
          </div>
          <div className="form-actions">
            <button type="submit" className="button" disabled={submitting}>
              {submitting ? "Processing..." : form.paymentMethod === "Khalti" ? "Continue to Khalti" : "Place Order"}
            </button>
          </div>
        </form>

        <div className="card summary-card">
          <h3>Order Summary</h3>
          <div className="summary-row">
            <span>Restaurant</span>
            <strong>{cart.vendorName}</strong>
          </div>
          {cart.items.map((item) => (
            <div key={item.foodId} className="summary-row">
              <span>
                {item.name} x {item.quantity}
              </span>
              <strong>{formatCurrency(item.price * item.quantity)}</strong>
            </div>
          ))}
          <div className="summary-row">
            <span>Total</span>
            <strong>{formatCurrency(totalPrice)}</strong>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CheckoutPage;
