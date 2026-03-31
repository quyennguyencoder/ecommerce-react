const BRAND_ICON = (
  <svg
    viewBox="0 0 48 48"
    aria-hidden="true"
    focusable="false"
    className="h-7 w-7"
  >
    <path
      d="M8 26c6.5-8 17.5-14 30-14-6.5 8-17.5 14-30 14Z"
      fill="currentColor"
    />
    <path
      d="M10 36c6-6 15-10 26-10-6 6-15 10-26 10Z"
      fill="currentColor"
      opacity="0.7"
    />
  </svg>
);

const FOOTER_LINKS = [
  {
    title: 'Company',
    links: ['About', 'Careers', 'Press', 'Blog'],
  },
  {
    title: 'Shop',
    links: ['All Products', 'Categories', 'New Arrivals', 'Best Sellers'],
  },
  {
    title: 'Support',
    links: ['Help Center', 'Returns', 'Shipping', 'Contact'],
  },
];

const SOCIALS = ['Facebook', 'Instagram', 'X', 'Youtube'];

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-300 gap-10 px-5 py-12 md:grid-cols-[1.2fr_repeat(3,1fr)]">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-slate-900">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100/60 text-indigo-600">
              {BRAND_ICON}
            </span>
            <div>
              <p className="text-base font-semibold">Ecom Store</p>
              <p className="text-sm text-slate-500">Curated products for modern living.</p>
            </div>
          </div>
          <p className="text-sm text-slate-600">
            Get the best deals and new arrivals delivered straight to your inbox.
          </p>
          <div className="flex max-w-sm items-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
            <input
              type="email"
              className="w-full border-0 bg-transparent px-3 py-2 text-sm text-slate-700 outline-none"
              placeholder="Email address"
            />
            <button
              type="button"
              className="bg-sky-200 px-4 py-2 text-sm font-semibold text-slate-900"
            >
              Subscribe
            </button>
          </div>
        </div>

        {FOOTER_LINKS.map((section) => (
          <div key={section.title} className="space-y-3">
            <p className="text-sm font-semibold text-slate-900">{section.title}</p>
            <ul className="space-y-2 text-sm text-slate-600">
              {section.links.map((link) => (
                <li key={link}>
                  <button
                    type="button"
                    className="transition hover:text-indigo-600"
                  >
                    {link}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto flex max-w-300 flex-col gap-4 px-5 py-5 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>2026 Ecom Store. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4">
            {SOCIALS.map((social) => (
              <button
                key={social}
                type="button"
                className="transition hover:text-indigo-600"
              >
                {social}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
