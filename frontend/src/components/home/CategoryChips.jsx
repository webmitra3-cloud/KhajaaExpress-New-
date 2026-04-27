import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import SectionHeading from "./SectionHeading";

const CategoryCard = ({ category }) => {
  const Icon = category.icon;

  return (
    <Link
      to={`/restaurants?search=${encodeURIComponent(category.searchTerm)}`}
      className="group flex items-center gap-4 rounded-[28px] border border-saffron-100 bg-white px-4 py-4 shadow-card transition duration-300 hover:-translate-y-1 hover:border-saffron-200 hover:shadow-soft"
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cream-100 text-saffron-600 transition duration-300 group-hover:bg-saffron-500 group-hover:text-charcoal-900">
        <Icon className="h-6 w-6" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-base font-semibold text-charcoal-900">{category.label}</p>
        <p className="mt-1 text-sm text-slate-500">{category.count ? `${category.count} dishes to explore` : "Explore dishes and restaurants"}</p>
      </div>
      <ArrowRight className="h-5 w-5 text-slate-300 transition duration-300 group-hover:text-saffron-500" />
    </Link>
  );
};

const CategoryChipSkeleton = () => (
  <div className="flex animate-pulse items-center gap-4 rounded-[28px] border border-saffron-100 bg-white px-4 py-4 shadow-card">
    <div className="h-14 w-14 rounded-2xl bg-cream-100" />
    <div className="flex-1 space-y-2">
      <div className="h-4 w-24 rounded bg-slate-200" />
      <div className="h-3 w-36 rounded bg-slate-100" />
    </div>
  </div>
);

const CategoryChips = ({ categories, loading }) => (
  <section id="categories" className="py-14 sm:py-16">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <SectionHeading
        label="Quick categories"
        title="Start with what you feel like eating"
        subtitle="Popular cuisine shortcuts reduce browsing time and help customers jump straight into menus that match their cravings."
        action={
          <Link
            to="/categories"
            className="inline-flex items-center gap-2 rounded-full border border-saffron-200 bg-white px-5 py-3 text-sm font-semibold text-charcoal-900 transition hover:-translate-y-0.5 hover:border-saffron-300 hover:text-saffron-600"
          >
            View all categories
            <ArrowRight className="h-4 w-4" />
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading
          ? Array.from({ length: 8 }).map((_, index) => <CategoryChipSkeleton key={index} />)
          : categories.map((category) => <CategoryCard key={category.label} category={category} />)}
      </div>
    </div>
  </section>
);

export default CategoryChips;
