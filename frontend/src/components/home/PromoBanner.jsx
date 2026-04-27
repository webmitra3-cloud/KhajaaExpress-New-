import { ArrowRight, BadgePercent } from "lucide-react";
import { Link } from "react-router-dom";

const PromoBanner = () => (
  <section id="offers" className="py-14 sm:py-16">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-[36px] bg-gradient-to-r from-charcoal-900 via-charcoal-800 to-saffron-600 px-6 py-8 text-white shadow-soft sm:px-8 sm:py-10 lg:px-12 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/80 backdrop-blur">
              <BadgePercent className="h-4 w-4" />
              Limited-time offer
            </span>
            <h2 className="mt-5 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">Get 20% off your first order and explore KhajaExpress with a stronger first impression.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/75 sm:text-base">
              Use this banner as your main conversion moment for new users. Keep the message short, visible, and paired with a direct action.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <Link
              to="/offers"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-charcoal-900 transition hover:-translate-y-0.5 hover:bg-cream-50"
            >
              View Offers
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/restaurants"
              className="inline-flex items-center justify-center rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-white/45 hover:bg-white/10"
            >
              Browse restaurants
            </Link>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default PromoBanner;
