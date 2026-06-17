import Link from "next/link";
import Image from "next/image";
import { getCategories, getProducts } from "@/lib/api";
import { BRAND, BRAND_SLUG } from "@/lib/brand";
import { CategoryNode, ProductListItem } from "@/lib/types";
import { collectLeaves } from "@/lib/categoryUtils";
import { createClient } from "@/lib/supabase/server";
import HeaderIcons from "./HeaderIcons";

function CategoryLinks({ nodes, ancestors }: { nodes: CategoryNode[]; ancestors: CategoryNode[] }) {
  return (
    <>
      {nodes.map((node) =>
        node.children && node.children.length > 0 ? (
          <li key={node.id}>
            <p className="text-ink font-medium mb-3">{node.name}</p>
            <ul className="space-y-3 pl-4">
              <CategoryLinks nodes={node.children} ancestors={[...ancestors, node]} />
            </ul>
          </li>
        ) : (
          <li key={node.id}>
            <Link
              href={`/category/${[...ancestors, node].map((n) => n.slug).join("/")}`}
              className="hover:text-ink transition-colors duration-200"
            >
              {node.name}
            </Link>
          </li>
        )
      )}
    </>
  );
}

export default async function Navbar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isSignedIn = !!user;
  const categories = await getCategories(BRAND_SLUG).catch(() => []);

  let searchProducts: ProductListItem[] = [];
  const leaves = collectLeaves(categories);
  for (const { node } of leaves) {
    const data = await getProducts({ brandSlug: BRAND_SLUG, categoryId: node.id, size: 6 }).catch(() => null);
    if (data && data.totalProducts >= 6) {
      searchProducts = data.products.slice(0, 6);
      break;
    }
  }

  return (
    <header className="sticky top-0 z-40 bg-paper border-b border-grey-200">
      <div className="mx-auto max-w-[1680px] px-5 lg:px-10">
        <div className="h-16 flex items-center gap-6 xl:gap-9">
          <Link href="/" className="shrink-0" aria-label={`${BRAND.name} home`}>
            <Image src={BRAND.logo} alt={BRAND.name} width={120} height={28} className="h-7" style={{ width: "auto" }} />
          </Link>

          <ul className="hidden lg:flex items-center gap-6 xl:gap-7">
            {categories.map((cat) => (
              <li key={cat.id} className="group relative h-16 flex items-center">
                {cat.children && cat.children.length > 0 ? (
                  <>
                    <span className="block py-1 whitespace-nowrap text-[15px] font-medium cursor-default hover:underline underline-offset-[6px] decoration-1 decoration-ink">
                      {cat.name}
                    </span>
                    <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity duration-200 absolute left-0 top-full z-50 bg-paper border border-grey-150 shadow-pop">
                      <div className="px-9 py-8 min-w-[180px]">
                        <ul className="space-y-4 text-[16px] text-grey-600">
                          <CategoryLinks nodes={cat.children} ancestors={[cat]} />
                        </ul>
                      </div>
                    </div>
                  </>
                ) : (
                  <Link href={`/category/${cat.slug}`} className="block py-1 whitespace-nowrap text-[15px] font-medium hover:underline underline-offset-[6px] decoration-1 decoration-ink">
                    {cat.name}
                  </Link>
                )}
              </li>
            ))}
            <li className="h-16 flex items-center">
              <Link href="/sale" className="block py-0.5 whitespace-nowrap text-[13px] font-medium text-white px-2 rounded-sm" style={{ backgroundColor: BRAND.accent }}>
                Sale
              </Link>
            </li>
          </ul>

          <HeaderIcons isSignedIn={isSignedIn} searchProducts={searchProducts} />
        </div>
      </div>
    </header>
  );
}
