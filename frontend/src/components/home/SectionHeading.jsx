const SectionHeading = ({ label, title, subtitle, action }) => (
  <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div className="max-w-2xl">
      {label ? (
        <span className="inline-flex rounded-full border border-saffron-200 bg-saffron-100/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-saffron-600">
          {label}
        </span>
      ) : null}
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-charcoal-900 sm:text-4xl">{title}</h2>
      {subtitle ? <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">{subtitle}</p> : null}
    </div>
    {action ? <div className="shrink-0">{action}</div> : null}
  </div>
);

export default SectionHeading;