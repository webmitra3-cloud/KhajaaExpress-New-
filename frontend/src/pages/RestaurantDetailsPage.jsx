import { MessageCircle, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/client";
import FoodCard from "../components/common/FoodCard";
import LoadingSpinner from "../components/common/LoadingSpinner";
import RatingStars from "../components/common/RatingStars";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";
import { buildConversationKey } from "../utils/routeHelpers";

const RestaurantDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [vendor, setVendor] = useState(null);
  const [foods, setFoods] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewSummary, setReviewSummary] = useState({ averageRating: 0, reviewCount: 0 });
  const [loading, setLoading] = useState(true);
  const [menuSearch, setMenuSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    const fetchVendor = async () => {
      try {
        const { data } = await api.get(`/vendors/${id}`);
        setVendor(data.vendor);
        setFoods(data.foods);
        setReviews(data.reviews || []);
        setReviewSummary(data.reviewSummary || { averageRating: 0, reviewCount: 0 });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchVendor();
  }, [id]);

  const categories = useMemo(() => {
    const names = new Map();
    foods.forEach((food) => {
      if (food.category?._id) {
        names.set(food.category._id, food.category.name);
      }
    });
    return Array.from(names.entries()).map(([value, label]) => ({ value, label }));
  }, [foods]);

  const filteredFoods = foods.filter((food) => {
    const matchesSearch = food.name.toLowerCase().includes(menuSearch.toLowerCase());
    const matchesCategory = categoryFilter === "all" || food.category?._id === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleChatStart = () => {
    if (!isAuthenticated || user?.role !== "user") {
      navigate("/login");
      return;
    }

    navigate("/user/chat", {
      state: {
        receiverId: vendor.user?._id,
        receiverName: vendor.restaurantName,
        restaurantName: vendor.restaurantName,
        conversationKey: buildConversationKey(user._id, vendor.user?._id),
      },
    });
  };

  if (loading) {
    return <LoadingSpinner label="Loading restaurant..." />;
  }

  if (!vendor) {
    return (
      <section className="page-section container">
        <div className="card empty-state">
          <h3>Restaurant not found</h3>
        </div>
      </section>
    );
  }

  return (
    <section className="page-section container">
      <div className="card overflow-hidden">
        <img
          src={vendor.coverImageUrl || vendor.logoUrl || "https://via.placeholder.com/1200x400?text=Restaurant"}
          alt={vendor.restaurantName}
          style={{ width: "100%", height: "280px", objectFit: "cover" }}
        />
        <div className="form-card">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <span className="inline-flex rounded-full border border-saffron-200 bg-saffron-100/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-saffron-600">
                Restaurant profile
              </span>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-charcoal-900">{vendor.restaurantName}</h1>
              <p className="mt-3 text-sm leading-7 text-slate-600">{vendor.description || "Restaurant profile and menu."}</p>
              <p className="mt-3 text-sm text-slate-500">{vendor.address}</p>
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <small className="muted-text">Rating</small>
                  <RatingStars value={reviewSummary.averageRating} reviewCount={reviewSummary.reviewCount} showValue size="md" className="mt-1" />
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <small className="muted-text">Menu items</small>
                  <strong className="mt-1 block text-charcoal-900">{foods.length}</strong>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button type="button" className="button button-ghost inline-button" onClick={handleChatStart}>
                <MessageCircle className="h-4 w-4" />
                Chat with Vendor
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="filter-row card form-card" style={{ marginTop: "1.5rem" }}>
        <input value={menuSearch} onChange={(event) => setMenuSearch(event.target.value)} placeholder="Search food items" />
        <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
          <option value="all">All Categories</option>
          {categories.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid-3" style={{ marginTop: "1rem" }}>
        {filteredFoods.map((food) => (
          <FoodCard
            key={food._id}
            food={food}
            onAdd={(selectedFood) =>
              addToCart(selectedFood, {
                _id: vendor._id,
                restaurantName: vendor.restaurantName,
              })
            }
          />
        ))}
      </div>

      <section className="card form-card" style={{ marginTop: "1.5rem" }}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-charcoal-900">Customer Reviews</h2>
            <p className="muted-text">Recent feedback from completed orders.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <small className="muted-text">Overall rating</small>
            <div className="mt-1 flex items-center gap-2">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <strong className="text-charcoal-900">{Number(reviewSummary.averageRating || 0).toFixed(1)}</strong>
              <span className="text-sm text-slate-500">from {reviewSummary.reviewCount || 0} reviews</span>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4">
          {reviews.length ? (
            reviews.map((review) => (
              <article key={review._id} className="rounded-[24px] border border-slate-200 bg-white p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <strong className="text-charcoal-900">{review.user?.name || "Customer"}</strong>
                    <RatingStars value={review.rating} showValue className="mt-2" />
                  </div>
                  <span className="subtle-pill">{review.itemReviews?.length || 0} food ratings</span>
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-600">{review.comment || "No written feedback provided."}</p>
                {review.itemReviews?.length ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {review.itemReviews.map((item) => (
                      <span key={`${review._id}-${item.food}`} className="rounded-full border border-slate-200 bg-cream-50 px-3 py-1.5 text-xs text-slate-600">
                        {item.name}: {item.rating}/5
                      </span>
                    ))}
                  </div>
                ) : null}
              </article>
            ))
          ) : (
            <p className="muted-text">No reviews yet for this restaurant.</p>
          )}
        </div>
      </section>
    </section>
  );
};

export default RestaurantDetailsPage;
