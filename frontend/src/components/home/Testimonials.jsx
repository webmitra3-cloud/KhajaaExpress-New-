import { Star } from "lucide-react";
import SectionHeading from "./SectionHeading";

const Testimonials = ({ testimonials, metrics }) => (
  <section className="py-14 sm:py-16">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <SectionHeading
        label="Social proof"
        title="Give the homepage more trust and product confidence"
        subtitle="A few strong customer quotes plus simple growth metrics make the landing page feel more like a real product and less like a bare demo."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((item) => (
            <article key={item.name} className="rounded-[30px] border border-saffron-100 bg-white p-6 shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-soft">
              <div className="flex items-center gap-1 text-saffron-500">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="mt-5 text-sm leading-7 text-slate-600">“{item.quote}”</p>
              <div className="mt-6 border-t border-saffron-100 pt-4">
                <p className="font-semibold text-charcoal-900">{item.name}</p>
                <p className="mt-1 text-sm text-slate-500">{item.role}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="grid gap-4">
          {metrics.map((metric) => (
            <div key={metric.label} className="rounded-[28px] border border-saffron-100 bg-gradient-to-br from-white to-cream-50 p-6 shadow-card">
              <p className="text-sm uppercase tracking-[0.22em] text-slate-400">{metric.label}</p>
              <p className="mt-4 text-4xl font-semibold tracking-tight text-charcoal-900">{metric.value}</p>
              <p className="mt-3 text-sm leading-7 text-slate-600">{metric.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default Testimonials;