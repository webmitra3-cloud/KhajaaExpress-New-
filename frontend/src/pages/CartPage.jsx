import { Link } from "react-router-dom";
import EmptyState from "../components/common/EmptyState";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";
import { formatCurrency } from "../utils/formatters";

const CartPage = () => {
  const { cart, updateQuantity, removeItem, totalPrice } = useCart();
  const { isAuthenticated, user } = useAuth();

  return (
    <section className="page-section container">
      <div className="page-header">
        <div>
          <h1>Cart</h1>
          <p className="muted-text">Single-restaurant cart for simple order placement.</p>
        </div>
      </div>

      {!cart.items.length ? (
        <EmptyState title="Cart is empty" description="Browse restaurants and add a few menu items first." />
      ) : (
        <div className="grid-2">
          <div className="cart-list">
            {cart.items.map((item) => (
              <div className="card cart-item" key={item.foodId}>
                <div className="order-row">
                  <div>
                    <h3>{item.name}</h3>
                    <p className="muted-text">{formatCurrency(item.price)} each</p>
                  </div>
                  <button type="button" className="button button-ghost" onClick={() => removeItem(item.foodId)}>
                    Remove
                  </button>
                </div>
                <div className="action-row">
                  <button type="button" className="button button-ghost" onClick={() => updateQuantity(item.foodId, item.quantity - 1)}>
                    -
                  </button>
                  <strong>{item.quantity}</strong>
                  <button type="button" className="button button-ghost" onClick={() => updateQuantity(item.foodId, item.quantity + 1)}>
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="card summary-card">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>Restaurant</span>
              <strong>{cart.vendorName}</strong>
            </div>
            <div className="summary-row">
              <span>Total</span>
              <strong>{formatCurrency(totalPrice)}</strong>
            </div>
            <div className="form-actions">
              {isAuthenticated && user?.role === "user" ? (
                <Link to="/checkout" className="button inline-button full-width">
                  Proceed to Checkout
                </Link>
              ) : (
                <Link to="/login" className="button inline-button full-width">
                  Login to Checkout
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default CartPage;
