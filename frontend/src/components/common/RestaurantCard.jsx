import { Link } from "react-router-dom";
import RatingStars from "./RatingStars";

const RestaurantCard = ({ vendor }) => {
  const coverImage = vendor.coverImageUrl || vendor.logoUrl || "https://via.placeholder.com/600x300?text=Restaurant";
  const logoImage = vendor.logoUrl || vendor.user?.avatarUrl || coverImage;

  return (
    <div className="card restaurant-card restaurant-card-pro">
      <img src={coverImage} alt={vendor.restaurantName} className="restaurant-cover-pro" />
      <div className="restaurant-card-body-pro">
        <div className="restaurant-card-head-pro">
          <img src={logoImage} alt={`${vendor.restaurantName} logo`} className="restaurant-logo-pro" />
          <div>
            <h3>{vendor.restaurantName}</h3>
            <p>{vendor.address || "Restaurant"}</p>
            <div className="mt-2">
              <RatingStars value={vendor.averageRating} reviewCount={vendor.reviewCount} showValue />
            </div>
          </div>
        </div>
        <div className="restaurant-card-foot-pro">
          <div className="flex flex-wrap items-center gap-2">
            <span className="subtle-pill">{vendor.foodCount || 0} items</span>
            <span className="subtle-pill">{vendor.deliveredOrders || 0} delivered</span>
          </div>
          <Link to={`/restaurants/${vendor._id}`} className="button button-secondary inline-button compact-card-button">
            Menu
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;
