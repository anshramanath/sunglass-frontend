
const MESSAGES = [
  "Free Standard Shipping on All Orders Over $75",
  "Summer Clearance — Up to 50% Off",
  "New HD Polarized Lenses Just Dropped",
  "Lifetime Lens Warranty on Every Frame",
  "Free 30-Day Returns",
];

const BRANDS = [
  { label: "Monster", href: "#" },
  { label: "Biker",   href: "#" },
  { label: "proSPORT", href: "#" },
];

function Separator() {
  return <span className="mx-7 w-1 h-1 rounded-full bg-grey-300 shrink-0 inline-block" />;
}

function Sequence() {
  return (
    <>
      {MESSAGES.map((text, i) => (
        <span key={i} className="contents">
          <a href="#" className="text-[13px] text-grey-600 hover:text-ink transition-colors duration-200 whitespace-nowrap">{text}</a>
          <Separator />
        </span>
      ))}
    </>
  );
}

export default function AnnouncementBar() {
  return (
    <div className="bg-grey-50 border-b border-grey-200">
      <div className="flex items-stretch h-9">

        <div className="flex items-stretch gap-6 pl-5 lg:pl-10 pr-6 shrink-0 relative z-10 bg-grey-50">
          {BRANDS.map(({ label, href }, i) => {
            const isActive = i === 0;
            return isActive ? (
              <span key={label} className="flex items-center text-[13px] font-medium text-ink whitespace-nowrap border-b-2" style={{ borderColor: '#000' }}>
                {label}
              </span>
            ) : (
              <a key={label} href={href} className="flex items-center text-[13px] text-grey-500 hover:text-ink transition-colors duration-200 whitespace-nowrap">
                {label}
              </a>
            );
          })}
        </div>

        <div className="relative flex-1 overflow-hidden" style={{ maskImage: "linear-gradient(to right, transparent, black 2.5rem, black calc(100% - 2.5rem), transparent)" }}>
          <div className="flex items-center h-9 w-max announcement-marquee">
            <Sequence />
            <Sequence />
          </div>
        </div>

      </div>
    </div>
  );
}
