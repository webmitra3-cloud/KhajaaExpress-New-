import { Link } from "react-router-dom";
import { footerGroups, socialLinks } from "../../data/homepage";

const FooterLink = ({ item }) => {
  if (item.href) {
    return (
      <a href={item.href} className="text-sm text-slate-500 transition hover:text-charcoal-900">
        {item.label}
      </a>
    );
  }

  return (
    <Link to={item.to} className="text-sm text-slate-500 transition hover:text-charcoal-900">
      {item.label}
    </Link>
  );
};

const Footer = () => (
  <footer className="mt-16 border-t border-saffron-100 bg-white/90">
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-saffron-500 text-base font-semibold text-charcoal-900">KE</span>
            <div>
              <p className="text-lg font-semibold tracking-tight text-charcoal-900">KhajaExpress</p>
              <p className="text-sm text-slate-500">Premium multi-vendor food ordering marketplace</p>
            </div>
          </div>
          <p className="mt-5 max-w-xl text-sm leading-7 text-slate-600">
            KhajaExpress helps users discover approved local restaurants, browse better menu cards, place orders easily, and track delivery progress with less friction.
          </p>

          <div className="mt-6 flex items-center gap-3">
            {socialLinks.map((item) => {
              const Icon = item.icon;

              return (
                <a
                  key={item.label}
                  href={item.href}
                  aria-label={item.label}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-saffron-100 bg-cream-50 text-slate-500 transition hover:border-saffron-200 hover:text-saffron-600"
                >
                  <Icon className="h-5 w-5" />
                </a>
              );
            })}
          </div>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          {footerGroups.map((group) => (
            <div key={group.title}>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">{group.title}</p>
              <div className="mt-4 grid gap-3">
                {group.links.map((item) => (
                  <FooterLink key={item.label} item={item} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10 flex flex-col gap-3 border-t border-saffron-100 pt-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} KhajaExpress. All rights reserved.</p>
        <p>Built with the MERN stack for a polished multi-vendor ordering experience.</p>
      </div>
    </div>
  </footer>
);

export default Footer;