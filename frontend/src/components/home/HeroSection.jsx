import { ArrowRight, Clock3, MapPin, Search, Sparkles, Star } from "lucide-react";
import { Link } from "react-router-dom";

const HeroMetricCard = ({ item }) => (
  <div className="rounded-[28px] border border-saffron-100 bg-white/90 p-5 shadow-card backdrop-blur">
    <p className="text-3xl font-semibold tracking-tight text-charcoal-900">{item.value}</p>
    <p className="mt-2 text-sm font-medium text-charcoal-900">{item.label}</p>
    <p className="mt-1 text-sm leading-6 text-slate-600">{item.description}</p>
  </div>
);

const HeroSection = ({
  slide,
  metrics,
  searchValue,
  onSearchChange,
  onSearchSubmit,
  activeSlide,
  slides,
  onSelectSlide,
  featuredRestaurant,
  latestDish,
}) => {
  const headline = slide?.title || "Order local food you'll actually crave";
  const subtitle =
    slide?.subtitle || "Discover trusted local restaurants, popular dishes, and an ordering flow that feels clear from the first click.";

  return (
    <section className="relative overflow-hidden py-8 sm:py-10 lg:py-12">
      <div className="absolute inset-x-0 top-0 -z-10 h-[24rem] bg-hero-glow" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(420px,520px)] lg:items-stretch">
          <div className="rounded-[32px] border border-saffron-100 bg-white/90 p-6 shadow-soft backdrop-blur sm:p-8 lg:p-10">
            <span className="inline-flex items-center gap-2 rounded-full border border-saffron-200 bg-saffron-100/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-saffron-600">
              <Sparkles className="h-4 w-4" />
              {slide?.badge || "KhajaExpress"}
            </span>

            <h1 className="mt-6 max-w-xl text-4xl font-semibold leading-tight tracking-tight text-charcoal-900 sm:text-5xl lg:text-[3.45rem]">
              {headline}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">{subtitle}</p>

            <form onSubmit={onSearchSubmit} className="mt-8 rounded-[28px] border border-saffron-100 bg-cream-50 p-3 shadow-card">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex flex-1 items-center gap-3 rounded-[22px] border border-white bg-white px-4 py-3 shadow-sm">
                  <Search className="h-5 w-5 text-slate-400" />
                  <input
                    type="search"
                    value={searchValue}
                    onChange={(event) => onSearchChange(event.target.value)}
                    placeholder="Search restaurants, dishes, or categories"
                    className="w-full border-0 bg-transparent p-0 text-sm text-charcoal-900 placeholder:text-slate-400 focus:outline-none focus:ring-0"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-[22px] bg-charcoal-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-charcoal-800"
                >
                  Quick Search
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                to="/restaurants"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-saffron-500 px-6 py-3 text-sm font-semibold text-charcoal-900 transition hover:-translate-y-0.5 hover:bg-saffron-400"
              >
                Browse Restaurants
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#popular-dishes"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-charcoal-900 transition hover:-translate-y-0.5 hover:border-saffron-200 hover:text-saffron-600"
              >
                Explore Popular Dishes
              </a>
            </div>

            <div className="mt-8 flex flex-wrap gap-4 text-sm text-slate-600">
              <div className="inline-flex items-center gap-2 rounded-full bg-cream-100 px-4 py-2">
                <Star className="h-4 w-4 text-saffron-500" />
                Verified restaurant listings
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-cream-100 px-4 py-2">
                <Clock3 className="h-4 w-4 text-saffron-500" />
                Simple checkout and tracking
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-cream-100 px-4 py-2">
                <MapPin className="h-4 w-4 text-saffron-500" />
                Optimized for desktop and mobile
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[32px] border border-saffron-100 shadow-soft">
            <img
              src={slide?.imageUrl}
              alt={headline}
              className="h-[360px] w-full object-cover sm:h-[420px] lg:h-full"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-charcoal-900/85 via-charcoal-900/35 to-transparent" />

            <div className="absolute inset-0 flex flex-col justify-between p-5 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-charcoal-900 backdrop-blur">
                  {activeSlide + 1} / {slides.length}
                </div>
                {slides.length > 1 ? (
                  <div className="inline-flex items-center gap-2 rounded-full bg-black/25 px-3 py-2 backdrop-blur">
                    {slides.map((item, index) => (
                      <button
                        key={`${item.title}-${index}`}
                        type="button"
                        onClick={() => onSelectSlide(index)}
                        aria-label={`Slide ${index + 1}`}
                        className={`h-2.5 rounded-full transition-all ${index === activeSlide ? "w-7 bg-white" : "w-2.5 bg-white/45 hover:bg-white/75"}`}
                      />
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="space-y-4">
                <div className="max-w-sm text-white">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/75">Premium local delivery</p>
                  <p className="mt-3 text-2xl font-semibold leading-tight sm:text-3xl">Better browsing, stronger restaurant cards, faster conversion.</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {featuredRestaurant ? (
                    <div className="rounded-[26px] border border-white/10 bg-white/92 p-4 shadow-card backdrop-blur">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-saffron-600">Featured restaurant</p>
                      <p className="mt-2 text-lg font-semibold text-charcoal-900">{featuredRestaurant.restaurantName}</p>
                      <p className="mt-1 text-sm text-slate-600">{featuredRestaurant.cuisineLabel}</p>
                      <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
                        <span className="inline-flex items-center gap-1.5">
                          <Star className="h-4 w-4 text-saffron-500" />
                          {featuredRestaurant.rating}
                        </span>
                        <span>{featuredRestaurant.deliveryTime}</span>
                      </div>
                    </div>
                  ) : null}

                  {latestDish ? (
                    <div className="rounded-[26px] border border-white/10 bg-charcoal-900/75 p-4 text-white shadow-card backdrop-blur">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">Fresh today</p>
                      <p className="mt-2 text-lg font-semibold">{latestDish.name}</p>
                      <p className="mt-1 text-sm text-white/75">{latestDish.vendorName}</p>
                      <p className="mt-3 text-sm text-white/75">{latestDish.shortDescription}</p>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {metrics.map((item) => (
            <HeroMetricCard key={item.label} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;