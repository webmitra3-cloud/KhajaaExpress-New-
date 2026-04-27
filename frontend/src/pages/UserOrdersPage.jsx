import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import EmptyState from "../components/common/EmptyState";
import LoadingSpinner from "../components/common/LoadingSpinner";
import RatingStars from "../components/common/RatingStars";
import StatusBadge from "../components/common/StatusBadge";
import { formatCurrency, formatDate, getOrderItemCount } from "../utils/formatters";

const progressSteps = ["Order placed", "Order confirmed", "Preparing", "Out for delivery", "Delivered"];
const activeStatuses = new Set(["Order placed", "Order confirmed", "Preparing", "Out for delivery"]);

const buildReviewDraft = (order) => ({
  open: false,
  rating: 5,
  comment: "",
  itemRatings: order.items.map((item) => ({
    foodId: item.food,
    name: item.name,
    rating: 5,
    comment: "",
  })),
});

const UserOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewDrafts, setReviewDrafts] = useState({});
  const [submittingReviewId, setSubmittingReviewId] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get("/orders/my");
        setOrders(data);
        setReviewDrafts(
          data.reduce((accumulator, order) => {
            accumulator[order._id] = buildReviewDraft(order);
            return accumulator;
          }, {})
        );
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const summary = useMemo(
    () =>
      orders.reduce(
        (accumulator, order) => {
          accumulator.totalOrders += 1;

          if (activeStatuses.has(order.status)) {
            accumulator.activeOrders += 1;
          }

          if (order.status === "Delivered") {
            accumulator.deliveredOrders += 1;
          }

          if (order.status !== "Cancelled") {
            accumulator.totalSpent += Number(order.totalPrice || 0);
          }

          return accumulator;
        },
        {
          totalOrders: 0,
          activeOrders: 0,
          deliveredOrders: 0,
          totalSpent: 0,
        }
      ),
    [orders]
  );

  const updateReviewDraft = (orderId, updater) => {
    setReviewDrafts((current) => ({
      ...current,
      [orderId]: updater(current[orderId]),
    }));
  };

  const toggleReviewForm = (order) => {
    updateReviewDraft(order._id, (currentDraft) => ({
      ...(currentDraft || buildReviewDraft(order)),
      open: !currentDraft?.open,
    }));
  };

  const handleReviewSubmit = async (orderId) => {
    const draft = reviewDrafts[orderId];

    if (!draft) {
      return;
    }

    setSubmittingReviewId(orderId);

    try {
      const { data } = await api.post(`/orders/${orderId}/review`, {
        rating: draft.rating,
        comment: draft.comment,
        itemRatings: draft.itemRatings,
      });

      setOrders((current) =>
        current.map((order) =>
          order._id === orderId
            ? {
                ...order,
                review: data.review,
              }
            : order
        )
      );
      updateReviewDraft(orderId, (currentDraft) => ({
        ...currentDraft,
        open: false,
      }));
    } catch (error) {
      alert(error.response?.data?.message || "Unable to submit review");
    } finally {
      setSubmittingReviewId("");
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading your orders..." />;
  }

  if (!orders.length) {
    return (
      <div className="user-panel-stack">
        <EmptyState title="No orders yet" description="Your placed orders will appear here with live status tracking." />
        <div className="flex flex-wrap gap-3">
          <Link to="/restaurants" className="button inline-button">
            Browse Restaurants
          </Link>
          <Link to="/" className="button button-ghost inline-button">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="user-panel-stack">
      <section className="card user-panel-hero">
        <div className="user-panel-hero-main">
          <div>
            <span className="section-kicker">Orders</span>
            <h1>My Orders</h1>
            <p className="muted-text">Track active orders, monitor payment progress, and review delivered meals.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link to="/restaurants" className="button inline-button">
                Browse Restaurants
              </Link>
              <Link to="/" className="button button-ghost inline-button">
                Back to Home
              </Link>
            </div>
          </div>
          <div className="user-summary-strip">
            <div className="user-summary-pill">
              <strong>{summary.totalOrders}</strong>
              <span>Total</span>
            </div>
            <div className="user-summary-pill">
              <strong>{summary.activeOrders}</strong>
              <span>Active</span>
            </div>
            <div className="user-summary-pill">
              <strong>{summary.deliveredOrders}</strong>
              <span>Delivered</span>
            </div>
            <div className="user-summary-pill user-summary-pill-wide">
              <strong>{formatCurrency(summary.totalSpent)}</strong>
              <span>Spent</span>
            </div>
          </div>
        </div>
      </section>

      <div className="user-order-list-pro">
        {orders.map((order) => {
          const currentStepIndex = progressSteps.indexOf(order.status);
          const draft = reviewDrafts[order._id] || buildReviewDraft(order);

          return (
            <article className="card user-order-card-pro" key={order._id}>
              <div className="user-order-head-pro">
                <div>
                  <h3>{order.vendor?.restaurantName || "Restaurant"}</h3>
                  <div className="user-order-meta-pro">
                    <span>#{order.orderNumber}</span>
                    <span>{formatDate(order.createdAt)}</span>
                    <span>{getOrderItemCount(order.items)} items</span>
                  </div>
                </div>
                <div className="user-order-status-pro">
                  <strong>{formatCurrency(order.totalPrice)}</strong>
                  <div className="flex flex-col items-end gap-2">
                    <StatusBadge value={order.status} />
                    <StatusBadge value={order.paymentStatus} />
                  </div>
                </div>
              </div>

              {order.status === "Cancelled" ? (
                <div className="order-cancel-note">
                  <strong>Order cancelled</strong>
                  <p className="muted-text">
                    {order.paymentMethod === "Khalti" && order.paymentStatus !== "Paid"
                      ? "This order was cancelled because the Khalti payment was not completed."
                      : "This order was cancelled."}
                  </p>
                </div>
              ) : (
                <div className="order-progress-strip order-progress-strip-pro">
                  {progressSteps.map((step, index) => {
                    const progressClass = index < currentStepIndex ? "complete" : index === currentStepIndex ? "active" : "pending";

                    return (
                      <div key={`${order._id}-${step}`} className={`order-progress-step ${progressClass}`}>
                        <span>{index + 1}</span>
                        <strong>{step}</strong>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="user-order-grid-pro">
                <div className="user-order-items-pro">
                  {order.items.map((item, index) => (
                    <div key={`${order._id}-${item.food || item.name}-${index}`} className="user-order-item-pro">
                      <div>
                        <strong>{item.name}</strong>
                        <p className="muted-text">Qty {item.quantity}</p>
                      </div>
                      <strong>{formatCurrency(item.price * item.quantity)}</strong>
                    </div>
                  ))}
                </div>

                <aside className="user-order-side-pro">
                  <div className="user-order-side-row">
                    <span>Payment</span>
                    <strong>{order.paymentMethod}</strong>
                  </div>
                  <div className="user-order-side-row">
                    <span>Payment status</span>
                    <strong>{order.paymentStatus}</strong>
                  </div>
                  <div className="user-order-side-row user-order-side-row-block">
                    <span>Address</span>
                    <strong>{order.deliveryAddress}</strong>
                  </div>
                  <Link to="/user/chat" className="button button-ghost inline-button full-width">
                    Open Chat
                  </Link>
                </aside>
              </div>

              <div className="mt-5 rounded-[24px] border border-slate-200 bg-white p-4">
                <strong className="text-charcoal-900">Tracking history</strong>
                <div className="mt-3 grid gap-3">
                  {order.statusHistory?.map((step, index) => (
                    <div key={`${order._id}-${step.status}-${index}`} className="flex items-start justify-between gap-3 rounded-2xl border border-slate-100 px-4 py-3">
                      <div>
                        <strong className="text-sm text-charcoal-900">{step.status}</strong>
                        {step.note ? <p className="mt-1 text-sm text-slate-500">{step.note}</p> : null}
                      </div>
                      <small className="text-slate-400">{formatDate(step.changedAt)}</small>
                    </div>
                  ))}
                </div>
              </div>

              {order.review ? (
                <div className="mt-5 rounded-[24px] border border-emerald-100 bg-emerald-50/70 p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <strong className="text-charcoal-900">Your review</strong>
                      <RatingStars value={order.review.rating} showValue className="mt-2" />
                    </div>
                    <span className="subtle-pill">Submitted</span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{order.review.comment || "No written review provided."}</p>
                  {order.review.itemReviews?.length ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {order.review.itemReviews.map((item) => (
                        <span key={`${order.review._id}-${item.food}`} className="rounded-full border border-emerald-100 bg-white px-3 py-1.5 text-xs text-slate-600">
                          {item.name}: {item.rating}/5
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : order.status === "Delivered" ? (
                <div className="mt-5 rounded-[24px] border border-slate-200 bg-cream-50/80 p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <strong className="text-charcoal-900">Rate this order</strong>
                      <p className="mt-2 text-sm text-slate-500">Leave an overall rating and optional food-item ratings for the vendor report and restaurant page.</p>
                    </div>
                    <button type="button" className="button button-secondary" onClick={() => toggleReviewForm(order)}>
                      {draft.open ? "Hide Review Form" : "Leave Review"}
                    </button>
                  </div>

                  {draft.open ? (
                    <div className="mt-5 grid gap-4">
                      <div>
                        <small className="muted-text">Overall rating</small>
                        <RatingStars
                          value={draft.rating}
                          interactive
                          onChange={(value) =>
                            updateReviewDraft(order._id, (currentDraft) => ({
                              ...currentDraft,
                              rating: value,
                            }))
                          }
                          size="lg"
                          className="mt-2"
                        />
                      </div>

                      <label className="block space-y-2">
                        <span className="text-sm font-medium text-charcoal-900">Comment</span>
                        <textarea
                          rows={3}
                          value={draft.comment}
                          onChange={(event) =>
                            updateReviewDraft(order._id, (currentDraft) => ({
                              ...currentDraft,
                              comment: event.target.value,
                            }))
                          }
                          placeholder="Share what went well or what could improve"
                        />
                      </label>

                      <div className="grid gap-3">
                        {draft.itemRatings.map((item) => (
                          <div key={`${order._id}-${item.foodId}`} className="rounded-[20px] border border-slate-200 bg-white p-4">
                            <strong className="text-charcoal-900">{item.name}</strong>
                            <RatingStars
                              value={item.rating}
                              interactive
                              onChange={(value) =>
                                updateReviewDraft(order._id, (currentDraft) => ({
                                  ...currentDraft,
                                  itemRatings: currentDraft.itemRatings.map((draftItem) =>
                                    draftItem.foodId === item.foodId ? { ...draftItem, rating: value } : draftItem
                                  ),
                                }))
                              }
                              className="mt-2"
                            />
                            <textarea
                              className="mt-3"
                              rows={2}
                              value={item.comment}
                              onChange={(event) =>
                                updateReviewDraft(order._id, (currentDraft) => ({
                                  ...currentDraft,
                                  itemRatings: currentDraft.itemRatings.map((draftItem) =>
                                    draftItem.foodId === item.foodId ? { ...draftItem, comment: event.target.value } : draftItem
                                  ),
                                }))
                              }
                              placeholder={`Optional note about ${item.name}`}
                            />
                          </div>
                        ))}
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <button type="button" className="button" onClick={() => handleReviewSubmit(order._id)} disabled={submittingReviewId === order._id}>
                          {submittingReviewId === order._id ? "Submitting..." : "Submit Review"}
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </div>
  );
};

export default UserOrdersPage;
