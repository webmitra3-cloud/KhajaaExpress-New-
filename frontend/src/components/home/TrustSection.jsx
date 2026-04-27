import SectionHeading from "./SectionHeading";

const TrustSection = ({ items }) => (
  <section className="py-14 sm:py-16">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <SectionHeading
        label="Why choose us"
        title="Trust signals that make the marketplace feel credible"
        subtitle="Keep the logic simple, but communicate reliability with clear benefits around delivery, approval, payment, and tracking."
      />

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.title} className="rounded-[30px] border border-saffron-100 bg-white p-6 shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-soft">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cream-100 text-saffron-600">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="mt-5 text-xl font-semibold tracking-tight text-charcoal-900">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);

export default TrustSection;