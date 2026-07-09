import { getBrand } from "@/lib/brand";

export default function AboutPage() {
  const { name } = getBrand();

  return (
    <main className="flex-1 px-5 py-16 lg:py-24">
      <div className="mx-auto max-w-[620px]">
        <p className="text-[13px] uppercase tracking-wider text-grey-400 font-medium text-center">Our Story</p>
        <h1 className="text-[34px] lg:text-[56px] font-normal tracking-[-0.01em] text-center mt-3 leading-tight">Built for the ride, not the showroom.</h1>

        <div className="mt-12 space-y-6 text-[18px] text-grey-700 leading-relaxed">
          <p>{name} started on the back of a motorcycle. Our founder was three years into daily riding and still hadn&apos;t found a pair of sunglasses that could survive it — lenses that fogged at every stoplight, frames that slid down the second the road got rough, foam padding that fell apart after one wet commute. Everything marketed as &ldquo;sport&rdquo; was really just fashion eyewear with a racing stripe on the box.</p>
          <p>So we built our own, starting with the Airspeed — a full-coverage frame with amber copper lenses cut for glare on an open road, tested on the same routes we rode every day. From there came the BikerArmour line: foam-padded goggles and cover-overs made to seal out wind and debris on long rides, not just look tough in a product photo. Everything we&apos;ve made since — for cycling, running, fishing, driving — has followed the same rule: it has to earn its place on your face before it earns a place on our site.</p>
          <p>We&apos;re still a small team, and we still test every lens tint and every hinge ourselves before it ships. No influencer drops, no seasonal fashion colors — just frames built to take the miles.</p>
          <p className="text-ink">That&apos;s the whole idea: gear that keeps up, so you can too.</p>
        </div>
      </div>
    </main>
  );
}
