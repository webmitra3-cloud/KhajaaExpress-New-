import { ArrowRight, BadgePercent, Clock3, MapPin, Ticket } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { formatCurrency } from "../utils/formatters";

const formatOfferDate = (value) => {
  if (!value) {
    return "No expiry date";
  }

  const date = new Date(value);

  if (Number.isNaN(date.valueOf())) {
    return "No expiry date";
  }

  return `Valid until ${date.toLocaleDateString()}`;
};

const OffersPage = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const { data } = await api.get("/offers");
        setOffers(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  const sortedOffers = useMemo(
    () =>
      [...offers].sort((left, right) => {
        const leftDate = left.validUntil ? new Date(left.validUntil).getTime() : Number.MAX_SAFE_INTEGER;
        const rightDate = right.validUntil ? new Date(right.validUntil).getTime() : Number.MAX_SAFE_INTEGER;
        return leftDate - rightDate || new Date(right.createdAt || 0) - new Date(left.createdAt || 0);
      }),
    [offers]
  );

  return (
    <section className="page-section bg-[#fffdf7]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[38px] bg-gradient-to-r from-charcoal-900 via-charcoal-800 to-saffron-600 px-7 py-8 text-white shadow-soft sm:px-10 sm:py-10">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-3xl">
              <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-white/80">
                Live promotions
              </span>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Restaurant offers with a premium storefront feel
              </h1>
              <p className="mt-3 text-sm leading-7 text-white/75 sm:text-base">
                These promotions are added by approved vendors and surfaced here with clearer hierarchy, stronger card
                design, and direct restaurant actions.
              </p>
            </div>
            <div className="shrink-0">
              <Link
                to="/restaurants"
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-charcoal-900 transition hover:bg-cream-50"
              >
                Explore Restaurants
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-[24px] bg-white/12 p-5 backdrop-blur">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-white/70">Active Offers</span>
              <p className="mt-3 text-3xl font-semibold">{offers.length}</p>
            </div>
            <div className="rounded-[24px] bg-white/12 p-5 backdrop-blur">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-white/70">Restaurants</span>
              <p className="mt-3 text-3xl font-semibold">{new Set(offers.map((offer) => offer.vendor?._id).filter(Boolean)).size}</p>
            </div>
            <div className="rounded-[24px] bg-white/12 p-5 backdrop-blur">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-white/70">Promo Codes</span>
              <p className="mt-3 text-3xl font-semibold">{offers.filter((offer) => offer.code).length}</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="mt-8">
            <LoadingSpinner label="Loading offers..." />
          </div>
        ) : sortedOffers.length ? (
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {sortedOffers.map((offer, index) => (
              <article
                key={offer._id}
                className="group overflow-hidden rounded-[34px] border border-saffron-100 bg-white shadow-card transition duration-300 hover:-translate-y-1.5 hover:border-saffron-200 hover:shadow-soft"
              >
                <div className="grid h-full gap-0 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                  <div className={`relative min-h-[250px] overflow-hidden ${offer.imageUrl ? "" : index % 2 === 0 ? "bg-gradient-to-br from-[#fff3d4] via-[#fffaf0] to-[#ffd7a8]" : "bg-gradient-to-br from-[#ffe9df] via-white to-[#ffd1b0]"}`}>
                    {offer.imageUrl ? (
                      <img
                        src={offer.imageUrl || offer.vendor?.coverImageUrl || offer.vendor?.logoUrl}
                        alt={offer.title}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <div className="rounded-[28px] bg-white/70 p-6 backdrop-blur">
                          <BadgePercent className="h-16 w-16 text-charcoal-900" />
                        </div>
                      </div>
                    )}
                    <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full bg-charcoal-900/88 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-white">
                      <BadgePercent className="h-4 w-4 text-saffron-400" />
                      {offer.discountLabel}
                    </div>
                  </div>

                  <div className="flex flex-col justify-between p-6">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-saffron-600">{offer.vendor?.restaurantName || "Restaurant Offer"}</p>
                      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-charcoal-900">{offer.title}</h2>
                      <p className="mt-4 text-sm leading-7 text-slate-600">{offer.description || "A fresh promotion from one of the marketplace vendors."}</p>

                      <div className="mt-5 grid gap-3">
                        <div className="inline-flex items-center gap-2 rounded-full bg-cream-50 px-3 py-2 text-sm text-slate-600">
                          <Clock3 className="h-4 w-4 text-saffron-500" />
                          {formatOfferDate(offer.validUntil)}
                        </div>
                        <div className="inline-flex items-center gap-2 rounded-full bg-cream-50 px-3 py-2 text-sm text-slate-600">
                          <MapPin className="h-4 w-4 text-saffron-500" />
                          {offer.vendor?.address || "Kathmandu"}
                        </div>
                        <div className="inline-flex items-center gap-2 rounded-full bg-cream-50 px-3 py-2 text-sm text-slate-600">
                          <Ticket className="h-4 w-4 text-saffron-500" />
                          Minimum order {formatCurrency(offer.minimumOrder || 0)}
                        </div>
                        {offer.code ? (
                          <div className="inline-flex items-center gap-2 rounded-full bg-charcoal-900 px-3 py-2 text-sm font-semibold text-white">
                            Use code {offer.code}
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <Link to={`/restaurants/${offer.vendor?._id}`} className="button inline-button">
                        View Restaurant
                      </Link>
                      <Link to="/restaurants" className="button button-ghost inline-button">
                        Browse More Offers
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-[32px] border border-dashed border-saffron-200 bg-white p-10 text-center shadow-card">
            <h2 className="text-2xl font-semibold text-charcoal-900">No active offers right now</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">As soon as vendors publish promotions from their dashboard, they will appear here automatically.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link to="/restaurants" className="button inline-button">
                Browse Restaurants
              </Link>
              <Link to="/" className="button button-ghost inline-button">
                Back to Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default OffersPage;
