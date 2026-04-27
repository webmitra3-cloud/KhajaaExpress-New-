import { ArrowRight, Clock3, MapPin, Star } from "lucide-react";
import { Link } from "react-router-dom";
import SectionHeading from "./SectionHeading";

const getGridClassName = (count) => {
  if (count <= 1) {
    return "mx-auto max-w-xl grid-cols-1";
  }

  if (count === 2) {
    return "mx-auto max-w-5xl grid-cols-1 md:grid-cols-2";
  }

  return "grid-cols-1 md:grid-cols-2 xl:grid-cols-3";
};

const RestaurantSkeleton = () => (
  <div className="animate-pulse overflow-hidden rounded-[30px] border border-saffron-100 bg-white shadow-card">
    <div className="h-56 bg-cream-100" />
    <div className="p-6">
      <div className="h-16 w-16 -translate-y-10 rounded-2xl border-4 border-white bg-slate-100" />
      <div className="-mt-6 space-y-3">
        <div className="h-5 w-48 rounded bg-slate-200" />
        <div className="h-4 w-32 rounded bg-slate-100" />
        <div className="h-4 w-40 rounded bg-slate-100" />
        <div className="h-11 w-full rounded-2xl bg-slate-100" />
      </div>
    </div>
  </div>
);

const FeaturedRestaurants = ({ restaurants, loading }) => {
  const list = restaurants.slice(0, 6);

  return (
    <section className="py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          label="Featured restaurants"
          title="Well-structured restaurant cards that help users decide faster"
          subtitle="Each card surfaces the details people actually look for first: visuals, cuisine, rating, delivery estimate, and a clear path to the menu."
          action={
            <Link
              to="/restaurants"
              className="inline-flex items-center gap-2 rounded-full border border-saffron-200 bg-white px-5 py-3 text-sm font-semibold text-charcoal-900 transition hover:-translate-y-0.5 hover:border-saffron-300 hover:text-saffron-600"
            >
              View all restaurants
              <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />

        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <RestaurantSkeleton key={index} />
            ))}
          </div>
        ) : list.length ? (
          <div className={`grid gap-6 ${getGridClassName(list.length)}`}>
            {list.map((restaurant) => (
              <Link
                key={restaurant._id}
                to={`/restaurants/${restaurant._id}`}
                className="group overflow-hidden rounded-[30px] border border-saffron-100 bg-white shadow-card transition duration-300 hover:-translate-y-1.5 hover:border-saffron-200 hover:shadow-soft"
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={restaurant.coverImage}
                    alt={restaurant.restaurantName}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/80 via-charcoal-900/15 to-transparent" />
                  {restaurant.featuredLabel ? (
                    <span className="absolute left-5 top-5 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-charcoal-900 backdrop-blur">
                      {restaurant.featuredLabel}
                    </span>
                  ) : null}
                </div>

                <div className="relative p-6">
                  <div className="-mt-14 flex items-end justify-between gap-4">
                    <img
                      src={restaurant.logoImage || restaurant.coverImage}
                      alt={restaurant.restaurantName}
                      className="h-16 w-16 rounded-2xl border-4 border-white object-cover shadow-lg"
                    />
                    <div className="inline-flex items-center gap-1 rounded-full bg-cream-100 px-3 py-1 text-sm font-semibold text-charcoal-900">
                      <Star className="h-4 w-4 fill-saffron-400 text-saffron-400" />
                      {restaurant.rating}
                    </div>
                  </div>

                  <div className="mt-4">
                    <h3 className="text-xl font-semibold tracking-tight text-charcoal-900">{restaurant.restaurantName}</h3>
                    <p className="mt-2 text-sm text-slate-600">{restaurant.cuisineLabel}</p>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2 text-sm text-slate-500">
                    <span className="inline-flex items-center gap-2 rounded-full bg-cream-100 px-3 py-2">
                      <Clock3 className="h-4 w-4 text-saffron-500" />
                      {restaurant.deliveryTime}
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full bg-cream-100 px-3 py-2">
                      <MapPin className="h-4 w-4 text-saffron-500" />
                      {restaurant.locationLabel}
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full bg-cream-100 px-3 py-2">{restaurant.itemCount} menu items</span>
                  </div>

                  <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-saffron-600 transition group-hover:gap-3">
                    View menu
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-[30px] border border-dashed border-saffron-200 bg-white/70 p-10 text-center shadow-card">
            <p className="text-lg font-semibold text-charcoal-900">No approved restaurants available yet.</p>
            <p className="mt-2 text-sm text-slate-500">Add vendors from the admin panel and they will appear here automatically.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedRestaurants;