import { formatCurrency } from "../../utils/formatters";
import RatingStars from "./RatingStars";

const FoodCard = ({ food, onAdd }) => (
  <div className="card food-card food-card-pro">
    <img src={food.imageUrl || "https://via.placeholder.com/300x200?text=Food"} alt={food.name} className="food-cover-pro" />
    <div className="food-card-body-pro">
      <div className="food-card-head-pro">
        <div>
          <h3>{food.name}</h3>
          {food.vendor?.restaurantName ? <p>{food.vendor.restaurantName}</p> : null}
          {food.reviewCount ? (
            <div className="mt-2">
              <RatingStars value={food.averageRating} reviewCount={food.reviewCount} showValue />
            </div>
          ) : (
            <p className="mt-2 text-xs text-slate-400">No ratings yet</p>
          )}
        </div>
        <strong>{formatCurrency(food.price)}</strong>
      </div>
      <div className="food-card-foot-pro">
        <span className={`subtle-pill ${food.isAvailable ? "pill-success" : "pill-danger"}`}>
          {food.isAvailable ? "Available" : "Unavailable"}
        </span>
        {food.totalOrdered ? <small className="muted-text">{food.totalOrdered} recent</small> : <span />}
      </div>
      {onAdd ? (
        <button type="button" className="button compact-card-button" onClick={() => onAdd(food)} disabled={!food.isAvailable}>
          Add to Cart
        </button>
      ) : null}
    </div>
  </div>
);

export default FoodCard;
