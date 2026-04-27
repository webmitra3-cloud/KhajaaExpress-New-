import { ArrowRight, ChefHat, Shapes, Sparkles, Store } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import LoadingSpinner from "../components/common/LoadingSpinner";
import SectionHeading from "../components/home/SectionHeading";
import { homepageCategories } from "../data/homepage";

const resolveCategoryIcon = (name = "") => {
  const normalizedName = String(name).toLowerCase();
  const matchedCategory = homepageCategories.find(
    (category) =>
      normalizedName.includes(category.label.toLowerCase()) ||
      category.keywords.some((keyword) => normalizedName.includes(keyword))
  );

  return matchedCategory?.icon || ChefHat;
};

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get("/categories");
        setCategories(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const sortedCategories = useMemo(
    () =>
      [...categories].sort(
        (left, right) =>
          (right.vendorCount || 0) - (left.vendorCount || 0) ||
          (right.foodCount || 0) - (left.foodCount || 0) ||
          left.name.localeCompare(right.name)
      ),
    [categories]
  );

  return (
    <section className="page-section bg-[#fffdf7]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[36px] border border-saffron-100 bg-gradient-to-br from-[#fff7df] via-white to-[#ffe7bf] p-7 shadow-card sm:p-10">
          <SectionHeading
            label="Category discovery"
            title="Vendor-created categories in a clearer, more premium catalog view"
            subtitle="Every category below was added from the vendor side and is surfaced here with stronger visual hierarchy, restaurant coverage, and a direct path into browsing."
            action={
              <Link to="/restaurants" className="button inline-button">
                Browse Restaurants
              </Link>
            }
          />

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-[26px] bg-white/85 p-5 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-saffron-600">Categories</span>
              <p className="mt-3 text-3xl font-semibold text-charcoal-900">{categories.length}</p>
            </div>
            <div className="rounded-[26px] bg-white/85 p-5 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-saffron-600">Vendor-created</span>
              <p className="mt-3 text-3xl font-semibold text-charcoal-900">
                {categories.filter((category) => category.createdByVendor).length}
              </p>
            </div>
            <div className="rounded-[26px] bg-white/85 p-5 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-saffron-600">Food listings</span>
              <p className="mt-3 text-3xl font-semibold text-charcoal-900">
                {categories.reduce((total, category) => total + Number(category.foodCount || 0), 0)}
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="mt-8">
            <LoadingSpinner label="Loading categories..." />
          </div>
        ) : sortedCategories.length ? (
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {sortedCategories.map((category, index) => {
              const Icon = resolveCategoryIcon(category.name);

              return (
                <article
                  key={category._id}
                  className={`group overflow-hidden rounded-[32px] border bg-white shadow-card transition duration-300 hover:-translate-y-1.5 hover:shadow-soft ${
                    index % 3 === 0 ? "border-saffron-200" : "border-slate-200"
                  }`}
                >
                  <div className={`p-6 ${index % 2 === 0 ? "bg-gradient-to-br from-[#fffaf0] to-white" : "bg-gradient-to-br from-[#fff4ec] to-white"}`}>
                    <div className="flex items-start justify-between gap-4">
                      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-charcoal-900 text-white shadow-sm">
                        <Icon className="h-6 w-6" />
                      </span>
                      <span className="inline-flex rounded-full bg-saffron-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-saffron-700">
                        {(category.vendorCount || 0) > 1 ? "Shared" : "Special"}
                      </span>
                    </div>

                    <h2 className="mt-5 text-2xl font-semibold tracking-tight text-charcoal-900">{category.name}</h2>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      {category.createdByVendor
                        ? `Originally added by ${category.createdByVendor.restaurantName} and now available across the marketplace.`
                        : `Created by ${category.createdBy?.name || "a platform vendor"} and available for restaurant menus.`}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm text-slate-600 shadow-sm">
                        <Shapes className="h-4 w-4 text-saffron-500" />
                        {category.foodCount || 0} food items
                      </span>
                      <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm text-slate-600 shadow-sm">
                        <Store className="h-4 w-4 text-saffron-500" />
                        {category.vendorCount || 0} vendors
                      </span>
                      <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm text-slate-600 shadow-sm">
                        <Sparkles className="h-4 w-4 text-saffron-500" />
                        {category.createdByVendor?.restaurantName || category.createdBy?.name || "Marketplace"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 border-t border-slate-100 px-6 py-5">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Explore</p>
                      <p className="mt-1 text-sm text-slate-600">Browse restaurants serving this category.</p>
                    </div>
                    <Link
                      to={`/restaurants?search=${encodeURIComponent(category.name)}`}
                      className="inline-flex items-center gap-2 rounded-full bg-charcoal-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-charcoal-800"
                    >
                      View Menus
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mt-8 rounded-[32px] border border-dashed border-saffron-200 bg-white p-10 text-center shadow-card">
            <h2 className="text-2xl font-semibold text-charcoal-900">No categories available yet</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">As vendors add categories from their dashboard, they will appear here automatically.</p>
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

export default CategoriesPage;
