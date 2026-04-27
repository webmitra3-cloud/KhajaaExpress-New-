import { Flame, Heart, Plus, Sparkles } from "lucide-react";
import { formatCurrency } from "../../utils/formatters";
import SectionHeading from "./SectionHeading";

const getPopularGridClassName = (count) => {
  if (count <= 1) {
    return "grid-cols-1";
  }

  return "grid-cols-1 md:grid-cols-2";
};

const DishSkeleton = () => (
  <div className="animate-pulse overflow-hidden rounded-[30px] border border-saffron-100 bg-white shadow-card">
    <div className="h-52 bg-cream-100" />
    <div className="space-y-3 p-5">
      <div className="h-5 w-36 rounded bg-slate-200" />
      <div className="h-4 w-24 rounded bg-slate-100" />
      <div className="h-4 w-full rounded bg-slate-100" />
      <div className="h-11 w-full rounded-2xl bg-slate-100" />
    </div>
  </div>
);

const LatestDishRow = ({ food, onAdd }) => (
  <div className="flex items-center gap-4 rounded-[24px] border border-saffron-100 bg-white p-4 shadow-card transition duration-300 hover:-translate-y-0.5 hover:border-saffron-200">
    <img src={food.dishImage} alt={food.name} className="h-20 w-20 rounded-2xl object-cover" />
    <div className="min-w-0 flex-1">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-saffron-600">
        <Sparkles className="h-4 w-4" />
        Fresh today
      </div>
      <p className="mt-2 truncate text-base font-semibold text-charcoal-900">{food.name}</p>
      <p className="mt-1 text-sm text-slate-500">{food.vendorName}</p>
      <p className="mt-2 text-sm font-semibold text-charcoal-900">{formatCurrency(food.price)}</p>
    </div>
    <button
      type="button"
      onClick={() => onAdd(food)}
      disabled={food.isAvailable === false}
      className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-charcoal-900 text-white transition hover:bg-charcoal-800 disabled:cursor-not-allowed disabled:bg-slate-300"
      aria-label={`Add ${food.name}`}
    >
      <Plus className="h-5 w-5" />
    </button>
  </div>
);

const PopularDishes = ({ latestFoods, popularDishes, loading, onAdd }) => {
  const latest = latestFoods.slice(0, 3);
  const popular = popularDishes.slice(0, 4);

  return (
    <section id="popular-dishes" className="py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          label="Best picks"
          title="Popular dishes with stronger visuals and clearer calls to action"
          subtitle="Highlight top-performing menu items, keep price visibility strong, and let customers add items to the cart without friction."
        />

        <div className="grid gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
          <div className="rounded-[32px] border border-saffron-100 bg-gradient-to-br from-white to-cream-50 p-6 shadow-card">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-saffron-600">Latest food today</p>
                <h3 className="mt-3 text-2xl font-semibold tracking-tight text-charcoal-900">Fresh drops from approved vendors</h3>
              </div>
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-saffron-500 text-charcoal-900">
                <Sparkles className="h-6 w-6" />
              </span>
            </div>

            <div className="mt-6 space-y-4">
              {loading
                ? Array.from({ length: 3 }).map((_, index) => <DishSkeleton key={index} />)
                : latest.length
                  ? latest.map((food) => <LatestDishRow key={food._id} food={food} onAdd={onAdd} />)
                  : (
                    <div className="rounded-[24px] border border-dashed border-saffron-200 bg-white/80 p-6 text-sm text-slate-500">
                      New dishes will appear here as soon as vendors publish their menus.
                    </div>
                  )}
            </div>
          </div>

          <div className={`grid gap-6 ${getPopularGridClassName(popular.length || 2)}`}>
            {loading
              ? Array.from({ length: 4 }).map((_, index) => <DishSkeleton key={index} />)
              : popular.length
                ? popular.map((food) => (
                  <article
                    key={food._id}
                    className="group overflow-hidden rounded-[30px] border border-saffron-100 bg-white shadow-card transition duration-300 hover:-translate-y-1.5 hover:border-saffron-200 hover:shadow-soft"
                  >
                    <div className="relative h-52 overflow-hidden">
                      <img
                        src={food.dishImage}
                        alt={food.name}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/70 via-transparent to-transparent" />
                      <button
                        type="button"
                        className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-500 shadow-sm transition hover:text-rose-500"
                        aria-label={`Save ${food.name}`}
                      >
                        <Heart className="h-5 w-5" />
                      </button>
                      {food.badge ? (
                        <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-charcoal-900/85 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
                          <Flame className="h-3.5 w-3.5 text-saffron-400" />
                          {food.badge}
                        </span>
                      ) : null}
                    </div>

                    <div className="p-5">
                      <p className="text-sm font-medium text-saffron-600">{food.vendorName}</p>
                      <h3 className="mt-2 text-xl font-semibold tracking-tight text-charcoal-900">{food.name}</h3>
                      <p className="mt-2 text-sm leading-7 text-slate-600">{food.shortDescription}</p>

                      <div className="mt-5 flex items-center justify-between gap-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Price</p>
                          <p className="mt-1 text-lg font-semibold text-charcoal-900">{formatCurrency(food.price)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => onAdd(food)}
                          disabled={food.isAvailable === false}
                          className="inline-flex items-center gap-2 rounded-full bg-saffron-500 px-4 py-2.5 text-sm font-semibold text-charcoal-900 transition hover:bg-saffron-400 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                        >
                          <Plus className="h-4 w-4" />
                          Add to cart
                        </button>
                      </div>
                    </div>
                  </article>
                ))
                : (
                  <div className="rounded-[30px] border border-dashed border-saffron-200 bg-white/70 p-10 text-center text-sm text-slate-500 md:col-span-2">
                    Popular dishes will appear here once orders start coming in.
                  </div>
                )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PopularDishes;