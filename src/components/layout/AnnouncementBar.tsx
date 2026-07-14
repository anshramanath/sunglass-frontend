import { getBrand, getBrands } from "@/lib/brand";

function Separator() {
  return <span className="mx-7 w-1 h-1 rounded-full shrink-0 inline-block" style={{ backgroundColor: "var(--color-brand)" }} />;
}

function Sequence({ messages }: { messages: readonly string[] }) {
  return (
    <>
      {messages.map((text, i) => (
        <span key={i} className="contents">
          <span className="text-[13px] text-grey-600 whitespace-nowrap">{text}</span>
          <Separator />
        </span>
      ))}
    </>
  );
}

export default function AnnouncementBar() {
  const brands = getBrands();
  const current = getBrand();
  const { announcements } = current;

  return (
    <div className="bg-grey-50 border-b border-grey-200">
      <div className="flex items-stretch h-9">

        <div className="flex items-stretch gap-6 pl-5 lg:pl-10 pr-6 shrink-0 relative z-10 bg-grey-50">
          {brands.map(({ shortName, slug, url }) => {
            const isActive = slug === current.slug;
            return isActive ? (
              <span key={slug} className="flex items-center text-[13px] font-medium whitespace-nowrap border-b-2" style={{ color: "var(--color-brand)", borderColor: "var(--color-brand)" }}>
                {shortName}
              </span>
            ) : (
              <a key={slug} href={url} className="flex items-center text-[13px] text-grey-500 hover:text-ink transition-colors duration-200 whitespace-nowrap">
                {shortName}
              </a>
            );
          })}
        </div>

        <div className="relative flex-1 overflow-hidden" style={{ maskImage: "linear-gradient(to right, transparent, black 2.5rem, black calc(100% - 2.5rem), transparent)" }}>
          <div className="flex items-center h-9 w-max announcement-marquee">
            <Sequence messages={announcements} />
            <Sequence messages={announcements} />
          </div>
        </div>

      </div>
    </div>
  );
}
